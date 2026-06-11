import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'CollabCode — Real-time Collaborative Code Editor',
  description: 'Write, run, and debug code together in real-time with AI assistance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => { try { const key = 'collabcode-theme'; const stored = localStorage.getItem(key); const theme = stored === 'light' || stored === 'dark' ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', theme); document.documentElement.style.colorScheme = theme; } catch (e) {} })();`}
        </Script>
        <Script id="mock-clipboard" strategy="beforeInteractive">
          {`
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              if (navigator.clipboard.readText) {
                const origRead = navigator.clipboard.readText;
                navigator.clipboard.readText = function() {
                  return origRead.apply(this, arguments).catch(err => {
                    if (err.name === 'NotAllowedError') return '';
                    throw err;
                  });
                };
              }
              if (navigator.clipboard.writeText) {
                const origWrite = navigator.clipboard.writeText;
                navigator.clipboard.writeText = function() {
                  return origWrite.apply(this, arguments).catch(err => {
                    if (err.name === 'NotAllowedError') return Promise.resolve();
                    throw err;
                  });
                };
              }
            }
          `}
        </Script>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'PLACEHOLDER'}>
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
