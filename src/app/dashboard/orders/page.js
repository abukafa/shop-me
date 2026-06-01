"use client";

import { useState, useEffect } from "react";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import OrderDetailModal from "@/components/dashboard/OrderDetailModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOrderSn, setActiveOrderSn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

  const formatRupiah = (number) => {
    if (number === undefined || number === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

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
                  <th className="px-6 py-4 w-12 text-center">No</th>
                  <th className="px-6 py-4">Informasi Pesanan</th>
                  <th className="px-6 py-4">Kurir</th>
                  <th className="px-6 py-4 text-right">Total Bayar</th>
                  <th className="px-6 py-4 text-center">Status Pesanan</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {orders
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((order, index) => {
                    const absoluteIndex =
                      (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={order.order_sn}
                        className="hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-center font-mono font-medium text-slate-500">
                          {absoluteIndex}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-semibold text-slate-200">
                              {order.recipient_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              SN: {order.order_sn}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium">
                          {order?.shipping_carrier || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                          {formatRupiah(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setActiveOrderSn(order.order_sn)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 duration-200"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {orders.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-slate-800/40 bg-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-slate-400">
                Menampilkan{" "}
                <span className="font-semibold text-slate-200">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-200">
                  {Math.min(currentPage * itemsPerPage, orders.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-200">
                  {orders.length}
                </span>{" "}
                pesanan
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-400 transition-all font-semibold flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  Sebelumnya
                </button>

                {Array.from(
                  { length: Math.ceil(orders.length / itemsPerPage) },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg border font-semibold transition-all ${
                      currentPage === page
                        ? "bg-primary-500 border-primary-500 text-white font-bold shadow-md shadow-primary-500/15"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(orders.length / itemsPerPage),
                      ),
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(orders.length / itemsPerPage)
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-400 transition-all font-semibold flex items-center gap-1"
                >
                  Berikutnya
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <OrderDetailModal
        orderSn={activeOrderSn}
        onClose={() => setActiveOrderSn(null)}
      />
    </div>
  );
}
