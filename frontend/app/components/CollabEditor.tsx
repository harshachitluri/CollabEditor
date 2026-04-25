'use client';
import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust', 'ruby'];
const THEMES = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'hc-black', label: 'High Contrast' },
];

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

export default function CollabEditor({ value, language, theme, onChange, onLanguageChange, onThemeChange, onRun, running }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-border)',
        flexWrap: 'wrap',
      }}>
        {/* Language selector */}
        <select
          id="language-select"
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--bg-border)', borderRadius: 6, padding: '5px 10px', fontSize: 13, cursor: 'pointer' }}>
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Theme selector */}
        <select
          id="theme-select"
          value={theme}
          onChange={e => onThemeChange(e.target.value)}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--bg-border)', borderRadius: 6, padding: '5px 10px', fontSize: 13, cursor: 'pointer' }}>
          {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        {/* Run button */}
        <button
          id="run-btn"
          className="btn-primary"
          onClick={onRun}
          disabled={running}
          style={{ padding: '7px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {running ? '⏳ Running...' : '▶ Run'}
        </button>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme={theme}
          value={value}
          onChange={v => onChange(v ?? '')}
          onMount={ed => { editorRef.current = ed; }}
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
          }}
        />
      </div>
    </div>
  );
}
