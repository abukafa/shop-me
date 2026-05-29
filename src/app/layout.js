import "@/styles/globals.css";

export const metadata = {
  title: "ShopMe - E-commerce Multi-Shop Manager",
  description:
    "Manage your Shopee stores easily and automatically with high performance tools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#090d16] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
