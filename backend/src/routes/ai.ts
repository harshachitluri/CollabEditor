import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/ai/chat — streaming chat via OpenRouter (free tier, no billing needed)
// Falls back to Gemini direct if OPENROUTER_API_KEY not set
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, code, language } = req.body as {
    messages: { role: 'user' | 'model'; content: string }[];
    code?: string;
    language?: string;
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openrouterKey && !geminiKey) {
    res.write(
      'data: ' +
        JSON.stringify({
          text: '⚠️ No AI API key configured. Set OPENROUTER_API_KEY in backend .env',
        }) +
        '\n\n',
    );
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  const SYSTEM_PROMPT = `You are an expert AI coding assistant embedded inside CollabCode, a real-time collaborative code editor.
Your role is to:
- Help debug errors and explain what went wrong clearly
- Explain code step by step in plain English
- Suggest improvements, refactors, and best practices
- Generate working code snippets when asked
- Answer general programming questions

When the user shares code context, refer to it naturally in your response.
Format code using triple backticks with the language name.
Be concise, clear, and friendly. If unsure, say so honestly.`;

  // Build the last user message (with optional code context)
  const lastMsg = messages[messages.length - 1];
  let userContent = lastMsg?.content ?? '';
  if (code && code.trim()) {
    userContent = `Here is my current code (${language ?? 'unknown'}):\n\`\`\`${language ?? ''}\n${code.trim()}\n\`\`\`\n\n${userContent}`;
  }

  // Convert messages to OpenAI format (OpenRouter uses OpenAI-compatible API)
  // Gemini uses 'model' role, OpenAI uses 'assistant' — map accordingly
  const firstUserIdx = messages.findIndex((m) => m.role === 'user');
  const historyMsgs = firstUserIdx >= 0 ? messages.slice(firstUserIdx, -1) : [];

  const openAIMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historyMsgs.map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: userContent },
  ];

  try {
    // Use OpenRouter if key available, otherwise try Gemini via OpenRouter-compatible endpoint
    const apiUrl = openrouterKey
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openrouterKey ?? geminiKey}`,
    };

    if (openrouterKey) {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'CollabCode AI Assistant';
    }

    // Pick model based on which key we're using
    const model = openrouterKey
      ? 'google/gemini-2.0-flash-lite-001' // Free working model on OpenRouter
      : 'gemini-2.0-flash';

    const fetchRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: openAIMessages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!fetchRes.ok || !fetchRes.body) {
      const errText = await fetchRes.text();
      console.error('[AI] API error:', errText);
      res.write(
        'data: ' +
          JSON.stringify({ text: `⚠️ AI error: ${fetchRes.status} — ${errText.slice(0, 200)}` }) +
          '\n\n',
      );
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const reader = fetchRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n');
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            res.write('data: ' + JSON.stringify({ text }) + '\n\n');
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  } catch (err: unknown) {
    console.error('[AI] Stream error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.write('data: ' + JSON.stringify({ text: `\n\n⚠️ AI error: ${msg}` }) + '\n\n');
    res.write('data: [DONE]\n\n');
  }

  res.end();
});

// Legacy POST /api/ai — mock for backwards compatibility
router.post('/', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const tokens = [
    'Use',
    'the',
    '🤖 AI',
    'button',
    'in',
    'the',
    'room',
    'header',
    'for',
    'full',
    'AI',
    'assistance!',
  ];
  for (const t of tokens) {
    res.write(t + ' ');
    await new Promise((r) => setTimeout(r, 60));
  }
  res.end();
});

export default router;
