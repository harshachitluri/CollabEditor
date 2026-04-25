import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/ai
router.post('/', async (req: Request, res: Response) => {
  const { action, code, query } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendToken = (token: string) => {
    res.write(token);
  };

  // Mock AI streaming logic
  const mockResponses: Record<string, string[]> = {
    explain: [
      "This code initializes a collaborative document using Yjs.\n\n",
      "1. `Y.Doc()` creates a new shared document state.\n",
      "2. `WebsocketProvider` connects this state to a remote server for real-time synchronization.\n",
      "3. The `MonacoBinding` links the Yjs text type to the Monaco editor's content model.\n\n",
      "This ensures all connected users see the same content without conflicts."
    ],
    refactor: [
      "Here is a refactored version of your code:\n\n",
      "```typescript\n",
      "const syncDocument = (slug: string) => {\n",
      "  const doc = new Y.Doc();\n",
      "  const provider = new WebsocketProvider(WS_URL, slug, doc);\n",
      "  return { doc, provider };\n",
      "};\n",
      "```\n\n",
      "I've modularized the sync logic into a reusable function."
    ]
  };

  const response = mockResponses[action] || ["I'm here to help with your code! How can I assist you today?"];

  for (const chunk of response) {
    const tokens = chunk.split(' ');
    for (const token of tokens) {
      sendToken(token + ' ');
      await new Promise(r => setTimeout(r, 50));
    }
    await new Promise(r => setTimeout(r, 200));
  }

  res.end();
});

export default router;
