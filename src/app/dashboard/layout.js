"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Responsive Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Topbar with toggle button */}
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Dashboard Pages Area with responsive padding & margin offset */}
        <main className="flex-grow p-4 md:p-8 lg:ml-64 bg-gradient-to-b from-[#090d16] to-[#0b1220]">
          {children}
        </main>
      </div>
    </div>
  );
}
