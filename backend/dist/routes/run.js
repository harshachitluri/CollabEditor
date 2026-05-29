"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
const TEMP_DIR = path_1.default.join(__dirname, '../../temp');
if (!fs_1.default.existsSync(TEMP_DIR)) {
    fs_1.default.mkdirSync(TEMP_DIR, { recursive: true });
}
// POST /api/run
router.post('/', async (req, res) => {
    const { code, language, input } = req.body;
    if (!code || !language) {
        res.status(400).json({ error: 'code and language are required' });
        return;
    }
    const fileId = (0, uuid_1.v4)();
    let fileName = '';
    let command = '';
    let args = [];
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
            // Try python3 first, fall back to python
            try {
                const { execSync } = require('child_process');
                execSync('python3 --version', { stdio: 'ignore' });
                command = 'python3';
            }
            catch {
                command = 'python';
            }
            break;
        case 'c': {
            const { execSync: execSyncC } = require('child_process');
            try {
                execSyncC('gcc --version', { stdio: 'ignore' });
                fileName = `${fileId}.c`;
                command = 'gcc';
                isCpp = true; // reuse the compile-then-run path
            }
            catch {
                res.json({
                    stdout: '',
                    stderr: 'gcc compiler not found. Please install Xcode Command Line Tools: xcode-select --install',
                    exitCode: 1,
                });
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
                isCpp = true;
            }
            catch {
                // g++ not found — try gcc as fallback for C++
                try {
                    execSyncCpp('gcc --version', { stdio: 'ignore' });
                    fileName = `${fileId}.cpp`;
                    command = 'gcc';
                    isCpp = true;
                }
                catch {
                    res.json({
                        stdout: '',
                        stderr: 'g++ compiler not found. Please install build tools.',
                        exitCode: 1,
                    });
                    return;
                }
            }
            break;
        }
        default:
            res.json({
                stdout: `[Notice] Real execution for ${language} requires a local compiler.\nSupported languages: JavaScript, TypeScript, Python, C, C++`,
                stderr: '',
                exitCode: 0,
            });
            return;
    }
    const filePath = path_1.default.join(TEMP_DIR, fileName);
    const executablePath = path_1.default.join(TEMP_DIR, `${fileId}`);
    // For C++, compile first then execute
    if (isCpp) {
        args = [`"${filePath}"`, '-o', `"${executablePath}"`];
    }
    else {
        args = [filePath];
    }
    try {
        fs_1.default.writeFileSync(filePath, code);
        let stdout = '';
        let stderr = '';
        // Function to clean up files
        const cleanup = () => {
            try {
                fs_1.default.unlinkSync(filePath);
            }
            catch (e) { }
            if (isCpp) {
                try {
                    fs_1.default.unlinkSync(executablePath);
                }
                catch (e) { }
            }
        };
        // For C++, first compile then execute
        if (isCpp) {
            const compileProc = (0, child_process_1.spawn)('g++', [filePath, '-o', executablePath], { timeout: 10000 });
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
                const execProc = (0, child_process_1.spawn)(executablePath, [], { timeout: 5000 });
                execProc.stdout?.on('data', (data) => {
                    stdout += data.toString();
                    if (stdout.length > 50000)
                        execProc.kill();
                });
                execProc.stderr?.on('data', (data) => {
                    stderr += data.toString();
                    if (stderr.length > 50000)
                        execProc.kill();
                });
                execProc.on('close', (exitCode) => {
                    cleanup();
                    res.json({
                        stdout: stdout.length > 50000 ? stdout.substring(0, 50000) + '\n...[Output Truncated]' : stdout.trim(),
                        stderr: stderr.length > 50000 ? stderr.substring(0, 50000) + '\n...[Error Truncated]' : stderr.trim(),
                        exitCode: exitCode || 0,
                    });
                });
                execProc.on('error', (err) => {
                    cleanup();
                    res.json({
                        stdout: '',
                        stderr: err.message || 'Execution failed',
                        exitCode: 1,
                    });
                });
                // Send input if provided
                if (input) {
                    execProc.stdin?.write(input);
                    execProc.stdin?.end();
                }
            });
            compileProc.on('error', (err) => {
                cleanup();
                res.json({
                    stdout: '',
                    stderr: err.message || 'Compilation failed',
                    exitCode: 1,
                });
            });
        }
        else {
            // For other languages (Python, JS, TS)
            const proc = (0, child_process_1.spawn)(command, args, { timeout: 5000 });
            proc.stdout?.on('data', (data) => {
                stdout += data.toString();
                if (stdout.length > 50000)
                    proc.kill();
            });
            proc.stderr?.on('data', (data) => {
                stderr += data.toString();
                if (stderr.length > 50000)
                    proc.kill();
            });
            proc.on('close', (exitCode) => {
                // Clean up file
                try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch (e) { }
                res.json({
                    stdout: stdout.length > 50000 ? stdout.substring(0, 50000) + '\n...[Output Truncated]' : stdout.trim(),
                    stderr: stderr.length > 50000 ? stderr.substring(0, 50000) + '\n...[Error Truncated]' : stderr.trim(),
                    exitCode: exitCode || 0,
                });
            });
            proc.on('error', (err) => {
                try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch (e) { }
                res.json({
                    stdout: '',
                    stderr: err.message || 'Execution failed',
                    exitCode: 1,
                });
            });
            // Send input if provided (for stdin)
            if (input) {
                proc.stdin?.write(input);
                proc.stdin?.end();
            }
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to initiate execution' });
    }
});
exports.default = router;
