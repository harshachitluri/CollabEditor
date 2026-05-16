"use client";

import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, MessageSquare, Code, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  editorContent: string;
}

export function AISidebar({ isOpen, onClose, editorContent }: AISidebarProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          code: editorContent,
          query: query
        })
      });

      if (!res.body) return;
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setResponse(prev => prev + chunk);
      }
    } catch (err) {
      console.error(err);
      setResponse("Failed to connect to AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "fixed top-0 right-0 h-full w-[400px] bg-zinc-950 border-l border-white/10 z-[60] transition-transform duration-300 shadow-2xl",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-white">AI Assistant</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!response && !isLoading && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 mb-4">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <MessageSquare className="w-4 h-4" />, label: "Explain", color: "text-blue-400" },
                  { icon: <Code className="w-4 h-4" />, label: "Refactor", color: "text-green-400" },
                  { icon: <Zap className="w-4 h-4" />, label: "Optimize", color: "text-yellow-400" },
                  { icon: <Sparkles className="w-4 h-4" />, label: "Review", color: "text-purple-400" }
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.label.toLowerCase())}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className={cn("p-2 rounded-lg bg-zinc-900 group-hover:scale-110 transition-transform", action.color)}>
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium text-zinc-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {response && (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                {response}
                {isLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/50">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the code..."
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors resize-none h-24"
            />
            <button 
              onClick={() => handleAction('custom')}
              disabled={isLoading || !query.trim()}
              className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
