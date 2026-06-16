import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B20 Explorer — Base Native Token Standard",
  description: "Explore B20 tokens on Base — the native ERC-20 standard with built-in compliance toolkit",
  openGraph: {
    title: "B20 Explorer",
    description: "Explore B20 tokens on Base",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-xl">B20</span>
            <span className="text-gray-400 text-sm font-medium">Explorer</span>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
              {process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "Mainnet" : "Sepolia"}
            </span>
          </a>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <a href="https://docs.base.org/base-chain/specs/upgrades/beryl/b20" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="https://github.com/base/base-std" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              base-std
            </a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
