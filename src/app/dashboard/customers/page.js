"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, Copy, Check } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

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
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getWhatsAppLink = (phone, name, orderSn) => {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    const message = `Halo Kak ${name},\nTerima kasih telah berbelanja di toko kami di Shopee. Kami ingin menginfokan bahwa pesanan Kakak dengan nomor resi/sn *${orderSn}* sedang diproses. Mohon ditunggu ya! Jika ada pertanyaan, jangan ragu untuk memberi tahu kami. 😊`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          CRM Pelanggan & WhatsApp Follow-Up
        </h1>
        <p className="text-slate-400 text-sm">
          Lihat pesanan yang memiliki nomor telepon aktif. Lakukan follow-up
          instan via WhatsApp.
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
      ) : customers.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800">
          <Users className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="font-display font-semibold text-lg text-white">
            Belum Ada Pelanggan
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Tidak ada data pesanan dengan nomor telepon lengkap saat ini.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Pelanggan</th>
                  <th className="px-6 py-4">Nomor Telepon</th>
                  <th className="px-6 py-4">Alamat Lengkap</th>
                  <th className="px-6 py-4">Order SN</th>
                  <th className="px-6 py-4">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {customers.map((c, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {c.customer_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {c.phone}
                    </td>
                    <td
                      className="px-6 py-4 text-slate-400 max-w-xs truncate"
                      title={c.full_address}
                    >
                      {c.full_address}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 flex items-center gap-2">
                      <span>{c.order_sn}</span>
                      <button
                        onClick={() => handleCopy(c.order_sn, idx)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedId === idx ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getWhatsAppLink(
                          c.phone,
                          c.customer_name,
                          c.order_sn,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/20 text-xs font-bold text-green-400 hover:bg-green-500 hover:text-black transition-all"
                      >
                        <MessageCircle size={14} />
                        Kirim Chat
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
