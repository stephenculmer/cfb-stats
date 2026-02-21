import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFB Stats",
  description: "Ask questions about college football and get data-driven answers with visualizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity">
              CFB Stats
            </Link>
            <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/chat" className="hover:text-foreground transition-colors">Chat</Link>
              <Link href="/dashboard/season" className="hover:text-foreground transition-colors">Dashboards</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-500">
          <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
            <span>CFB Stats — powered by Claude &amp; College Football Data API</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
