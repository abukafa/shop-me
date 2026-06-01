"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function Topbar() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-8 bg-[#090d16]/50 backdrop-blur-md ml-64">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-200">
          Selamat Datang, {profile?.name || "Loading..."}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {profile?.shopeeTokens?.length > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400 shadow-glow-primary/5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
            Shopee Terhubung
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs font-semibold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
            Shopee Belum Terhubung
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="h-7 w-7 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 text-xs font-bold border border-primary-500/20">
            <User size={14} />
          </div>
          <span className="text-xs font-medium text-slate-300">
            {profile?.email || "..."}
          </span>
        </div>
      </div>
    </header>
  );
}
