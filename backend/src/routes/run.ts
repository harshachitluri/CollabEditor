import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const TEMP_DIR = path.join(__dirname, '../../temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// POST /api/run
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { code, language } = req.body;
  
  if (!code || !language) {
    res.status(400).json({ error: 'code and language are required' });
    return;
  }

  const fileId = uuidv4();
  let fileName = '';
  let command = '';

  // Configure local runners
  switch (language) {
    case 'javascript':
    case 'typescript':
      fileName = `${fileId}.js`;
      command = `node ${fileName}`;
      break;
    case 'python':
      fileName = `${fileId}.py`;
      command = `python ${fileName}`;
      break;
    default:
      res.json({ 
        stdout: `[Notice] Real execution for ${language} requires a local compiler.`,
        stderr: '',
        exitCode: 0 
      });
      return;
  }

  const filePath = path.join(TEMP_DIR, fileName);

  try {
    fs.writeFileSync(filePath, code);

    exec(command, { cwd: TEMP_DIR, timeout: 5000 }, (error, stdout, stderr) => {
      // Clean up file
      try { fs.unlinkSync(filePath); } catch (e) {}

      res.json({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: error ? error.code : 0,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate execution' });
  }
});

export default router;
