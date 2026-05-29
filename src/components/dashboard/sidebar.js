"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Users,
  Truck,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Ringkasan", path: "/dashboard", icon: LayoutDashboard },
    { name: "Produk Shopee", path: "/dashboard/products", icon: ShoppingBag },
    { name: "Pesanan", path: "/dashboard/orders", icon: Receipt },
    { name: "CRM WhatsApp", path: "/dashboard/customers", icon: Users },
    { name: "Lacak Paket", path: "/dashboard/tracking", icon: Truck },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-screen flex flex-col justify-between fixed left-0 top-0 z-20">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-orange flex items-center justify-center font-display font-extrabold text-lg shadow-glow-primary">
            S
          </div>
          <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ShopMe
          </span>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-grow p-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary-500/10 to-primary-600/5 text-primary-400 border border-primary-500/20 shadow-glow-primary/5"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-primary-400" : "text-slate-400"}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent"
        >
          <LogOut size={18} />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );
}
