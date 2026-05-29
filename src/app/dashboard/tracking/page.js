"use client";

import { useState } from "react";
import { Truck, Search, MapPin } from "lucide-react";

export default function TrackingPage() {
  const [orderSn, setOrderSn] = useState("");
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderSn.trim()) return;

    setLoading(true);
    setError("");
    setTracking(null);

    try {
      const res = await fetch(`/api/tracking?order_sn=${orderSn}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Gagal mengambil informasi pengiriman");
      setTracking(data?.response || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          Lacak Paket Shopee
        </h1>
        <p className="text-slate-400 text-sm">
          Lacak resi pengiriman logistik secara langsung berdasarkan Nomor
          Pesanan (Order SN).
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-xl">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              required
              placeholder="Masukkan Nomor Pesanan (misal: 230303XXXXXX)"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl glass-input text-sm font-mono"
              value={orderSn}
              onChange={(e) => setOrderSn(e.target.value)}
            />
            <Truck
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 font-bold text-sm flex items-center gap-2 shadow-glow-primary transition-all whitespace-nowrap"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Search size={16} />
                Lacak Resi
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-xl">
          ⚠️ {error}
        </div>
      )}

      {tracking && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 max-w-2xl relative overflow-hidden">
          <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
            📦 Rincian Pengiriman
          </h2>

          <div className="mb-6 pb-6 border-b border-slate-800/60 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Kurir Logistik
              </p>
              <p className="text-white font-semibold mt-1">
                {tracking.shipping_carrier || "Belum diketahui"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Status Paket
              </p>
              <p className="text-primary-400 font-semibold mt-1">
                LOGISTICS_ORDER_CREATED
              </p>
            </div>
          </div>

          {tracking.tracking_info && tracking.tracking_info.length > 0 ? (
            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {tracking.tracking_info.map((info, idx) => (
                <div key={idx} className="relative text-left">
                  <span
                    className={`absolute left-[-21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                      idx === 0
                        ? "bg-primary-500 border-primary-500 ring-4 ring-primary-500/20"
                        : "bg-slate-900 border-slate-700"
                    }`}
                  ></span>

                  <div>
                    <p
                      className={`text-sm font-semibold ${idx === 0 ? "text-white" : "text-slate-300"}`}
                    >
                      {info.description}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {new Date(info.update_time * 1000).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              <MapPin className="mx-auto text-slate-600 mb-2" size={24} />
              Shopee belum memperbarui riwayat perjalanan paket ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
