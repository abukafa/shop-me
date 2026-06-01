"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  MessageCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Info,
  Settings,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  ShoppingBag,
  CreditCard,
  Save,
  CheckCircle2,
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


// Predefined message templates
const PREDEFINED_TEMPLATES = {
  processed:
    "Halo Kak {name},\n\nTerima kasih telah berbelanja di toko kami di Shopee. Kami ingin menginfokan bahwa pesanan Kakak dengan nomor *{order_sn}* sedang diproses. Mohon ditunggu ya! Jika ada pertanyaan, jangan ragu untuk menghubungi kami. 😊",
  cod: "Halo Kak {name},\n\nTerima kasih atas pesanan COD Anda dengan nomor *{order_sn}*. Kami ingin mengonfirmasi kesediaan Kakak untuk menerima paket ini saat kurir tiba. Harap balas pesan ini untuk konfirmasi pengiriman ya. Terima kasih! 🙏",
  unpaid:
    "Halo Kak {name},\n\nKami melihat Kakak memiliki pesanan *{order_sn}* yang belum diselesaikan pembayarannya di Shopee. Stok barang kami sangat terbatas, silakan selesaikan pembayaran agar kami bisa segera memproses paket Kakak hari ini. Terima kasih! 💸",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom Message Template State
  const [messageTemplate, setMessageTemplate] = useState("");
  const [activeTemplateType, setActiveTemplateType] = useState("processed");

  // Modals & Manual Phones Override States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [manualPhones, setManualPhones] = useState({});
  const [tempPhone, setTempPhone] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/orders/with-phone");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat pelanggan");
        setCustomers(data.customers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();

    // Load saved template from localStorage or use default
    const savedTemplate = localStorage.getItem("wa_template");
    const savedType = localStorage.getItem("wa_template_type");

    if (savedTemplate) {
      setMessageTemplate(savedTemplate);
    } else {
      setMessageTemplate(PREDEFINED_TEMPLATES.processed);
    }

    if (savedType) {
      setActiveTemplateType(savedType);
    }

    // Load saved manual phone overrides
    const savedPhones = localStorage.getItem("crm_manual_phones");
    if (savedPhones) {
      try {
        setManualPhones(JSON.parse(savedPhones));
      } catch (e) {
        console.error("Gagal memuat manual phones", e);
      }
    }
  }, []);

  // Reset page when customers search/list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [customers]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Change active template category
  const selectTemplateType = (type) => {
    setActiveTemplateType(type);
    setMessageTemplate(PREDEFINED_TEMPLATES[type]);
    localStorage.setItem("wa_template", PREDEFINED_TEMPLATES[type]);
    localStorage.setItem("wa_template_type", type);
  };

  // Handle manual template typing
  const handleTemplateChange = (e) => {
    const text = e.target.value;
    setMessageTemplate(text);
    localStorage.setItem("wa_template", text);
    setActiveTemplateType("custom");
    localStorage.setItem("wa_template_type", "custom");
  };

  // Click variable chip to insert token at text cursor/end
  const insertToken = (token) => {
    const textarea = document.getElementById("template-editor");
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const beforeText = messageTemplate.substring(0, startPos);
    const afterText = messageTemplate.substring(endPos, messageTemplate.length);

    const updatedText = beforeText + token + afterText;
    setMessageTemplate(updatedText);
    localStorage.setItem("wa_template", updatedText);
    setActiveTemplateType("custom");
    localStorage.setItem("wa_template_type", "custom");

    // Re-focus and position cursor after token
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + token.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Replace tokens for live preview
  const getPreviewText = () => {
    return messageTemplate
      .replace(/{name}/g, "Budi Santoso")
      .replace(/{order_sn}/g, "260601VDRX519P");
  };

  // Phone check & override functions
  const getEffectivePhone = (customer) => {
    if (!customer) return "";
    return manualPhones[customer.buyer_user_id] || customer.phone || "";
  };

  const isPhoneMasked = (phone) => {
    return !phone || phone.includes("*");
  };

  const handleSaveManualPhone = (buyerUserId) => {
    const updated = { ...manualPhones, [buyerUserId]: tempPhone };
    setManualPhones(updated);
    localStorage.setItem("crm_manual_phones", JSON.stringify(updated));

    // Also update selectedCustomer inside state to trigger instant UI update inside open modal
    if (selectedCustomer && selectedCustomer.buyer_user_id === buyerUserId) {
      setSelectedCustomer((prev) => ({
        ...prev,
        phone: tempPhone,
      }));
    }
  };

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
    setTempPhone(manualPhones[customer.buyer_user_id] || customer.phone || "");
  };

  // Generate real WhatsApp link using effective phone (original or overridden)
  const getWhatsAppLink = (customer) => {
    const phone = getEffectivePhone(customer);
    const name = customer.customer_name;
    const orderSn = customer.orders?.[0]?.order_sn || customer.order_sn || "";

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    const personalizedMessage = messageTemplate
      .replace(/{name}/g, name)
      .replace(/{order_sn}/g, orderSn);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;
  };

  const handleFollowUpClick = (e, customer) => {
    const phone = getEffectivePhone(customer);
    if (isPhoneMasked(phone)) {
      e.preventDefault();
      alert(
        "Nomor telepon pelanggan masih tersensor (****) oleh Shopee. Silakan masukkan nomor HP secara manual terlebih dahulu di dalam Modal Detail untuk melakukan Follow Up WhatsApp.",
      );
      openDetailModal(customer);
    }
  };

  // Pagination math
  const displayedCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-8">
      {/* Header Grid */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            CRM Pelanggan & WhatsApp Follow-Up
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola data pembeli unik, pantau riwayat belanja kumulatif, dan
            kirim pesan kustom secara fleksibel.
          </p>
        </div>
        <button
          onClick={() => setIsTemplateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all active:scale-95 duration-200 self-start md:self-center shadow-md shadow-slate-950/20"
        >
          <Settings size={14} className="text-primary-400" />
          Atur Template
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center glass-panel rounded-3xl border-red-500/20 max-w-xl mx-auto">
          <span className="text-3xl">⚠️</span>
          <h3 className="font-display font-bold text-lg mt-4 text-white">
            Gagal Memuat Pelanggan
          </h3>
          <p className="text-slate-400 text-sm mt-2">{error}</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800">
          <Users className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="font-display font-semibold text-lg text-white">
            Belum Ada Pelanggan
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Tidak ada data pesanan dengan nomor telepon aktif saat ini.
          </p>
        </div>
      ) : (
        <>
          {/* Customer CRM Table */}
          <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4 w-12 text-center">No</th>
                    <th className="px-6 py-4">Nama Pelanggan</th>
                    <th className="px-6 py-4">Nomor Telepon</th>
                    <th className="px-6 py-4 w-44">Order SN</th>
                    <th className="px-6 py-4 text-center w-75">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {displayedCustomers.map((c, idx) => {
                    const absoluteIndex =
                      (currentPage - 1) * itemsPerPage + idx + 1;
                    const effectivePhone = getEffectivePhone(c);
                    const hasOverride = !!manualPhones[c.buyer_user_id];
                    const isMasked = isPhoneMasked(effectivePhone);
                    const latestOrderSn =
                      c.orders?.[0]?.order_sn || c.order_sn || "";

                    return (
                      <tr
                        key={c.buyer_user_id || idx}
                        className="hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-center font-mono font-medium text-slate-500">
                          {absoluteIndex}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-semibold text-slate-200">
                              {c.customer_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              @{c.buyer_username} | ID: {c.buyer_user_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-300">
                              {effectivePhone || "-"}
                            </span>
                            {isMasked ? (
                              <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-wider flex-shrink-0">
                                Tersensor
                              </span>
                            ) : hasOverride ? (
                              <span
                                className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider flex-shrink-0"
                                title="Nomor diisi manual"
                              >
                                Manual
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[120px]">
                              {latestOrderSn}
                            </span>
                            <button
                              onClick={() => handleCopy(latestOrderSn, idx)}
                              className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
                              title="Salin nomor pesanan"
                            >
                              {copiedId === idx ? (
                                <Check size={12} className="text-green-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={getWhatsAppLink(c)}
                              onClick={(e) => handleFollowUpClick(e, c)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border ${
                                isMasked
                                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                  : "bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500 hover:text-black shadow-md shadow-green-500/5 hover:shadow-green-500/15"
                              }`}
                            >
                              <MessageCircle size={12} />
                              {isMasked ? "Override WA" : "Follow Up"}
                            </a>
                            <button
                              onClick={() => openDetailModal(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all active:scale-95 duration-200"
                            >
                              <Info size={12} />
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {customers.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-slate-800/40 bg-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-200">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-slate-200">
                    {Math.min(currentPage * itemsPerPage, customers.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-200">
                    {customers.length}
                  </span>{" "}
                  pelanggan
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
                    { length: Math.ceil(customers.length / itemsPerPage) },
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
                          Math.ceil(customers.length / itemsPerPage),
                        ),
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(customers.length / itemsPerPage)
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
        </>
      )}

      {/* WhatsApp Template Customization Modal */}
      {isTemplateModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel max-w-4xl w-full rounded-3xl border border-slate-800/80 p-5 sm:p-6 overflow-y-auto max-h-[90vh] shadow-2xl relative flex flex-col gap-4">
              {/* Close Button */}
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors h-8 w-8 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center active:scale-95 duration-200"
              >
                <X size={14} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2 border-b border-slate-800/50 pb-3">
                <Settings
                  size={18}
                  className="text-primary-400 animate-spin-slow"
                />
                <h3 className="font-display font-bold text-base text-slate-200">
                  Pengaturan Templat WhatsApp
                </h3>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold ml-auto pr-6 me-4">
                  Auto Save Aktif
                </span>
              </div>

              {/* Selector Predefined Tabs */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => selectTemplateType("processed")}
                  className={`px-3.5 py-2 rounded-xl border transition-all ${
                    activeTemplateType === "processed"
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400 font-bold"
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  📦 Proses Pesanan
                </button>
                <button
                  onClick={() => selectTemplateType("cod")}
                  className={`px-3.5 py-2 rounded-xl border transition-all ${
                    activeTemplateType === "cod"
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400 font-bold"
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  🤝 Konfirmasi COD
                </button>
                <button
                  onClick={() => selectTemplateType("unpaid")}
                  className={`px-3.5 py-2 rounded-xl border transition-all ${
                    activeTemplateType === "unpaid"
                      ? "bg-primary-500/10 border-primary-500/30 text-primary-400 font-bold"
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  💸 Pengingat Belum Bayar
                </button>
                <button
                  disabled
                  className={`px-3.5 py-2 rounded-xl border opacity-70 ${
                    activeTemplateType === "custom"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                      : "bg-slate-900/10 border-slate-900 text-slate-600"
                  }`}
                >
                  ✍️ Kustom/Manual
                </button>
              </div>

              {/* Editor Textarea & Live Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                <div className="md:col-span-7 space-y-3 flex flex-col">
                  <div className="relative flex-1">
                    <textarea
                      id="template-editor"
                      value={messageTemplate}
                      onChange={handleTemplateChange}
                      placeholder="Tulis templat pesan follow-up kustom Anda..."
                      className="glass-input rounded-2xl p-4 w-full h-40 text-xs leading-relaxed resize-none scrollbar-thin font-sans"
                    />
                  </div>

                  {/* Variable Token Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="text-slate-500 font-semibold uppercase flex items-center gap-1">
                      <Sparkles size={10} className="text-slate-400" />
                      Sisipkan Variabel:
                    </span>
                    <button
                      onClick={() => insertToken("{name}")}
                      className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-primary-400 hover:border-slate-700 transition-all font-mono font-bold"
                    >
                      {"{name}"}
                    </button>
                    <button
                      onClick={() => insertToken("{order_sn}")}
                      className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-primary-400 hover:border-slate-700 transition-all font-mono font-bold"
                    >
                      {"{order_sn}"}
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="md:col-span-5 flex flex-col">
                  <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-900 flex-1 flex flex-col">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                      <FileText size={10} />
                      Pratinjau Pesan Terkirim (Contoh)
                    </div>
                    <div className="flex-1 p-3.5 rounded-xl bg-slate-900/25 border border-slate-800/40 text-[11px] text-slate-300 leading-relaxed whitespace-pre-line font-sans overflow-y-auto max-h-[140px] scrollbar-thin select-none">
                      {getPreviewText()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-4 flex justify-end gap-2 border-t border-slate-800/40 pt-4">
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white transition-all shadow-md active:scale-95 duration-200"
                >
                  Simpan & Selesai
                </button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Customer Detail & Transactions Modal */}
      {selectedCustomer && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-800/80 p-5 sm:p-6 overflow-y-auto max-h-[90vh] shadow-2xl relative flex flex-col gap-5">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors h-8 w-8 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center active:scale-95 duration-200"
              >
                <X size={14} />
              </button>

              {/* Modal Profile Header */}
              <div className="flex items-center gap-4 border-b border-slate-800/50 pb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-display font-extrabold text-white text-xl shadow-lg shadow-primary-500/10">
                  {selectedCustomer.customer_name
                    ? selectedCustomer.customer_name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 leading-tight">
                    {selectedCustomer.customer_name}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 block mt-0.5">
                    Buyer ID: {selectedCustomer.buyer_user_id} (@
                    {selectedCustomer.buyer_username})
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
                      <span>{selectedCustomer.phone || "Tidak ada telepon"}</span>
                      {isPhoneMasked(selectedCustomer.phone) && (
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
                        onClick={() => {
                          handleSaveManualPhone(selectedCustomer.buyer_user_id);
                          alert("Nomor WA manual berhasil disimpan!");
                        }}
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
                        }).format(selectedCustomer.total_spent)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-900/50">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                        Frekuensi
                      </span>
                      <span className="font-mono text-xs font-extrabold text-indigo-400">
                        {selectedCustomer.total_orders}x Pesanan
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
                      {selectedCustomer.full_address}
                    </p>
                  </div>

                  {/* Direct WA Chat Call to Action */}
                  <div className="pt-3 border-t border-slate-900 mt-auto">
                    <a
                      href={getWhatsAppLink(selectedCustomer)}
                      onClick={(e) => handleFollowUpClick(e, selectedCustomer)}
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
                  {selectedCustomer.orders?.map((order, oIdx) => (
                    <div key={oIdx} className="p-3.5 space-y-2">
                      {/* Order header row */}
                      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-300 font-semibold">
                            {order.order_sn}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(order.order_sn, `order_${oIdx}`)
                            }
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
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all active:scale-95 duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
