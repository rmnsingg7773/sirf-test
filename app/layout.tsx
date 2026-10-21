import type { Metadata } from "next";
import "./globals.css";
import { Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "GEET - A Special Question",
  description: "A cute proposal specially crafted for Geet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-rose-900 antialiased">
        {/* Premium Romantic Header */}
        <header className="w-full py-4 px-6 bg-white/60 backdrop-blur-md border-b border-rose-200/50 sticky top-0 z-50 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-full text-rose-500 animate-pulse">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              GEET
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
            <Sparkles className="w-4 h-4" />
            <span>Only For You</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-4 text-center text-xs text-rose-400 border-t border-rose-100 bg-white/30 backdrop-blur-xs">
          Made with endless love ❤️
        </footer>
      </body>
    </html>
  );
}