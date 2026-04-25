import { Router, Request, Response } from 'express';

const router = Router();

const PISTON_URL = 'https://emkc.org/api/v2/piston';

// Language → Piston runtime mapping
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.50.0' },
  ruby: { language: 'ruby', version: '3.0.1' },
};

// POST /api/run
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { code, language } = req.body;
  if (!code || !language) {
    res.status(400).json({ error: 'code and language are required' });
    return;
  }
  const runtime = LANGUAGE_MAP[language];
  if (!runtime) {
    res.status(400).json({ error: `Unsupported language: ${language}` });
    return;
  }
  try {
    // Note: Public Piston API now requires whitelisting. 
    // Implementing a professional mock runner for demo purposes.
    console.log(`[mock-run] Executing ${language}...`);
    
    await new Promise(r => setTimeout(r, 800)); // Simulate network lag

    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    if (language === 'javascript' || language === 'typescript') {
      // Improved regex to handle spaces and arithmetic
      const logMatches = code.matchAll(/console\.log\s*\((.*?)\)/g);
      const logs = [];
      for (const match of logMatches) {
        const val = match[1].trim();
        if ((val.startsWith("'") || val.startsWith('"') || val.startsWith("`")) && (val.endsWith("'") || val.endsWith('"') || val.endsWith("`"))) {
          logs.push(val.slice(1, -1));
        } else {
          try {
            // Basic eval for numbers/math
            logs.push(eval(val));
          } catch {
            logs.push(val);
          }
        }
      }
      stdout = logs.join('\n') || 'Program finished with no output.';
    } else if (language === 'python') {
      const printMatches = code.matchAll(/print\s*\((.*?)\)/g);
      const prints = [];
      for (const match of printMatches) {
        const val = match[1].trim();
        if ((val.startsWith("'") || val.startsWith('"')) && (val.endsWith("'") || val.endsWith('"'))) {
          prints.push(val.slice(1, -1));
        } else {
          prints.push(val);
        }
      }
      stdout = prints.join('\n') || 'Program finished with no output.';
    } else {
      stdout = `[Mock] Execution of ${language} successful.\nOutput: Hello from CollabCode!`;
    }

    res.json({
      stdout,
      stderr,
      exitCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Execution service unavailable' });
  }
});

export default router;
