"use client";

import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat pesanan");
        setOrders(data?.response?.order_list || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          Daftar Pesanan
        </h1>
        <p className="text-slate-400 text-sm">
          Pantau pesanan yang masuk di Shopee dalam 3 hari terakhir.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center glass-panel rounded-3xl border-red-500/20 max-w-xl mx-auto">
          <span className="text-3xl">⚠️</span>
          <h3 className="font-display font-bold text-lg mt-4 text-white">
            Shopee Tidak Terhubung
          </h3>
          <p className="text-slate-400 text-sm mt-2">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800">
          <Receipt className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="font-display font-semibold text-lg text-white">
            Belum Ada Pesanan
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Tidak ada pesanan masuk dalam 3 hari terakhir.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">No. Pesanan (Order SN)</th>
                  <th className="px-6 py-4">Status Pesanan</th>
                  <th className="px-6 py-4">Update Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {orders.map((order) => (
                  <tr
                    key={order.order_sn}
                    className="hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-200">
                      {order.order_sn}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.order_status === "UNPAID"
                            ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                            : order.order_status === "READY_TO_SHIP"
                              ? "bg-primary-500/10 border border-primary-500/20 text-primary-400 shadow-glow-primary/5"
                              : order.order_status === "SHIPPED"
                                ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                                : order.order_status === "COMPLETED"
                                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                  : "bg-slate-800 border border-slate-700 text-slate-400"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {new Date(order.update_time * 1000).toLocaleString(
                        "id-ID",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
