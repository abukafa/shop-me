import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#090d16] flex">
      <Sidebar />
      <div className="flex-grow flex flex-col min-w-0">
        <Topbar />
        <main className="flex-grow p-8 ml-64 bg-gradient-to-b from-[#090d16] to-[#0b1220]">
          {children}
        </main>
      </div>
    </div>
  );
}
