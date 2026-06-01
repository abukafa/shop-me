"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Menu, LogOut } from "lucide-react";

export default function Topbar({ onToggleSidebar }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const shopeeBadge =
    profile?.shopeeTokens?.length > 0 ? (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] sm:text-xs font-semibold text-green-400 shadow-glow-primary/5 flex-shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
        Shopee Terhubung
      </div>
    ) : (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-[10px] sm:text-xs font-semibold text-slate-400 flex-shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
        Shopee Belum Terhubung
      </div>
    );

  return (
    <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-4 md:px-8 bg-[#090d16]/50 backdrop-blur-md lg:ml-64 ml-0 transition-all duration-300 relative z-30">
      {/* Left side: Hamburger (mobile/tablet) & Shopee Badge (large screens) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 duration-200 lg:hidden flex items-center justify-center"
          aria-label="Toggle Menu"
        >
          <Menu size={18} />
        </button>

        {/* Shopee connected indicator: Top-left on large screen size */}
        <div className="hidden lg:block">{shopeeBadge}</div>
      </div>

      {/* Right side: Shopee Badge (medium screens & below) & Clickable User Dropdown */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Shopee connected indicator: Top-right on medium and below screens */}
        <div className="block lg:hidden">{shopeeBadge}</div>

        {/* User Profile Clickable Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-primary-400 hover:text-white flex items-center justify-center transition-all active:scale-95 duration-200 shadow-md relative"
            aria-label="User Profile Menu"
          >
            <User size={16} />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay transparent backdrop to close dropdown when clicking outside */}
              <div
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setDropdownOpen(false)}
              />

              {/* Premium Glassmorphic Dropdown Panel */}
              <div className="absolute right-0 mt-2.5 w-56 rounded-2xl glass-panel border border-slate-800 p-4 shadow-2xl z-20 animate-fade-in flex flex-col gap-1 select-none">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Akun Masuk
                </span>
                <div className="font-display font-extrabold text-sm text-slate-200 truncate">
                  {profile?.name || "Memuat..."}
                </div>
                <div className="text-[12px] font-mono text-slate-400 truncate mb-2">
                  {profile?.email || "..."}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
