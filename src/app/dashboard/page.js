"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Receipt, Users, Key, ExternalLink } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";

export default function DashboardOverview() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/shop");
        if (res.ok) {
          const data = await res.json();
          if (data.isConnected) {
            setShop(data);
          }
        }
      } catch (err) {
        console.error("Failed to load shop info", err);
      } finally {
        setLoading(false);
      }
    }
    checkConnection();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="h-8 w-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          Ringkasan Dasbor
        </h1>
        <p className="text-slate-400 text-sm">
          Lihat performa toko Shopee dan kelola integrasi akun Anda.
        </p>
      </div>

      {shop ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Produk Aktif"
              value="50+"
              icon={ShoppingBag}
              colorClass="bg-primary-500/10 border-primary-500/20 text-primary-400"
              gradientClass="bg-primary-500/10"
            />
            <StatCard
              title="Pesanan Baru (3 Hari)"
              value="12"
              icon={Receipt}
              colorClass="bg-orange-500/10 border-orange-500/20 text-orange-400"
              gradientClass="bg-orange-500/10"
            />
            <StatCard
              title="Pelanggan Unik"
              value="9"
              icon={Users}
              colorClass="bg-purple-500/10 border-purple-500/20 text-purple-400"
              gradientClass="bg-purple-500/10"
            />
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-glow-orange opacity-40 pointer-events-none" />
            <div className="z-10 relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-left">
                <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl">
                  🏪
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {shop.shopInfo?.shop_name || "Toko Shopee"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    ID TOKO: {shop.shopId}
                  </p>
                  <p className="text-xs text-green-400 font-medium mt-1 inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                    Koneksi API Aktif
                  </p>
                </div>
              </div>
              <div>
                <a
                  href="/api/shopee/auth"
                  className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <Key size={16} />
                  Hubungkan Ulang Toko
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-10 rounded-3xl border border-slate-800/80 text-center relative overflow-hidden max-w-2xl mx-auto mt-10">
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-glow-orange opacity-30 pointer-events-none" />

          <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl mx-auto mb-6">
            🧡
          </div>

          <h2 className="font-display font-extrabold text-2xl text-white mb-3">
            Hubungkan Toko Shopee Anda
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Untuk mulai menggunakan fitur sinkronisasi produk, pelacakan
            pesanan, CRM pelanggan, dan WhatsApp follow-up, Anda perlu
            menghubungkan API partner Shopee Anda terlebih dahulu.
          </p>

          <a
            href="/api/shopee/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-orange to-orange-600 hover:brightness-110 shadow-glow-orange font-bold text-base transition-all duration-300"
          >
            Hubungkan Sekarang
            <ExternalLink size={18} />
          </a>
        </div>
      )}
    </div>
  );
}
