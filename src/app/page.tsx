"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink, Shield, ShieldOff, Pause, CheckCircle, AlertCircle } from "lucide-react";
import { shortenAddress } from "@/lib/b20";

interface TokenEvent {
  type: string;
  txHash: string;
  blockNumber: string;
  token: string;
  data: {
    token: string;
    variant: string;
    deployer: string;
    salt: string;
  };
}

interface TokensResponse {
  tokens: TokenEvent[];
  count: number;
  network: string;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [tokens, setTokens] = useState<TokenEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [network, setNetwork] = useState("sepolia");

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((data: TokensResponse) => {
        setTokens(data.tokens || []);
        setNetwork(data.network);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tokens");
        setLoading(false);
      });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    // Kalau input adalah address, navigate ke token page
    if (search.startsWith("0x") && search.length === 42) {
      window.location.href = `/token/${search}`;
    }
  }

  const explorerBase = network === "mainnet"
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-blue-400">B20</span> Token Explorer
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Explore Base's native token standard — ERC-20 implemented as Rust precompiles with built-in compliance toolkit.
        </p>

        {/* Beryl Launch Banner */}
        <div className="mt-6 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-sm text-blue-400">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Beryl Hardfork — Mainnet aktif 25 Juni 2026 · Sepolia live sekarang
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Masukkan token address (0x...)"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Explore
          </button>
        </div>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total B20 Tokens", value: tokens.length.toString(), icon: "🪙" },
          { label: "Network", value: network === "mainnet" ? "Base Mainnet" : "Base Sepolia", icon: "🔵" },
          { label: "Standard", value: "ERC-20 Compatible", icon: "✅" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Token List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Recent B20 Deployments
        </h2>

        {loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            Fetching B20 events dari chain...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && tokens.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">Belum ada B20 token di-deploy di {network}.</p>
            <p className="text-gray-600 text-sm mt-1">
              B20 akan aktif di Sepolia 18 Juni · Mainnet 25 Juni 2026
            </p>
          </div>
        )}

        {!loading && tokens.length > 0 && (
          <div className="space-y-3">
            {tokens.map((event, i) => (
              <div
                key={`${event.txHash}-${i}`}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        event.data.variant === "Asset"
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }`}>
                        {event.data.variant}
                      </span>
                      <span className="text-gray-500 text-xs">Block #{event.blockNumber}</span>
                    </div>
                    <a
                      href={`/token/${event.data.token}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors break-all"
                    >
                      {event.data.token}
                    </a>
                    <div className="text-gray-600 text-xs mt-1">
                      Deployer: <span className="font-mono">{shortenAddress(event.data.deployer)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`/token/${event.data.token}`}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Detail
                    </a>
                    <a
                      href={`${explorerBase}/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener"
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-12 grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">🦀 Rust Precompile</h3>
          <p className="text-sm text-gray-500">
            B20 bukan smart contract EVM biasa — diimplementasikan sebagai Rust precompile. Lebih cepat, lebih murah.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">🛡️ Built-in Compliance</h3>
          <p className="text-sm text-gray-500">
            Transfer policies, freeze-and-seize, role-based access, supply cap — semuanya native di level protokol.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">📄 ERC-20 Compatible</h3>
          <p className="text-sm text-gray-500">
            Full selector parity dengan ERC-20. Tooling existing (Etherscan, Uniswap, dsb.) jalan tanpa modifikasi.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">🏭 Deterministik</h3>
          <p className="text-sm text-gray-500">
            Address B20 deterministik dan encode varian langsung. Bisa detect Asset vs Stablecoin tanpa RPC call.
          </p>
        </div>
      </div>
    </div>
  );
}
