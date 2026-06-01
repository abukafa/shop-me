"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, X, RefreshCw } from "lucide-react";

export default function RefreshStatusModal({ isOpen, status, error, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const isSuccess = status === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel max-w-md w-full rounded-3xl border border-slate-800/80 p-6 shadow-2xl relative flex flex-col items-center text-center gap-4 transition-all duration-300 transform scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors h-8 w-8 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center active:scale-95 duration-200"
        >
          <X size={14} />
        </button>

        {/* Icon status */}
        {isSuccess ? (
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-3xl animate-bounce-slow">
            <CheckCircle2 size={36} />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-3xl animate-shake">
            <AlertTriangle size={36} />
          </div>
        )}

        {/* Text Details */}
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-xl text-white">
            {isSuccess ? "Penyegaran Token Sukses" : "Penyegaran Token Gagal"}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            {isSuccess
              ? "Sesi koneksi API Shopee Anda berhasil diperpanjang selama 4 jam ke depan."
              : "Gagal me-refresh token Shopee. Sesi otorisasi Anda mungkin telah dicabut atau habis masa berlakunya."}
          </p>
        </div>

        {/* Details card if error */}
        {!isSuccess && error && (
          <div className="w-full p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-left font-mono text-[10px] text-red-400 max-h-[100px] overflow-y-auto scrollbar-thin">
            <span className="font-bold block uppercase tracking-wider mb-1">Rincian Error:</span>
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="w-full p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-left font-mono text-[10px] text-emerald-400/90 space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold">AKTIF</span>
            </div>
            <div className="flex justify-between">
              <span>Validitas:</span>
              <span>4 Jam (Otomatis Diperbarui)</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 duration-200 mt-2 ${
            isSuccess
              ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/10"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
          }`}
        >
          {isSuccess ? "Selesai & Muat Ulang Halaman" : "Tutup & Coba Lagi"}
        </button>
      </div>
    </div>
  );
}
