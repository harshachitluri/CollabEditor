"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const CollabEditor = dynamic(() => import('@/components/editor/CollabEditor').then(mod => mod.CollabEditor), { ssr: false });
import { AISidebar } from '@/components/ai/AISidebar';
import { 
  Play, 
  Share2, 
  Settings, 
  Bot, 
  Users, 
  Terminal,
  ChevronDown,
  Globe,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoomPage() {
  const { slug } = useParams();
  const [username, setUsername] = useState<string | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const editorRef = useRef<{ getContent: () => string }>(null);

  useEffect(() => {
    const saved = localStorage.getItem('collab_username');
    if (saved) setUsername(saved);
  }, []);

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('username') as string;
    if (name) {
      localStorage.setItem('collab_username', name);
      setUsername(name);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Executing code...');
    const currentCode = editorRef.current?.getContent() || '';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language
        })
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || (data.exitCode === 0 ? 'Program finished with no output' : 'Program exited with error'));
    } catch (err) {
      setOutput('Error: Failed to execute code.');
    } finally {
      setIsRunning(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center gap-4 mb-8 text-center">
            <div className="p-4 bg-primary/20 rounded-2xl">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join Room</h1>
            <p className="text-sm text-zinc-400">Enter your name to start collaborating in room <span className="text-primary font-mono">{slug}</span></p>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <input 
              name="username"
              type="text" 
              placeholder="Your Name"
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors"
            />
            <button className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Enter Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-zinc-950 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-white/10">
            <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-white text-sm hidden md:block">Room: {slug}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
              <Code2 className="w-3.5 h-3.5 text-zinc-500" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-zinc-300 text-xs font-bold focus:outline-none cursor-pointer hover:text-white transition-colors appearance-none pr-6"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java (Local)</option>
                <option value="cpp">C++ (Local)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-500 -ml-5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
             {[1, 2].map((i) => (
               <div key={i} className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                 {i === 1 ? username[0].toUpperCase() : 'A'}
               </div>
             ))}
          </div>
          
          <button 
            onClick={copyRoomId}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors relative group"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isCopied ? 'Copied!' : 'Copy Invite Link'}
            </span>
          </button>

          <button 
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
          >
            <Bot className="w-3.5 h-3.5" />
            AI Assist
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-2">
            <CollabEditor 
              ref={editorRef}
              roomSlug={slug as string} 
              username={username} 
              language={language}
            />
          </div>
          
          {/* Output Panel */}
          <div className="h-48 border-t border-white/10 bg-zinc-950 p-4 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              TERMINAL
            </div>
            <div className="text-sm text-zinc-300 h-[calc(100%-1.5rem)] overflow-y-auto whitespace-pre-wrap">
              {output || "Output will appear here..."}
            </div>
          </div>
        </div>

        <AISidebar 
          isOpen={isAiOpen} 
          onClose={() => setIsAiOpen(false)} 
          editorContent={editorRef.current?.getContent() || ''}
        />
      </main>
    </div>
  );
}
