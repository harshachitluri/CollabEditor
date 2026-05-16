"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [randomRoom, setRandomRoom] = useState<string | null>(null);

  useEffect(() => {
    setRandomRoom(Math.random().toString(36).substring(7));
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Collab<span className="text-primary">Code</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/dashboard" className="hover:text-white transition-colors text-primary font-bold">Dashboard</Link>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href={randomRoom ? `/room/${randomRoom}` : '#'}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
