'use client';

import { useTheme } from '../context/ThemeContext';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M12 2.5v2.2" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M12 19.3v2.2" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M4.9 4.9l1.6 1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M17.5 17.5l1.6 1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M2.5 12h2.2" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M19.3 12h2.2" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M4.9 19.1l1.6-1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5c-1.1 1.7-1.4 3.8-.8 5.8a8.5 8.5 0 0 0 11.8 5.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'theme-toggle--compact' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className="theme-toggle-icon">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
      {!compact && <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
