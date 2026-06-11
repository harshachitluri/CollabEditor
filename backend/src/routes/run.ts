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
  let isCompiled = false;
  let execPath = '';
  let workDir = TEMP_DIR;

  // Configure local runners
  switch (language) {
    case 'javascript':
      fileName = `${fileId}.js`;
      command = 'node';
      break;
    case 'python':
      fileName = `${fileId}.py`;
      try {
        const { execSync } = require('child_process');
        execSync('python3 --version', { stdio: 'ignore' });
        command = 'python3';
      } catch {
        command = 'python';
      }
      break;
    case 'java':
      // Java requires the file to match the public class name (usually Main)
      workDir = path.join(TEMP_DIR, fileId);
      fs.mkdirSync(workDir, { recursive: true });
      fileName = `Main.java`;
      command = 'java';
      break;
    case 'c': {
      const { execSync: execSyncC } = require('child_process');
      try {
        execSyncC('gcc --version', { stdio: 'ignore' });
        fileName = `${fileId}.c`;
        command = 'gcc';
        isCompiled = true;
      } catch {
        res.json({ stdout: '', stderr: 'gcc compiler not found.', exitCode: 1 });
        return;
      }
      break;
    }
    case 'cpp':
    case 'c++': {
      const { execSync: execSyncCpp } = require('child_process');
      try {
        execSyncCpp('g++ --version', { stdio: 'ignore' });
        fileName = `${fileId}.cpp`;
        command = 'g++';
        isCompiled = true;
      } catch {
        try {
          execSyncCpp('gcc --version', { stdio: 'ignore' });
          fileName = `${fileId}.cpp`;
          command = 'gcc';
          isCompiled = true;
        } catch {
          res.json({ stdout: '', stderr: 'g++ compiler not found.', exitCode: 1 });
          return;
        }
      }
      break;
    }
    default:
      res.json({
        stdout: '',
        stderr: `Language ${language} is not supported. Supported: javascript, python, c, cpp, java`,
        exitCode: 1,
      });
      return;
  }

  const filePath = path.join(workDir, fileName);
  if (isCompiled) {
    execPath = path.join(workDir, `${fileId}`);
    args = [filePath, '-o', execPath];
  } else {
    if (language === 'python') {
      args = ['-u', filePath]; // Unbuffered output for Python
    } else {
      args = [filePath];
    }
  }

  try {
    fs.writeFileSync(filePath, code);

    let stdout = '';
    let stderr = '';

    const cleanup = () => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      if (isCompiled) {
        try { fs.unlinkSync(execPath); } catch (e) {}
      }
      if (language === 'java') {
        try { fs.rmdirSync(workDir); } catch (e) {}
      }
    };

    if (isCompiled) {
      const compileProc = spawn(command, args, { timeout: 10000 });
      let compileStderr = '';
      
      compileProc.stderr?.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProc.on('close', (exitCode) => {
        if (exitCode !== 0) {
          cleanup();
          res.json({ stdout: '', stderr: compileStderr.trim(), exitCode: exitCode || 1 });
          return;
        }

        const execProc = spawn(execPath, [], { timeout: 5000 });

        execProc.stdout?.on('data', (data) => {
          stdout += data.toString();
          if (stdout.length > 50000) execProc.kill();
        });

        execProc.stderr?.on('data', (data) => {
          stderr += data.toString();
          if (stderr.length > 50000) execProc.kill();
        });

        execProc.on('close', (exitCode) => {
          cleanup();
          res.json({
            stdout: stdout.length > 50000 ? stdout.substring(0, 50000) + '\\n...[Output Truncated]' : stdout.trim(),
            stderr: stderr.length > 50000 ? stderr.substring(0, 50000) + '\\n...[Error Truncated]' : stderr.trim(),
            exitCode: exitCode || 0,
          });
        });

        execProc.on('error', (err: any) => {
          cleanup();
          res.json({ stdout: '', stderr: err.message || 'Execution failed', exitCode: 1 });
        });

        if (input) {
          execProc.stdin?.write(input);
        }
        execProc.stdin?.end();
      });
    } else {
      const proc = spawn(command, args, { timeout: 5000 });

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (stdout.length > 50000) proc.kill();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (stderr.length > 50000) proc.kill();
      });

      proc.on('close', (exitCode) => {
        cleanup();
        res.json({
          stdout: stdout.length > 50000 ? stdout.substring(0, 50000) + '\\n...[Output Truncated]' : stdout.trim(),
          stderr: stderr.length > 50000 ? stderr.substring(0, 50000) + '\\n...[Error Truncated]' : stderr.trim(),
          exitCode: exitCode || 0,
        });
      });

      proc.on('error', (err: any) => {
        cleanup();
        res.json({ stdout: '', stderr: err.message || 'Execution failed', exitCode: 1 });
      });

      if (input) {
        proc.stdin?.write(input);
      }
      proc.stdin?.end();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate execution' });
  }
});

export default router;
