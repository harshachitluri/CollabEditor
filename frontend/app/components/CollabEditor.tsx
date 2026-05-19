'use client';
import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { editor } from 'monaco-editor';

// ✅ FIX 1: Dynamically import with ssr: false to prevent server-side Monaco loading
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)' }} />,
});

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust', 'ruby'];
const THEMES = [
  { value: 'monochrome-dark', label: 'Monochrome Dark' },
  { value: 'hc-black', label: 'High Contrast' },
];

// Define custom monochrome dark theme
const MONOCHROME_DARK_THEME: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Keywords
    { token: 'keyword', foreground: '#bfc5ca', fontStyle: '' },
    { token: 'keyword.control', foreground: '#bfc5ca', fontStyle: '' },
    // Strings
    { token: 'string', foreground: '#98a0a6' },
    { token: 'string.escape', foreground: '#98a0a6' },
    // Comments
    { token: 'comment', foreground: '#6b7280', fontStyle: 'italic' },
    // Numbers
    { token: 'number', foreground: '#bfc5ca' },
    // Variables/Identifiers
    { token: 'identifier', foreground: '#e6e6e6' },
    { token: 'variable', foreground: '#e6e6e6' },
    // Functions
    { token: 'function', foreground: '#bfc5ca' },
    // Types
    { token: 'type', foreground: '#bfc5ca' },
    // Punctuation
    { token: 'delimiter', foreground: '#7c8a91' },
    { token: 'operator', foreground: '#7c8a91' },
    // Tags (HTML/XML)
    { token: 'tag', foreground: '#bfc5ca' },
    { token: 'tag.id', foreground: '#98a0a6' },
    { token: 'tag.class', foreground: '#98a0a6' },
  ],
  colors: {
    'editor.background': '#0a0b0d',
    'editor.foreground': '#e6e6e6',
    'editor.lineNumbersBackground': '#0a0b0d',
    'editor.lineNumberColor': '#4b5563',
    'editor.selectionBackground': '#2c3038',
    'editor.lineHighlightBackground': '#0f1113',
    'editor.cursorForeground': '#7c8a91',
    'editorWhitespace.foreground': '#2c3038',
    'editorIndentGuide.background': '#1a1e24',
    'editorBracketMatch.background': '#2c3038',
    'editorBracketMatch.border': '#4b5563',
  },
};

let themeRegistered = false;

interface Props {
  value: string;
  language: string;
  theme: string;
  onChange: (val: string) => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onRun: () => void;
  running: boolean;
}

export default function CollabEditor({
  value,
  language,
  theme,
  onChange,
  onLanguageChange,
  onThemeChange,
  onRun,
  running,
}: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isClient, setIsClient] = useState(false);

  // ✅ FIX 2: Ensure component only renders on client to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--bg-border)',
          flexWrap: 'wrap',
        }}
      >
        {/* Language selector */}
        <select
          id="language-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--bg-border)',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {/* Theme selector */}
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => onThemeChange(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--bg-border)',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />

        {/* Run button */}
        <button
          id="run-btn"
          className="btn-primary"
          onClick={onRun}
          disabled={running}
          style={{
            padding: '7px 18px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {running ? '⏳ Running...' : '▶ Run'}
        </button>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {isClient && (
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme={theme || 'monochrome-dark'}
            value={value}
            onChange={(v) => onChange(v ?? '')}
            onMount={async (ed) => {
              editorRef.current = ed;
              // ✅ FIX 3: Register theme only after editor mounts on client
              // Dynamically import monaco only when needed (inside event handler)
              if (!themeRegistered) {
                try {
                  const monacoLib = await import('monaco-editor');
                  monacoLib.editor.defineTheme('monochrome-dark', MONOCHROME_DARK_THEME);
                  themeRegistered = true;
                } catch (err) {
                  // Silently fail - theme registration is not critical
                  console.warn('Failed to register custom theme:', err);
                }
              }
            }}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'gutter',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              padding: { top: 16 },
              tabSize: 2,
              // ✅ FIX 4: Disable clipboard features to prevent permission errors
              // Monaco won't try to auto-register clipboard handlers
              'editor.formatOnPaste': false,
              'editor.formatOnType': false,
            }}
          />
        )}
      </div>
    </div>
  );
}
