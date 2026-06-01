"use client";

import { useState, useEffect } from "react";
import {
  Users,
  MessageCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Settings,
} from "lucide-react";
import TemplateModal from "@/components/dashboard/TemplateModal";
import CustomerDetailModal from "@/components/dashboard/CustomerDetailModal";

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

  // Phone check & override functions
  const getEffectivePhone = (customer) => {
    if (!customer) return "";
    return manualPhones[customer.buyer_user_id] || customer.phone || "";
  };

  const isPhoneMasked = (phone) => {
    return !phone || phone.includes("*");
  };

  const handleSaveManualPhone = (buyerUserId, newPhone) => {
    const updated = { ...manualPhones, [buyerUserId]: newPhone };
    setManualPhones(updated);
    localStorage.setItem("crm_manual_phones", JSON.stringify(updated));

    // Also update selectedCustomer inside state to trigger instant UI update inside open modal
    if (selectedCustomer && selectedCustomer.buyer_user_id === buyerUserId) {
      setSelectedCustomer((prev) => ({
        ...prev,
        phone: newPhone,
      }));
    }
  };

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
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
          Atur Template WhatsApp
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
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        messageTemplate={messageTemplate}
        setMessageTemplate={setMessageTemplate}
        activeTemplateType={activeTemplateType}
        setActiveTemplateType={setActiveTemplateType}
      />

      {/* Customer Detail & Transactions Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        manualPhones={manualPhones}
        onSavePhone={handleSaveManualPhone}
        messageTemplate={messageTemplate}
      />
    </div>
  );
}
