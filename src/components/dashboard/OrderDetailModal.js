"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  AlertTriangle,
  Receipt,
  User,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Calendar,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Phone
} from "lucide-react";

// SSR-Safe React Portal helper component
function ClientPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

export default function OrderDetailModal({ orderSn, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Esc key support to close modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const loadOrderDetail = async (sn) => {
    if (!sn) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/detail?order_sn=${sn}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat detail pesanan");
      }

      const parsedOrder = data?.response?.order_list?.[0] || data?.order;
      if (!parsedOrder) {
        throw new Error("Format data detail pesanan tidak valid");
      }

      setOrder(parsedOrder);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderSn) {
      loadOrderDetail(orderSn);
    }
  }, [orderSn]);

  if (!orderSn) return null;

  // Formatting helpers
  const formatRupiah = (number) => {
    if (number === undefined || number === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Safe data extraction
  const orderStatus = order?.order_status || "UNPAID";
  const items = order?.item_list || [];
  const address = order?.recipient_address || {};
  const paymentMethod = order?.payment_method || "Tunai";
  const carrier = order?.shipping_carrier || "Tidak Diketahui";
  const buyerUsername = order?.buyer_username || "pembeli";
  const buyerUserId = order?.buyer_user_id || "-";
  const note = order?.note || "";
  const dropshipper = order?.dropshipper || "";
  const dropshipperPhone = order?.dropshipper_phone || "";

  // Calculation helpers
  const itemsSubtotal = items.reduce((sum, item) => {
    const price = item.model_discounted_price ?? item.model_original_price ?? item.discounted_price ?? 0;
    const qty = item.model_quantity_purchased ?? item.quantity_purchased ?? item.model_quantity ?? 1;
    return sum + (price * qty);
  }, 0);

  const baseShippingFee = order?.actual_shipping_fee ?? order?.estimated_shipping_fee ?? 0;
  const totalAmount = order?.total_amount ?? (itemsSubtotal + baseShippingFee);
  
  const baselineSum = itemsSubtotal + baseShippingFee;
  let shippingFee = baseShippingFee;
  let totalDiscount = 0;

  if (totalAmount > baselineSum) {
    // If totalAmount is greater, attribute the difference to shippingFee / handling fee
    shippingFee = baseShippingFee + (totalAmount - baselineSum);
  } else if (totalAmount < baselineSum) {
    // If totalAmount is less, attribute the difference to discounts/vouchers
    totalDiscount = baselineSum - totalAmount;
  }

  // Status Badge mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case "UNPAID":
        return "bg-yellow-500/10 border-yellow-500/25 text-yellow-400";
      case "READY_TO_SHIP":
        return "bg-primary-500/10 border-primary-500/25 text-primary-400";
      case "PROCESSED":
        return "bg-indigo-500/10 border-indigo-500/25 text-indigo-400";
      case "SHIPPED":
        return "bg-purple-500/10 border-purple-500/25 text-purple-400";
      case "COMPLETED":
        return "bg-green-500/10 border-green-500/25 text-green-400";
      case "CANCELLED":
        return "bg-red-500/10 border-red-500/25 text-red-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  return (
    <ClientPortal>
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
          /* Loading State Skeletons */
          <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
            <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
            <h3 className="font-display font-semibold text-lg text-slate-200">
              Mengambil Detail Pesanan...
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Membaca informasi rincian pesanan Shopee Anda dari server.
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 animate-shake">
              <AlertTriangle size={28} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-200">
              Gagal Memuat Detail Pesanan
            </h3>
            <p className="text-slate-400 text-sm mt-2 mb-6">
              {error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => loadOrderDetail(orderSn)}
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
        ) : order ? (
          /* Success State */
          <div className="p-6 sm:p-8">
            {/* Header: Basic Order ID & Status Badges */}
            <div className="mb-6 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
                  <Receipt size={10} />
                  Pesanan: {order.order_sn}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(orderStatus)}`}>
                  {orderStatus}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/40 border border-slate-800/40 text-xs font-medium text-slate-300">
                  <CreditCard size={10} />
                  {paymentMethod}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Rincian Pesanan Pelanggan
              </h2>
            </div>

            {/* Split Content: Left (Products & Pricing) & Right (Customer & Shipping) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Products purchased, Total bill breakdown (md:col-span-7) */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Purchased Items Box */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={12} className="text-slate-400" />
                    Barang yang Dibeli ({items.length})
                  </h4>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {items.map((item, idx) => {
                      const name = item.item_name || "Nama Produk";
                      const variant = item.model_name || "-";
                      const qty = item.model_quantity_purchased ?? item.quantity_purchased ?? item.model_quantity ?? 1;
                      const discountedPrice = item.model_discounted_price ?? item.model_original_price ?? item.discounted_price ?? 0;
                      const originalPrice = item.model_original_price ?? item.original_price ?? discountedPrice;

                      return (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/40 hover:bg-slate-900/30 transition-all flex items-start gap-4"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="font-semibold text-xs text-slate-200 line-clamp-2" title={name}>
                              {name}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500 font-medium">
                              {variant !== "-" && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-900/40 border border-slate-800/30 text-slate-400">
                                  Varian: {variant}
                                </span>
                              )}
                              <span>Qty: {qty}x</span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-mono font-bold text-slate-200">
                              {formatRupiah(discountedPrice)}
                            </div>
                            {originalPrice > discountedPrice && (
                              <div className="text-[9px] font-mono text-slate-500 line-through">
                                {formatRupiah(originalPrice)}
                              </div>
                            )}
                            <div className="text-[10px] font-mono font-semibold text-slate-400 mt-1">
                              Subtotal: {formatRupiah(discountedPrice * qty)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Billing Summary Premium Panel */}
                <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/50 space-y-3">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider pb-1 border-b border-slate-800/30">
                    Rincian Pembayaran
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal Produk ({items.length} item):</span>
                      <span className="font-mono">{formatRupiah(itemsSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ongkos Kirim:</span>
                      <span className="font-mono">{formatRupiah(shippingFee)}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Diskon / Potongan Voucher:</span>
                        <span className="font-mono">-{formatRupiah(totalDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-slate-800/30 flex justify-between items-baseline">
                      <span className="font-semibold text-slate-200">Total Pembayaran:</span>
                      <span className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 font-mono">
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Buyer Note */}
                {note && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={12} />
                      Catatan dari Pembeli
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &ldquo;{note}&rdquo;
                    </p>
                  </div>
                )}

              </div>

              {/* Right Column: Customer address, Logistics, Order Status Logs (md:col-span-5) */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Customer / Recipient Card */}
                <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    Informasi Pembeli
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-800/20 pb-2">
                      <span className="text-slate-500">Akun Pembeli:</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1">
                        @{buyerUsername}
                        <span className="text-[9px] text-slate-600">({buyerUserId})</span>
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="text-slate-500 font-semibold text-[10px] uppercase">Alamat Penerima</div>
                      
                      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1.5">
                        <div className="font-bold text-slate-200 flex items-center gap-1">
                          {address.name || "Nama Tidak Tersedia"}
                        </div>
                        {address.phone && (
                          <div className="font-mono text-slate-400 flex items-center gap-1.5">
                            <Phone size={10} className="text-slate-500" />
                            {address.phone}
                          </div>
                        )}
                        <p className="text-slate-400 leading-relaxed text-[11px] flex items-start gap-1">
                          <MapPin size={10} className="text-slate-500 mt-0.5 flex-shrink-0" />
                          {address.full_address || 
                           [address.town, address.district, address.city, address.state, address.zipcode]
                             .filter(Boolean)
                             .join(", ") || 
                           "Alamat lengkap tidak tersedia."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Courier Card */}
                <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck size={12} className="text-slate-400" />
                    Pengiriman & Kurir
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800/20 pb-2">
                      <span className="text-slate-500">Jasa Kirim:</span>
                      <span className="font-semibold text-slate-200">{carrier}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/20 pb-2">
                      <span className="text-slate-500">Dibuat Pada:</span>
                      <span className="font-mono text-slate-300">{formatDate(order.create_time)}</span>
                    </div>

                    {order.pay_time && (
                      <div className="flex justify-between border-b border-slate-800/20 pb-2">
                        <span className="text-slate-500">Waktu Bayar:</span>
                        <span className="font-mono text-slate-300">{formatDate(order.pay_time)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropshipper Card (Only shown if dropshipper exists) */}
                {dropshipper && (
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/40 space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Informasi Dropshipper
                    </div>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama Toko:</span>
                        <span className="font-semibold">{dropshipper}</span>
                      </div>
                      {dropshipperPhone && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">No. Telepon:</span>
                          <span className="font-mono">{dropshipperPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-8 pt-4 border-t border-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
              <a
                href={`/api/orders/detail?order_sn=${order.order_sn}`}
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-primary-400 font-semibold transition-colors"
              >
                <ExternalLink size={12} />
                Detail API (JSON)
              </a>
              <div>
                Update terakhir: {formatDate(order.update_time)}
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
    </ClientPortal>
  );
}
