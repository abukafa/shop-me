"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Truck,
  Calendar,
  Sparkles,
  Tag,
  Shield,
  Activity,
  Loader2,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";

export default function ProductDetailModal({ productId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [item, setItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Esc key support to close modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const loadProductDetail = async (itemId) => {
    if (!itemId) return;
    setLoading(true);
    setError("");
    setItem(null);
    setCurrentImageIndex(0);

    try {
      const res = await fetch(`/api/products/detail?item_id_list=${itemId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat detail produk");
      }

      const parsedItem =
        data?.response?.item_list?.[0] || data?.response?.item || data?.item;
      if (!parsedItem) {
        throw new Error("Format data detail produk tidak valid");
      }

      setItem(parsedItem);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductDetail(productId);
    }
  }, [productId]);

  if (!productId) return null;

  // Formatting helpers
  const formatRupiah = (number) => {
    if (number === undefined || number === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Safe data extraction
  const images =
    item?.image?.image_url_list ||
    (item?.image?.image_url
      ? [item?.image?.image_url]
      : item?.image_url
        ? [item?.image_url]
        : []);

  const price =
    item?.price_info?.[0]?.current_price ??
    item?.price_info?.current_price ??
    item?.price ??
    0;

  const stock =
    item?.stock_info_v2?.summary_info?.total_available_stock ??
    item?.stock_info_v2?.total_available_stock ??
    item?.stock ??
    0;

  const brandName =
    item?.brand?.original_brand_name ||
    item?.brand?.brand_name ||
    "Tanpa Brand";

  const condition =
    item?.condition === "NEW" ? "Baru" : item?.condition || "Baru";

  const categoryId = item?.category_id || "-";

  const daysToShip = item?.pre_order?.days_to_ship || 2;
  const isPreOrder = item?.pre_order?.is_pre_order || false;

  const weight = item?.weight || 0;
  const dimension = item?.dimension || {
    package_length: 0,
    package_width: 0,
    package_height: 0,
  };

  const logistics = item?.logistic_info?.filter((log) => log.enabled) || [];

  const attributes =
    item?.attribute_list
      ?.map((attr) => {
        const name = attr.original_attribute_name;
        const value = attr.attribute_value_list
          ?.map((val) => val.original_value_name)
          .join(", ");
        return { name, value };
      })
      .filter((attr) => attr.name && attr.value) || [];

  // Carousel handlers
  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Stock Badge determination
  const getStockStatus = (qty) => {
    if (qty === 0)
      return {
        label: "Habis",
        bg: "bg-red-500/10 border-red-500/20 text-red-400",
        bar: "bg-red-500",
        percent: 0,
      };
    if (qty <= 10)
      return {
        label: "Stok Menipis",
        bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        bar: "bg-amber-500",
        percent: (qty / 10) * 30,
      };
    if (qty > 100)
      return {
        label: "Stok Melimpah",
        bg: "bg-green-500/10 border-green-500/20 text-green-400",
        bar: "bg-green-500",
        percent: 100,
      };
    return {
      label: "Stok Aman",
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      bar: "bg-emerald-500",
      percent: (qty / 100) * 100,
    };
  };

  const stockStatus = getStockStatus(stock);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-5xl rounded-3xl border border-slate-800/80 max-h-[90vh] overflow-y-auto shadow-2xl relative transition-all duration-300 transform scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:rotate-90 transition-all duration-300 z-10"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
            <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
            <h3 className="font-display font-semibold text-lg text-slate-200">
              Mengambil Detail Produk...
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Menghubungkan ke toko Shopee Anda untuk mengambil data produk
              terkini.
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 animate-shake">
              <AlertTriangle size={28} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-200">
              Gagal Memuat Detail
            </h3>
            <p className="text-slate-400 text-sm mt-2 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => loadProductDetail(productId)}
                className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all"
              >
                Coba Lagi
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        ) : item ? (
          /* Success State */
          <div className="p-6 sm:p-8">
            {/* Upper Section: Basic Info Header */}
            <div className="mb-6 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-xs font-semibold text-primary-400">
                  <Sparkles size={10} />
                  ID: {item.item_id}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/25 text-xs font-semibold text-green-400">
                  {item.item_status || "NORMAL"}
                </span>
                {isPreOrder && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-semibold text-amber-400">
                    <Calendar size={10} />
                    Pre-Order
                  </span>
                )}
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white leading-snug tracking-tight">
                {item.item_name}
              </h2>
            </div>

            {/* Split Content: Left (Visual Carousel) & Right (Details) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Carousel Gallery (md:col-span-5) */}
              <div className="md:col-span-5 space-y-4">
                {/* Main Carousel Wrapper */}
                <div className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-950/40 border border-slate-800/80 flex items-center justify-center">
                  {images.length > 0 ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[currentImageIndex]}
                        alt={item.item_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Image Index Overlay */}
                      <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur border border-slate-800 text-xs font-mono text-slate-300">
                        {currentImageIndex + 1} / {images.length}
                      </div>

                      {/* Navigation Controls */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900/90 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900/90 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Next image"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-600">
                      <Package size={64} className="stroke-[1] mb-2" />
                      <span className="text-xs">Tidak ada gambar</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative aspect-square w-14 rounded-lg overflow-hidden border transition-all flex-shrink-0 ${
                          currentImageIndex === idx
                            ? "border-primary-500 ring-2 ring-primary-500/20 scale-95"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Pricing Premium Panel */}
                <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                    Harga Shopee
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                      {formatRupiah(price)}
                    </span>
                  </div>
                </div>

                {/* Basic Badges Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-800/40 flex items-center gap-2.5">
                    <Tag size={14} className="text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">
                        Brand
                      </div>
                      <div className="text-slate-200 font-semibold truncate max-w-[120px]">
                        {brandName}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-800/40 flex items-center gap-2.5">
                    <Shield size={14} className="text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">
                        Kondisi
                      </div>
                      <div className="text-slate-200 font-semibold">
                        {condition}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-800/40 flex items-center gap-2.5">
                    <Layers size={14} className="text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">
                        Kategori ID
                      </div>
                      <div className="text-slate-200 font-mono font-semibold">
                        {categoryId}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-800/40 flex items-center gap-2.5">
                    <Calendar size={14} className="text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">
                        Pengemasan
                      </div>
                      <div className="text-slate-200 font-semibold">
                        {daysToShip} Hari
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Specs & Description (md:col-span-7) */}
              <div className="md:col-span-7 space-y-6">
                {/* Section: Stock Inventory Status */}
                <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-slate-400" />
                      <span className="font-semibold text-sm text-slate-300">
                        Status Inventaris
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${stockStatus.bg}`}
                    >
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-mono font-extrabold text-slate-100">
                      {stock}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        item tersedia
                      </span>
                    </div>
                  </div>

                  {/* Stock progress level bar */}
                  <div className="w-full h-2 rounded-full bg-slate-950/60 overflow-hidden border border-slate-800/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stockStatus.bar}`}
                      style={{
                        width: `${Math.min(100, Math.max(5, stockStatus.percent))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Section: Shipping & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-2">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Berat & Dimensi
                    </div>
                    <div className="space-y-1 text-slate-300 text-xs">
                      <div className="flex justify-between border-b border-slate-800/40 pb-1">
                        <span className="text-slate-500">Berat Paket:</span>
                        <span className="font-mono font-semibold">
                          {weight} kg
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Dimensi (PxLxT):</span>
                        <span className="font-mono font-semibold">
                          {dimension.package_length || 0}x
                          {dimension.package_width || 0}x
                          {dimension.package_height || 0} cm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-2">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Truck size={10} />
                      Logistik Aktif
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto pr-1">
                      {logistics.length > 0 ? (
                        logistics.map((log, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-medium text-slate-300"
                          >
                            {log.logistic_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs italic">
                          Tidak ada kurir aktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Dynamic Product Attribute Specifications */}
                {attributes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Info size={12} className="text-slate-400" />
                      Spesifikasi Produk
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attributes.map((attr, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900/10 border border-slate-800/50 hover:border-slate-800 hover:bg-slate-900/20 transition-all flex flex-col justify-center"
                        >
                          <span className="text-[10px] text-slate-500 font-semibold uppercase truncate">
                            {attr.name}
                          </span>
                          <span
                            className="text-xs text-slate-200 font-medium mt-0.5 line-clamp-2"
                            title={attr.value}
                          >
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={12} className="text-slate-400" />
                    Deskripsi Produk
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-900/10 border border-slate-800/50">
                    <div className="max-h-60 overflow-y-auto pr-2 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line scrollbar-thin">
                      {item.description || "Tidak ada deskripsi produk."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-8 pt-4 border-t border-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
              <a
                href={`/api/products/detail?item_id_list=${item.item_id}`}
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-primary-400 font-semibold transition-colors"
              >
                <ExternalLink size={12} />
                Detail API (JSON)
              </a>
              <div>
                Update terakhir:{" "}
                {new Date(item.update_time * 1000).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
