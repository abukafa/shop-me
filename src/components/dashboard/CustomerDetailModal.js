"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Phone,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Save,
  Copy,
  Check,
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

export default function CustomerDetailModal({
  customer,
  onClose,
  manualPhones,
  onSavePhone,
  messageTemplate,
}) {
  const [tempPhone, setTempPhone] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (customer) {
      setTempPhone(manualPhones[customer.buyer_user_id] || customer.phone || "");
    }
  }, [customer, manualPhones]);

  if (!customer) return null;

  // Utility helpers
  const isPhoneMasked = (phone) => {
    return !phone || phone.includes("*");
  };

  const getEffectivePhone = () => {
    return manualPhones[customer.buyer_user_id] || customer.phone || "";
  };

  const getWhatsAppLink = () => {
    const phone = getEffectivePhone();
    const name = customer.customer_name;
    const orderSn = customer.orders?.[0]?.order_sn || customer.order_sn || "";

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    const template = messageTemplate || "";
    const personalizedMessage = template
      .replace(/{name}/g, name)
      .replace(/{order_sn}/g, orderSn);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;
  };

  const handleFollowUpClick = (e) => {
    const phone = getEffectivePhone();
    if (isPhoneMasked(phone)) {
      e.preventDefault();
      alert(
        "Nomor telepon pelanggan masih tersensor (****) oleh Shopee. Silakan masukkan nomor HP secara manual terlebih dahulu di dalam Modal Detail untuk melakukan Follow Up WhatsApp."
      );
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSavePhoneClick = () => {
    onSavePhone(customer.buyer_user_id, tempPhone);
    alert("Nomor WA manual berhasil disimpan!");
  };

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div 
          className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-800/80 p-5 sm:p-6 overflow-y-auto max-h-[90vh] shadow-2xl relative flex flex-col gap-5 scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors h-8 w-8 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center active:scale-95 duration-200"
          >
            <X size={14} />
          </button>

          {/* Modal Profile Header */}
          <div className="flex items-center gap-4 border-b border-slate-800/50 pb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-display font-extrabold text-white text-xl shadow-lg shadow-primary-500/10">
              {customer.customer_name
                ? customer.customer_name.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100 leading-tight">
                {customer.customer_name}
              </h3>
              <span className="text-xs font-mono text-slate-500 block mt-0.5">
                Buyer ID: {customer.buyer_user_id} (@{customer.buyer_username})
              </span>
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Phone Overrides & Stats */}
            <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 space-y-4">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Nomor Telepon Shopee
                </span>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Phone size={12} className="text-slate-500" />
                  <span>{customer.phone || "Tidak ada telepon"}</span>
                  {isPhoneMasked(customer.phone) && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-wider flex-shrink-0">
                      Tersensor
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Input No. Telepon Manual (Override WA)
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Masukkan nomor WA (misal: 081234...)"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="glass-input rounded-xl px-3 py-1.5 text-xs font-mono flex-1 leading-none"
                  />
                  <button
                    onClick={handleSavePhoneClick}
                    className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-all active:scale-95 duration-200 flex-shrink-0 flex items-center justify-center"
                    title="Simpan nomor WA manual"
                  >
                    <Save size={12} />
                  </button>
                </div>
                <span className="text-[8px] text-slate-500 block mt-0.5">
                  *Membantu follow up jika nomor asli disensor Shopee.
                </span>
              </div>

              {/* LTV & orders statistics */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-900">
                <div className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-900/50">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                    Total Belanja
                  </span>
                  <span className="font-mono text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(customer.total_spent)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-900/50">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                    Frekuensi
                  </span>
                  <span className="font-mono text-xs font-extrabold text-indigo-400">
                    {customer.total_orders}x Pesanan
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Address & Chat Action */}
            <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <MapPin size={10} className="text-slate-400" />
                  Alamat Lengkap Pengiriman
                </span>
                <p className="text-xs text-slate-300 leading-relaxed max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
                  {customer.full_address}
                </p>
              </div>

              {/* Direct WA Chat Call to Action */}
              <div className="pt-3 border-t border-slate-900 mt-auto">
                <a
                  href={getWhatsAppLink()}
                  onClick={handleFollowUpClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-xs font-bold text-black duration-200 transition-all shadow-md shadow-green-500/10 active:scale-95 font-sans"
                >
                  <MessageCircle size={14} />
                  Kirim Pesan WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Shopping History (Orders) */}
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-indigo-400" />
              <h4 className="font-display font-bold text-sm text-slate-200">
                Riwayat Belanja & Barang Dibeli (3 Hari Terakhir)
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-thin border border-slate-900 rounded-2xl bg-slate-950/30 divide-y divide-slate-900 p-1">
              {customer.orders?.map((order, oIdx) => (
                <div key={oIdx} className="p-3.5 space-y-2">
                  {/* Order header row */}
                  <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-300 font-semibold">
                        {order.order_sn}
                      </span>
                      <button
                        onClick={() => handleCopy(order.order_sn, `order_${oIdx}`)}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Salin nomor pesanan"
                      >
                        {copiedId === `order_${oIdx}` ? (
                          <Check size={10} className="text-green-400" />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                        order.order_status === "UNPAID"
                          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                          : order.order_status === "READY_TO_SHIP"
                          ? "bg-primary-500/10 border border-primary-500/20 text-primary-400"
                          : order.order_status === "SHIPPED"
                          ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                          : order.order_status === "COMPLETED"
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : "bg-slate-800 border border-slate-700 text-slate-400"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  {/* Logistics & Payment info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>
                        Kurir:{" "}
                        <strong className="text-slate-400">
                          {order.shipping_carrier}
                        </strong>
                      </span>
                      <span>
                        Bayar:{" "}
                        <strong className="text-slate-400">
                          {order.payment_method}
                        </strong>
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-300">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(order.total_amount)}
                    </span>
                  </div>

                  {/* Order items purchased */}
                  <div className="pl-2 border-l border-slate-850 space-y-2 mt-2">
                    {order.items?.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between gap-3 text-[10px] py-0.5"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.item_name}
                              className="h-6 w-6 rounded object-cover border border-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-[8px] text-slate-600 border border-slate-850 flex-shrink-0">
                              📦
                            </div>
                          )}
                          <div className="truncate flex-1">
                            <span className="text-slate-300 font-medium truncate block leading-tight">
                              {item.item_name}
                            </span>
                            {item.model_name && (
                              <span className="text-slate-500 text-[8px] truncate block mt-0.5">
                                Varian: {item.model_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-slate-400 font-mono text-[9px]">
                          {item.model_quantity || 1}x @
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(item.model_original_price || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end pt-3 border-t border-slate-800/40 mt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all active:scale-95 duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
