"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import ProductDetailModal from "@/components/dashboard/ProductDetailModal";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProductId, setActiveProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Reset page when products list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const truncateWords = (str, maxWords = 5) => {
    if (!str) return "-";
    const words = str.split(" ");
    if (words.length <= maxWords) return str;
    return words.slice(0, maxWords).join(" ") + "...";
  };

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
                  <th className="px-6 py-4 w-12 text-center">No</th>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center w-24">Stok</th>
                  <th className="px-6 py-4">Update Terakhir</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {products
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((product, index) => {
                    const absoluteIndex =
                      (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={product.item_id}
                        className="hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-center font-mono font-medium text-slate-500">
                          {absoluteIndex}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span
                              className="font-semibold text-slate-100 line-clamp-1"
                              title={product.item_name}
                            >
                              {truncateWords(product.item_name, 5)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID: {product.item_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400">
                            {product.item_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-mono font-bold ${
                              (product.stock ?? 0) <= 10
                                ? "text-amber-400"
                                : "text-slate-200"
                            }`}
                          >
                            {product.stock ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(product.update_time * 1000).toLocaleString(
                            "id-ID",
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setActiveProductId(product.item_id)}
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
          {products.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-slate-800/40 bg-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-slate-400">
                Menampilkan{" "}
                <span className="font-semibold text-slate-200">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-200">
                  {Math.min(currentPage * itemsPerPage, products.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-200">
                  {products.length}
                </span>{" "}
                produk
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
                  { length: Math.ceil(products.length / itemsPerPage) },
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
                        Math.ceil(products.length / itemsPerPage),
                      ),
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(products.length / itemsPerPage)
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

      <ProductDetailModal
        productId={activeProductId}
        onClose={() => setActiveProductId(null)}
      />
    </div>
  );
}
