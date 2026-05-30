"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseApiResponse = async (res) => {
    const text = await res.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { error: res.statusText || "Password atau Email salah" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Password atau Email salah");

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#090d16] overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-glow-blue pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-glow-purple pointer-events-none" />

      <div className="w-full max-w-md z-10 glass-panel p-8 sm:p-10 rounded-3xl shadow-glass border border-slate-800">
        <div className="text-center mb-8">
          <Link href="/" className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-orange flex items-center justify-center font-display font-extrabold text-xl shadow-glow-primary mx-auto mb-4">
            S
          </Link>
          <h1 className="font-display font-bold text-2xl mb-1">
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-400 text-xs">
            Akses semua fitur e-commerce Anda dari satu tempat.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Alamat Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Kata Sandi
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm pr-10"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-orange hover:brightness-110 shadow-glow-primary transition-all font-semibold text-sm flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Masuk ke Dasbor"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Belum terdaftar?{" "}
          <Link
            href="/register"
            className="text-primary-400 font-semibold hover:underline"
          >
            Buat akun baru
          </Link>
        </p>
      </div>
    </div>
  );
}
