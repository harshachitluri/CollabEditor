"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Code2, Cpu, Zap, Users2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [randomRoom, setRandomRoom] = useState<string | null>(null);

  useEffect(() => {
    setRandomRoom(Math.random().toString(36).substring(7));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>AI-Powered Real-time Collaboration</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Code Together. <br />
            <span className="text-primary">Evolve Faster.</span>
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            The professional collaborative code editor with real-time sync, 
            multi-language execution, and an AI pair programmer built for elite teams.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href={randomRoom ? `/room/${randomRoom}` : '#'}
                className="group px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-xl shadow-white/5 active:scale-95"
              >
                Start Coding Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-4 text-zinc-500">
              <div className="h-px w-12 bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-widest">or join manually</span>
              <div className="h-px w-12 bg-white/10" />
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const slug = fd.get('room-id');
                if (slug) window.location.href = `/room/${slug}`;
              }}
              className="flex items-center gap-2 p-1.5 bg-zinc-900/50 border border-white/10 rounded-2xl w-full max-w-sm backdrop-blur-xl"
            >
              <input 
                name="room-id"
                type="text" 
                placeholder="Enter Room ID (e.g. test-123)"
                required
                className="bg-transparent border-none focus:ring-0 text-sm px-4 flex-1 text-white placeholder:text-zinc-600"
              />
              <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Join
              </button>
            </form>
          </div>

          {/* Editor Preview */}
          <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-700">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 scale-90" />
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-4 aspect-video shadow-2xl overflow-hidden group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 px-3 py-1 rounded-md bg-white/5 text-xs text-zinc-500 border border-white/5">
                  main.ts
                </div>
              </div>
              <div className="font-mono text-sm text-zinc-400 text-left space-y-2">
                <p><span className="text-primary">import</span> &#123; YDoc &#125; <span className="text-primary">from</span> <span className="text-green-400">'yjs'</span>;</p>
                <p><span className="text-primary">const</span> doc = <span className="text-yellow-400">new</span> <span className="text-blue-400">YDoc</span>();</p>
                <p className="border-l-2 border-primary pl-2 bg-primary/5"><span>// Start collaborating in real-time...</span></p>
                <p><span className="text-primary">function</span> <span className="text-yellow-400">sync</span>() &#123; <span className="text-zinc-600">...</span> &#125;</p>
              </div>
              
              {/* Fake Presence Cursors */}
              <div className="absolute top-1/2 left-1/3 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded shadow-lg animate-pulse">
                Alex
              </div>
              <div className="absolute top-1/4 left-2/3 px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg animate-pulse">
                Sarah
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users2 className="w-6 h-6 text-primary" />,
                title: "Zero-Latency Sync",
                description: "Powered by Yjs CRDTs. Type together without ever worrying about merge conflicts."
              },
              {
                icon: <Cpu className="w-6 h-6 text-blue-500" />,
                title: "Multi-Language Exec",
                description: "Run your code instantly in 50+ languages using our isolated execution engine."
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                title: "AI Pair Programmer",
                description: "Context-aware AI that can explain, fix, and optimize your code right in the sidebar."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all group">
                <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
