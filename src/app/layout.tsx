import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://b20-explorer.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "B20 Explorer — Base Native Token Standard",
  description: "The first explorer for B20 — Base's native token standard, live with the Beryl hardfork. Track deployments, inspect token policies, and explore the future of ERC-20 on Base.",
  keywords: ["B20", "Base", "Beryl", "ERC-20", "token explorer", "blockchain", "Base mainnet"],
  authors: [{ name: "NeuroFade", url: "https://github.com/NeuroFade" }],
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "B20 Explorer — Base Native Token Standard",
    description: "The first explorer for B20 — Base's native token standard, live with the Beryl hardfork.",
    siteName: "B20 Explorer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "B20 Explorer — Base Native Token Standard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B20 Explorer — Base Native Token Standard",
    description: "The first explorer for B20 — Base's native token standard, live with the Beryl hardfork.",
    images: ["/og-image.png"],
    creator: "@NeuroFade",
  },
  robots: {
    index: true,
    follow: true,
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
            <a href="https://github.com/NeuroFade/b20-explorer" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
