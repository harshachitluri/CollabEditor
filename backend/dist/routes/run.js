"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const PISTON_URL = 'https://emkc.org/api/v2/piston';
// Language → Piston runtime mapping
const LANGUAGE_MAP = {
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
router.post('/', async (req, res) => {
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
        const response = await fetch(`${PISTON_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: runtime.language,
                version: runtime.version,
                files: [{ content: code }],
            }),
        });
        const data = await response.json();
        res.json({
            stdout: data.run.stdout,
            stderr: data.run.stderr,
            exitCode: data.run.code,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Execution service unavailable' });
    }
});
exports.default = router;
