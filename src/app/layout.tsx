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
  title: "CryptoPulse | Tổng Hợp Tin Tức AI",
  description: "Tin tức crypto thời gian thực được tạo bởi AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <nav className="glass-nav">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              <Newspaper color="var(--accent-primary)" />
              CryptoPulse
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/" className="text-gray" style={{ transition: 'color 0.2s' }}>Trang Chủ</Link>
              <Link href="/admin" className="text-gray" style={{ transition: 'color 0.2s' }}>Admin</Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="container mt-8">
          {children}
        </main>
        <footer className="container mt-8" style={{ padding: '2rem 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>&copy; 2025 CryptoPulse. Được vận hành bởi AI.</p>
        </footer>
      </body>
    </html>
  );
}
