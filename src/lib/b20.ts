import { createPublicClient, http, parseAbi, getAddress, type Address } from "viem";
import { baseSepolia, base } from "viem/chains";

// ─── Precompile Addresses (dari StdPrecompiles.sol) ───────────────────────
export const B20_FACTORY_ADDRESS = "0xB20f000000000000000000000000000000000000" as Address;
export const POLICY_REGISTRY_ADDRESS = "0x8453000000000000000000000000000000000002" as Address;
export const ACTIVATION_REGISTRY_ADDRESS = "0x8453000000000000000000000000000000000001" as Address;

// ─── B20 Address Prefix Detection ─────────────────────────────────────────
// Address: [10-byte B20 prefix][1-byte variant][9-byte keccak(deployer, salt)]
// B20 prefix = 0xB20f (dari factory address pattern)
// Variant byte: 0x00 = Asset, 0x01 = Stablecoin
const B20_PREFIX = "b20f"; // low bytes of factory address prefix pattern

export enum B20Variant {
  Asset = 0,
  Stablecoin = 1,
  Unknown = -1,
}

export function isB20Address(address: string): boolean {
  // B20 token addresses start with 0xB20f (case-insensitive)
  return address.toLowerCase().startsWith("0xb20f");
}

export function getVariantFromAddress(address: string): B20Variant {
  if (!isB20Address(address)) return B20Variant.Unknown;
  // Byte 11 (index 22-23 in hex string after 0x) encodes variant
  const variantByte = parseInt(address.slice(22, 24), 16);
  if (variantByte === 0x00) return B20Variant.Asset;
  if (variantByte === 0x01) return B20Variant.Stablecoin;
  return B20Variant.Unknown;
}

export function variantLabel(variant: B20Variant): string {
  if (variant === B20Variant.Asset) return "Asset";
  if (variant === B20Variant.Stablecoin) return "Stablecoin";
  return "Unknown";
}

// ─── ABI (subset yang dibutuhkan) ─────────────────────────────────────────
export const ERC20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
]);

export const B20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function paused(uint8 feature) view returns (bool)",
  "function supplyCap() view returns (uint128)",
  "function policyId(uint8 scope) view returns (uint64)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Paused(uint8 indexed feature)",
  "event Unpaused(uint8 indexed feature)",
  "event Memo(address indexed caller, bytes32 indexed memo)",
]);

export const B20_STABLECOIN_ABI = parseAbi([
  "function currency() view returns (string)",
]);

export const B20_ASSET_ABI = parseAbi([
  "function multiplier() view returns (uint256)",
]);

export const B20_FACTORY_ABI = parseAbi([
  "event B20Created(address indexed token, uint8 indexed variant, address indexed deployer, bytes32 salt)",
  "function getB20Address(uint8 variant, address deployer, bytes32 salt) view returns (address)",
  "function isB20(address token) view returns (bool)",
  "function isB20Initialized(address token) view returns (bool)",
]);

export const POLICY_REGISTRY_ABI = parseAbi([
  "function isAuthorized(uint64 policyId, address account) view returns (bool)",
  "function policyExists(uint64 policyId) view returns (bool)",
  "function policyAdmin(uint64 policyId) view returns (address)",
]);

// ─── Policy Scope enum (dari spec) ─────────────────────────────────────────
export enum PolicyScope {
  TransferSender = 0,
  TransferReceiver = 1,
  TransferExecutor = 2,
  MintReceiver = 3,
}

// PausableFeature enum
export enum PausableFeature {
  Transfer = 0,
  Mint = 1,
  Burn = 2,
}

// ALWAYS_ALLOW policy ID = 0
export const ALWAYS_ALLOW_POLICY_ID = BigInt(0);

// ─── RPC Client ─────────────────────────────────────────────────────────────
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet" : "sepolia";

export function getClient() {
  if (NETWORK === "mainnet") {
    return createPublicClient({
      chain: base,
      transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
    });
  }
  return createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_RPC_URL || "https://sepolia.base.org"),
  });
}

export function getExplorerUrl(hash: string, type: "tx" | "address" = "tx"): string {
  const base = NETWORK === "mainnet"
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";
  return `${base}/${type}/${hash}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface B20Token {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  supplyCap: bigint;
  variant: B20Variant;
  variantLabel: string;
  currency?: string;       // Stablecoin only
  multiplier?: bigint;     // Asset only
  paused: {
    transfer: boolean;
    mint: boolean;
    burn: boolean;
  };
  policies: {
    transferSender: bigint;
    transferReceiver: bigint;
    transferExecutor: bigint;
    mintReceiver: bigint;
  };
  policyStatus: {
    isOpen: boolean;       // semua policy ALWAYS_ALLOW
    hasRestrictions: boolean;
  };
  deployedAt?: number;     // block number
  deployer?: Address;
}

export interface RecentEvent {
  type: "Transfer" | "Paused" | "Unpaused" | "B20Created";
  txHash: string;
  blockNumber: bigint;
  token?: Address;
  data: Record<string, string>;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

export async function fetchB20Token(address: Address): Promise<B20Token | null> {
  const client = getClient();

  try {
    // Verifikasi dulu apakah ini B20
    const isB20 = await client.readContract({
      address: B20_FACTORY_ADDRESS,
      abi: B20_FACTORY_ABI,
      functionName: "isB20",
      args: [address],
    });

    if (!isB20) return null;

    const variant = getVariantFromAddress(address);

    // Batch read semua data dasar
    const [name, symbol, decimals, totalSupply, supplyCap] = await Promise.all([
      client.readContract({ address, abi: B20_ABI, functionName: "name" }),
      client.readContract({ address, abi: B20_ABI, functionName: "symbol" }),
      client.readContract({ address, abi: B20_ABI, functionName: "decimals" }),
      client.readContract({ address, abi: B20_ABI, functionName: "totalSupply" }),
      client.readContract({ address, abi: B20_ABI, functionName: "supplyCap" }),
    ]);

    // Pause state per feature
    const [pausedTransfer, pausedMint, pausedBurn] = await Promise.all([
      client.readContract({ address, abi: B20_ABI, functionName: "paused", args: [PausableFeature.Transfer] }),
      client.readContract({ address, abi: B20_ABI, functionName: "paused", args: [PausableFeature.Mint] }),
      client.readContract({ address, abi: B20_ABI, functionName: "paused", args: [PausableFeature.Burn] }),
    ]);

    // Policy IDs per scope
    const [polSender, polReceiver, polExecutor, polMintReceiver] = await Promise.all([
      client.readContract({ address, abi: B20_ABI, functionName: "policyId", args: [PolicyScope.TransferSender] }),
      client.readContract({ address, abi: B20_ABI, functionName: "policyId", args: [PolicyScope.TransferReceiver] }),
      client.readContract({ address, abi: B20_ABI, functionName: "policyId", args: [PolicyScope.TransferExecutor] }),
      client.readContract({ address, abi: B20_ABI, functionName: "policyId", args: [PolicyScope.MintReceiver] }),
    ]);

    const isOpen =
      polSender === ALWAYS_ALLOW_POLICY_ID &&
      polReceiver === ALWAYS_ALLOW_POLICY_ID &&
      polExecutor === ALWAYS_ALLOW_POLICY_ID &&
      polMintReceiver === ALWAYS_ALLOW_POLICY_ID;

    // Variant-specific data
    let currency: string | undefined;
    let multiplier: bigint | undefined;

    if (variant === B20Variant.Stablecoin) {
      currency = await client.readContract({
        address,
        abi: B20_STABLECOIN_ABI,
        functionName: "currency",
      });
    }

    if (variant === B20Variant.Asset) {
      multiplier = await client.readContract({
        address,
        abi: B20_ASSET_ABI,
        functionName: "multiplier",
      });
    }

    return {
      address,
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: totalSupply as bigint,
      supplyCap: supplyCap as bigint,
      variant,
      variantLabel: variantLabel(variant),
      currency,
      multiplier,
      paused: {
        transfer: pausedTransfer as boolean,
        mint: pausedMint as boolean,
        burn: pausedBurn as boolean,
      },
      policies: {
        transferSender: polSender as bigint,
        transferReceiver: polReceiver as bigint,
        transferExecutor: polExecutor as bigint,
        mintReceiver: polMintReceiver as bigint,
      },
      policyStatus: {
        isOpen,
        hasRestrictions: !isOpen,
      },
    };
  } catch (err) {
    console.error("fetchB20Token error:", err);
    return null;
  }
}

export async function fetchRecentB20Creations(limit = 20): Promise<RecentEvent[]> {
  const client = getClient();
  try {
    // Public RPC membatasi max 2000 blocks per getLogs query
    // Ambil hanya 2000 block terakhir untuk menghindari error
    const latestBlock = await client.getBlockNumber();
    const fromBlock = latestBlock > 2000n ? latestBlock - 2000n : 0n;

    const logs = await client.getLogs({
      address: B20_FACTORY_ADDRESS,
      event: B20_FACTORY_ABI[0], // B20Created event
      fromBlock,
      toBlock: "latest",
    });

    return logs.slice(-limit).reverse().map((log) => ({
      type: "B20Created" as const,
      txHash: log.transactionHash || "",
      blockNumber: log.blockNumber || 0n,
      token: log.args?.token as Address,
      data: {
        token: log.args?.token as string || "",
        variant: log.args?.variant === 0 ? "Asset" : "Stablecoin",
        deployer: log.args?.deployer as string || "",
        salt: log.args?.salt as string || "",
      },
    }));
  } catch (err) {
    console.error("fetchRecentB20Creations error:", err);
    return [];
  }
}

export function formatUnits(value: bigint, decimals: number): string {
  if (value === 0n) return "0";
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  if (fraction === 0n) return whole.toLocaleString();
  const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 4);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
