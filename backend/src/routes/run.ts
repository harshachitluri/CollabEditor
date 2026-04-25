import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';
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
  const { code, language, input } = req.body;
  
  if (!code || !language) {
    res.status(400).json({ error: 'code and language are required' });
    return;
  }

  const fileId = uuidv4();
  let fileName = '';
  let command = '';
  let args: string[] = [];
  let isCpp = false;

  // Configure local runners
  switch (language) {
    case 'javascript':
    case 'typescript':
      fileName = `${fileId}.js`;
      command = 'node';
      break;
    case 'python':
      fileName = `${fileId}.py`;
      command = 'python3';
      break;
    case 'cpp':
    case 'c++':
      fileName = `${fileId}.cpp`;
      command = 'g++';
      isCpp = true;
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
  const executablePath = path.join(TEMP_DIR, `${fileId}`);
  
  // For C++, compile first then execute
  if (isCpp) {
    args = [`"${filePath}"`, '-o', `"${executablePath}"`];
  } else {
    args = [filePath];
  }

  try {
    fs.writeFileSync(filePath, code);

    let stdout = '';
    let stderr = '';

    // Function to clean up files
    const cleanup = () => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      if (isCpp) {
        try { fs.unlinkSync(executablePath); } catch (e) {}
      }
    };

    // For C++, first compile then execute
    if (isCpp) {
      const compileProc = spawn('g++', [filePath, '-o', executablePath], { timeout: 10000 });
      
      let compileStderr = '';
      compileProc.stderr?.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProc.on('close', (exitCode) => {
        if (exitCode !== 0) {
          cleanup();
          res.json({
            stdout: '',
            stderr: compileStderr.trim(),
            exitCode: exitCode || 1,
          });
          return;
        }

        // Compilation successful, now execute
        const execProc = spawn(executablePath, [], { timeout: 5000 });

        execProc.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        execProc.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        execProc.on('close', (exitCode) => {
          cleanup();
          res.json({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: exitCode || 0,
          });
        });

        execProc.on('error', (err) => {
          cleanup();
          res.status(500).json({ error: err.message });
        });

        // Send input if provided
        if (input) {
          execProc.stdin?.write(input);
          execProc.stdin?.end();
        }
      });

      compileProc.on('error', (err) => {
        cleanup();
        res.status(500).json({ error: err.message });
      });
    } else {
      // For other languages (Python, JS, TS)
      const proc = spawn(command, args, { timeout: 5000 });

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (exitCode) => {
        // Clean up file
        try { fs.unlinkSync(filePath); } catch (e) {}

        res.json({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: exitCode || 0,
        });
      });

      proc.on('error', (err) => {
        try { fs.unlinkSync(filePath); } catch (e) {}
        res.status(500).json({ error: err.message });
      });

      // Send input if provided (for stdin)
      if (input) {
        proc.stdin?.write(input);
        proc.stdin?.end();
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate execution' });
  }
});

export default router;
