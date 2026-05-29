import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-glow-blue pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-glow-purple pointer-events-none" />

      {/* Header */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-orange flex items-center justify-center font-display font-extrabold text-xl shadow-glow-primary">
            S
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ShopMe
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium hover:text-primary-400 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-glow-primary transition-all duration-300"
          >
            Daftar Sekarang
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex-grow flex flex-col justify-center items-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-500/20 bg-primary-500/5 text-xs text-primary-400 font-medium mb-6 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-400"></span>
          Platform Manajemen Shopee Terintegrasi
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Kuasai Penjualan <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-500 to-accent-orange">
            E-commerce Anda
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Hubungkan toko Shopee Anda, kelola stok barang secara realtime, lacak
          pesanan pembeli dengan peta logistik instan, dan bangun CRM WhatsApp
          langsung dalam satu dasbor super canggih.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-orange hover:brightness-110 shadow-glow-primary transition-all duration-300 font-bold text-base"
          >
            Mulai Secara Gratis
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl border border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-600 transition-all font-semibold text-base"
          >
            Demo Aplikasi
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-24">
          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4 font-bold text-xl border border-primary-500/20">
              ⚡
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Sinkronisasi Instan
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hubungkan API Shopee dengan satu klik aman. Data produk dan
              pesanan sinkron seketika.
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="h-12 w-12 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange mb-4 font-bold text-xl border border-accent-orange/20">
              💬
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              CRM Pelanggan
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dapatkan data pembeli beserta nomor telepon dan alamat lengkap.
              Kirim WhatsApp follow-up instan.
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl text-left">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 font-bold text-xl border border-purple-500/20">
              📦
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Lacak Resi Pengiriman
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Visualisasi perjalanan paket dari kurir hingga tangan pembeli
              secara otomatis.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-slate-800/60 z-10 text-center text-slate-500 text-xs">
        <p>
          &copy; {new Date().getFullYear()} ShopMe. Dibuat dengan cinta untuk
          efisiensi pedagang lokal.
        </p>
      </footer>
    </div>
  );
}
