"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const parseApiResponse = async (res) => {
    const text = await res.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { error: res.statusText || "Terjadi kesalahan" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane (Visual Branding) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d1527] relative items-center justify-center p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute bg-glow-blue w-[400px] h-[400px] rounded-full top-[-10%] left-[-10%]" />
        <div className="absolute bg-glow-purple w-[400px] h-[400px] rounded-full bottom-[-10%] right-[-10%]" />

        <div className="z-10 max-w-md text-center">
          <Link href="/" className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-orange flex items-center justify-center font-display font-extrabold text-3xl shadow-glow-primary mx-auto mb-8">
            S
          </Link>
          <h2 className="font-display font-extrabold text-3xl mb-4 leading-tight">
            Gabung bersama Ribuan Pedagang Sukses
          </h2>
          <p className="text-slate-400 mb-8">
            Mulai hubungkan Shopee Anda ke dasbor multi-store terbaik. Hanya
            butuh beberapa detik untuk registrasi.
          </p>
          <div className="glass-card p-6 rounded-2xl text-left border-primary-500/20">
            <p className="text-sm italic text-slate-300">
              Sistem manajemen pesanan & pelacakan resi yang sangat cepat!
              Sekarang saya bisa follow-up pelanggan WhatsApp hanya dengan
              sekali klik.
            </p>
            <p className="text-xs font-semibold text-primary-400 mt-3">
              — Budi, CEO TokoMaju
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane (Register Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#090d16]">
        <div className="absolute bg-glow-orange w-[300px] h-[300px] rounded-full top-[10%] right-[-10%] lg:hidden" />

        <div className="w-full max-w-md z-10">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-slate-400 text-sm">
              Silakan isi formulir di bawah untuk memulai.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              🎉 Registrasi berhasil! Mengalihkan ke halaman login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Nama Anda"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-glow-primary transition-all font-semibold text-sm flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-primary-400 font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
