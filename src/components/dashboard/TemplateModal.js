"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Settings, Sparkles, FileText } from "lucide-react";

// SSR-Safe React Portal helper component
function ClientPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

const PREDEFINED_TEMPLATES = {
  processed:
    "Halo Kak {name},\n\nTerima kasih telah berbelanja di toko kami di Shopee. Kami ingin menginfokan bahwa pesanan Kakak dengan nomor *{order_sn}* sedang diproses. Mohon ditunggu ya! Jika ada pertanyaan, jangan ragu untuk menghubungi kami. 😊",
  cod: "Halo Kak {name},\n\nTerima kasih atas pesanan COD Anda dengan nomor *{order_sn}*. Kami ingin mengonfirmasi kesediaan Kakak untuk menerima paket ini saat kurir tiba. Harap balas pesan ini untuk konfirmasi pengiriman ya. Terima kasih! 🙏",
  unpaid:
    "Halo Kak {name},\n\nKami melihat Kakak memiliki pesanan *{order_sn}* yang belum diselesaikan pembayarannya di Shopee. Stok barang kami sangat terbatas, silakan selesaikan pembayaran agar kami bisa segera memproses paket Kakak hari ini. Terima kasih! 💸",
};

export default function TemplateModal({
  isOpen,
  onClose,
  messageTemplate,
  setMessageTemplate,
  activeTemplateType,
  setActiveTemplateType,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

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

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div 
          className="glass-panel max-w-4xl w-full rounded-3xl border border-slate-800/80 p-5 sm:p-6 overflow-y-auto max-h-[90vh] shadow-2xl relative flex flex-col gap-4 scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
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
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white transition-all shadow-md active:scale-95 duration-200"
            >
              Simpan & Selesai
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
