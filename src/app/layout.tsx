import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { startAutoGeneration } from "@/lib/scheduler";

// Start auto-generation on server startup
if (typeof window === 'undefined') {
  startAutoGeneration();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://thuvientienso.com'),
  title: {
    default: "Thư Viện Tiền Số | Tin Tức Crypto & Blockchain Hàng Đầu",
    template: "%s | Thư Viện Tiền Số"
  },
  description: "Cập nhật tin tức Crypto, Bitcoin, Blockchain, và thị trường tiền điện tử mới nhất 24/7. Phân tích chuyên sâu và xu hướng đầu tư.",
  keywords: ["crypto", "bitcoin", "blockchain", "tiền ảo", "tin tức crypto", "thị trường tiền điện tử", "đầu tư crypto", "ethereum", "web3"],
  authors: [{ name: "Thư Viện Tiền Số Team" }],
  creator: "Thư Viện Tiền Số",
  publisher: "Thư Viện Tiền Số",
  openGraph: {
    title: "Thư Viện Tiền Số | Tin Tức Crypto & Blockchain Hàng Đầu",
    description: "Cập nhật tin tức Crypto, Bitcoin, Blockchain, và thị trường tiền điện tử mới nhất 24/7.",
    url: '/',
    siteName: 'Thư Viện Tiền Số',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/logo-thu-vien-tien-so.png',
        width: 800,
        height: 600,
        alt: 'Thư Viện Tiền Số Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Thư Viện Tiền Số | Tin Tức Crypto & Blockchain Hàng Đầu",
    description: "Cập nhật tin tức Crypto, Bitcoin, Blockchain, và thị trường tiền điện tử mới nhất 24/7.",
    images: ['/logo-thu-vien-tien-so.png'],
    creator: '@thuvientienso',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token', // Cần cập nhật token thật
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "Thư Viện Tiền Số",
  "url": process.env.NEXT_PUBLIC_APP_URL || 'https://thuvientienso.com',
  "logo": {
    "@type": "ImageObject",
    "url": `${process.env.NEXT_PUBLIC_APP_URL || 'https://thuvientienso.com'}/logo-thu-vien-tien-so.png`,
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://www.facebook.com/crypto.guru.to.the.moon",
    "https://twitter.com/thuvientienso"
  ],
  "description": "Nguồn tin tức hàng đầu về thị trường tiền điện tử và blockchain.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN"
  }
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
              <UserMenu />
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
                  <a href="https://www.facebook.com/crypto.guru.to.the.moon" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="Theo dõi chúng tôi trên Facebook">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
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
                  <li><Link href="/admin" className="hover:text-primary transition-colors">Admin</Link></li>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
