"use client";

import React, { useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Plus, Hash, ArrowRight, Code2, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [roomSlug, setRoomSlug] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomSlug.trim()) {
      router.push(`/room/${roomSlug.trim()}`);
    }
  };

  const handleCreate = () => {
    const newSlug = Math.random().toString(36).substring(7);
    router.push(`/room/${newSlug}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-zinc-400 text-sm">Join an existing room or create a new session.</p>
            </div>
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create New Room
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Join Section */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-6">
                <Hash className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold mb-4">Join via Room ID</h2>
              <form onSubmit={handleJoin} className="space-y-4">
                <input 
                  type="text" 
                  value={roomSlug}
                  onChange={(e) => setRoomSlug(e.target.value)}
                  placeholder="Enter room slug (e.g. abc-123)"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors"
                />
                <button className="w-full py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  Join Room
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Stats/Info Section */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
              <div className="p-3 bg-primary/20 rounded-xl w-fit mb-6">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Live Collaboration</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Share your room link with teammates to start a real-time coding session. 
                All changes are synced across all participants with zero latency.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] font-bold text-zinc-500">
                      U{i}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-zinc-500">50+ active rooms right now</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
