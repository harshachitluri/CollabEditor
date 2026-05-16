"use client";

import { Navbar } from "@/components/Navbar";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex items-center justify-center pt-32 p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center gap-4 mb-8 text-center">
            <div className="p-4 bg-primary/20 rounded-2xl">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm text-zinc-400">Join CollabCode to save your progress</p>
          </div>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors"
            />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors"
            />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors"
            />
            <button className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Create Account
            </button>
            
            <div className="pt-4 text-center">
               <Link 
                href={`/room/${Math.random().toString(36).substring(7)}`}
                className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
              >
                Start coding as Guest
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
