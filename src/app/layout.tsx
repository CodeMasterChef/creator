import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { startAutoGeneration } from "@/lib/scheduler";

// Start auto-generation on server startup
if (typeof window === 'undefined') {
  startAutoGeneration();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thư Viện Tiền Số | Tin Tức Crypto Hàng Đầu",
  description: "Cập nhật tin tức Crypto và Blockchain mới nhất từ khắp thế giới.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <nav className="glass-nav sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="hidden sm:inline">Thư Viện Tiền Số</span>
              <span className="sm:hidden">TVTS</span>
            </Link>
            <div className="flex gap-3 sm:gap-6 items-center">
              <Link href="/" className="text-sm sm:text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Trang Chủ
              </Link>
              <Link href="/admin" className="text-sm sm:text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Admin
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 mt-12 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">&copy; 2025 Thư Viện Tiền Số. Mọi quyền được bảo lưu.</p>
        </footer>
      </body>
    </html>
  );
}
