"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Shield, ShieldAlert, Pause, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  supplyCap: string;
  variant: number;
  variantLabel: string;
  currency?: string;
  multiplier?: string;
  paused: {
    transfer: boolean;
    mint: boolean;
    burn: boolean;
  };
  policies: {
    transferSender: string;
    transferReceiver: string;
    transferExecutor: string;
    mintReceiver: string;
  };
  policyStatus: {
    isOpen: boolean;
    hasRestrictions: boolean;
  };
}

const ALWAYS_ALLOW = "0";

function PolicyBadge({ policyId, label }: { policyId: string; label: string }) {
  const isOpen = policyId === ALWAYS_ALLOW;
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isOpen
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
      }`}>
        {isOpen ? "ALWAYS_ALLOW" : `Policy #${policyId}`}
      </span>
    </div>
  );
}

function FeaturePause({ paused, label }: { paused: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      {paused ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
          PAUSED
        </span>
      ) : (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          Active
        </span>
      )}
    </div>
  );
}

function formatBigNumber(value: string, decimals: number): string {
  try {
    const bn = BigInt(value);
    if (bn === 0n) return "0";
    // Simplified format
    const divisor = BigInt(10 ** decimals);
    const whole = bn / divisor;
    return whole.toLocaleString();
  } catch {
    return value;
  }
}

function isUnlimited(value: string, decimals: number): boolean {
  try {
    // type(uint128).max = 340282366920938463463374607431768211455
    return BigInt(value) === BigInt("340282366920938463463374607431768211455");
  } catch {
    return false;
  }
}

export default function TokenPage() {
  const params = useParams();
  const address = params.address as string;

  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [network, setNetwork] = useState("sepolia");

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/token?address=${address}`)
      .then((r) => {
        if (!r.ok) throw new Error("Token not found");
        return r.json();
      })
      .then((data) => {
        setToken(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load token");
        setLoading(false);
      });

    setNetwork(process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet" : "sepolia");
  }, [address]);

  const explorerBase = network === "mainnet"
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <a
        href="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explorer
      </a>

      {loading && (
        <div className="text-center py-20 text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          Loading token data...
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-1">
            Pastikan address ini adalah B20 token yang valid di {network}.
          </p>
        </div>
      )}

      {token && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{token.name}</h1>
                  <span className="text-gray-500 text-lg">({token.symbol})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    token.variantLabel === "Asset"
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                  }`}>
                    B20 {token.variantLabel}
                  </span>
                  {token.currency && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {token.currency}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    token.policyStatus.isOpen
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}>
                    {token.policyStatus.isOpen ? "🟢 Open" : "🟡 Restricted"}
                  </span>
                </div>
              </div>
              <a
                href={`${explorerBase}/address/${token.address}`}
                target="_blank"
                rel="noopener"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            <div className="font-mono text-sm text-gray-400 bg-gray-800 rounded-lg px-3 py-2 break-all">
              {token.address}
            </div>
          </div>

          {/* Supply Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-200 mb-4">Supply</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">Total Supply</div>
                <div className="text-xl font-bold">
                  {formatBigNumber(token.totalSupply, token.decimals)}
                  <span className="text-gray-500 text-sm ml-1">{token.symbol}</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Supply Cap</div>
                <div className="text-xl font-bold">
                  {isUnlimited(token.supplyCap, token.decimals)
                    ? <span className="text-gray-500">Unlimited</span>
                    : <>{formatBigNumber(token.supplyCap, token.decimals)}
                        <span className="text-gray-500 text-sm ml-1">{token.symbol}</span>
                      </>
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Decimals</div>
                <div className="text-xl font-bold">{token.decimals}</div>
              </div>
              {token.multiplier && (
                <div>
                  <div className="text-gray-500 text-sm mb-1">Rebase Multiplier</div>
                  <div className="text-xl font-bold text-purple-400">
                    {(Number(BigInt(token.multiplier)) / 1e18).toFixed(6)}x
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pause Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-200 mb-4">
              Pause Status
              {(token.paused.transfer || token.paused.mint || token.paused.burn) && (
                <span className="ml-2 text-xs text-red-400">⚠️ Some features paused</span>
              )}
            </h2>
            <div>
              <FeaturePause paused={token.paused.transfer} label="Transfer" />
              <FeaturePause paused={token.paused.mint} label="Mint" />
              <FeaturePause paused={token.paused.burn} label="Burn" />
            </div>
          </div>

          {/* Policy Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-200 mb-1">Transfer Policies</h2>
            <p className="text-gray-600 text-xs mb-4">
              ALWAYS_ALLOW = tidak ada restriction. Policy ID lain = ada allowlist/blocklist aktif.
            </p>
            <div>
              <PolicyBadge policyId={token.policies.transferSender} label="Transfer Sender" />
              <PolicyBadge policyId={token.policies.transferReceiver} label="Transfer Receiver" />
              <PolicyBadge policyId={token.policies.transferExecutor} label="Transfer Executor" />
              <PolicyBadge policyId={token.policies.mintReceiver} label="Mint Receiver" />
            </div>

            {token.policyStatus.isOpen && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4" />
                Token ini fully open — tidak ada transfer restrictions
              </div>
            )}

            {token.policyStatus.hasRestrictions && (
              <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
                <Shield className="w-4 h-4" />
                Token ini punya compliance policies aktif
              </div>
            )}
          </div>

          {/* Raw Address Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-200 mb-4">Address Analysis</h2>
            <div className="font-mono text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">{token.address.slice(0, 6)}</span>
                <span className="text-gray-600 text-xs">← B20 prefix</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">{token.address.slice(6, 8)}</span>
                <span className="text-gray-600 text-xs">← Variant byte ({token.variantLabel === "Asset" ? "00" : "01"})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{token.address.slice(8)}</span>
                <span className="text-gray-600 text-xs">← keccak256(deployer, salt) [9 bytes]</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              B20 addresses encode varian langsung — bisa detect Asset vs Stablecoin tanpa RPC call.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
