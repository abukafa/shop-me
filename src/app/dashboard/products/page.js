"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat produk");
        setProducts(data?.response?.item || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          Produk Shopee
        </h1>
        <p className="text-slate-400 text-sm">
          Daftar barang aktif yang terintegrasi langsung di toko Shopee Anda.
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
      ) : products.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800">
          <ShoppingBag className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="font-display font-semibold text-lg text-white">
            Belum Ada Produk
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Toko Shopee terhubung belum memiliki produk aktif bermutu NORMAL.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Item ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Update Terakhir</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {products.map((product) => (
                  <tr
                    key={product.item_id}
                    className="hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-200">
                      {product.item_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400">
                        {product.item_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(product.update_time * 1000).toLocaleString(
                        "id-ID",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/api/products/detail?item_id_list=${product.item_id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Detail API
                        <ExternalLink size={12} />
                      </a>
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
