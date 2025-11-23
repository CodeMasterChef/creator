import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
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
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative h-8 sm:h-10 aspect-square">
                <Image 
                  src="/logo-thu-vien-tien-so.png" 
                  alt="Thư Viện Tiền Số" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="hidden sm:inline text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Thư Viện Tiền Số</span>
              <span className="sm:hidden text-xl font-bold text-gray-900 dark:text-white">TVTS</span>
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
        <footer className="w-full bg-gray-900 text-gray-300 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo & Description */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative h-12 aspect-square">
                    <Image 
                      src="/logo-thu-vien-tien-so.png" 
                      alt="Thư Viện Tiền Số" 
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold text-white">Thư Viện Tiền Số</span>
                </div>
                <p className="text-sm text-gray-400 mb-4 max-w-md">
                  Nguồn tin tức hàng đầu về thị trường tiền điện tử và blockchain. Cập nhật tin tức nhanh nhất từ các nguồn uy tín trên thế giới.
                </p>
                <div className="flex gap-4">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </a>
                  <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Danh Mục</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/?category=bitcoin" className="hover:text-primary transition-colors">Bitcoin</Link></li>
                  <li><Link href="/?category=ethereum" className="hover:text-primary transition-colors">Ethereum</Link></li>
                  <li><Link href="/?category=xrp" className="hover:text-primary transition-colors">XRP</Link></li>
                  <li><Link href="/?category=market" className="hover:text-primary transition-colors">Thị Trường</Link></li>
                </ul>
              </div>

              {/* About */}
              <div>
                <h3 className="text-white font-semibold mb-4">Về Chúng Tôi</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-primary transition-colors">Giới Thiệu</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Liên Hệ</Link></li>
                  <li><Link href="/privacy" className="hover:text-primary transition-colors">Chính Sách</Link></li>
                  <li><Link href="/terms" className="hover:text-primary transition-colors">Điều Khoản</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                &copy; 2025 Thư Viện Tiền Số. Mọi quyền được bảo lưu.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
