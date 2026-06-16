# B20 Explorer

> The first explorer for B20 — Base's native token standard, live with the Beryl hardfork.

[![Live](https://img.shields.io/badge/live-b20--explorer.vercel.app-blue)](https://b20-explorer.vercel.app)
[![Network](https://img.shields.io/badge/network-Base%20Sepolia-brightgreen)](https://sepolia.basescan.org)
[![Built with](https://img.shields.io/badge/built%20with-Next.js%2014-black)](https://nextjs.org)

---

## What is B20?

B20 is Base's new native token standard introduced in the **Beryl hardfork**. Unlike regular ERC-20 tokens (deployed as EVM bytecode), B20 tokens are implemented as **Rust precompiles** — making them faster, cheaper, and more powerful.

B20 comes in two variants:

| Variant | Decimals | Key feature |
|---------|----------|-------------|
| **Asset** | 18 | Rebase yield via `multiplier()` |
| **Stablecoin** | 6 | Fiat currency peg via `currency()` |

Both variants include a built-in compliance toolkit: transfer policies, supply caps, per-feature pause, and role-based access — all at the protocol level.

---

## Features

- **Auto-detect B20 tokens** — scans `B20Created` events from the factory precompile
- **Token detail page** — supply, supply cap, decimals, pause status, policy health
- **Policy indicator** — instantly see if a token is open or restricted
- **Address analysis** — decodes variant (Asset/Stablecoin) directly from the address bytes
- **Basescan links** — one-click to verify on the block explorer
- **Sepolia + Mainnet** — switch networks via a single env variable

---

## Tech Stack

- **Next.js 14** — App Router, Server Components
- **Viem 2.x** — type-safe Ethereum client
- **Tailwind CSS** — utility-first styling
- **Vercel** — zero-config deployment

---

## Getting Started

```bash
git clone https://github.com/NeuroFade/b20-explorer.git
cd b20-explorer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_NETWORK` | `sepolia` or `mainnet` | `sepolia` |
| `BASE_RPC_URL` | Base RPC endpoint | `https://sepolia.base.org` |

Copy `.env.example` to `.env.local` and fill in your values.

---

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Fork this repo
2. Import to [vercel.com](https://vercel.com/new)
3. Set environment variables
4. Deploy — live in ~2 minutes

**Switching to mainnet (June 25, 2026):**

Update two env vars in the Vercel dashboard:
```
NEXT_PUBLIC_NETWORK=mainnet
BASE_RPC_URL=https://mainnet.base.org
```

Vercel auto-redeploys immediately.

---

## Beryl Hardfork Timeline

| Network | Date | Status |
|---------|------|--------|
| Base Sepolia | June 18, 2026 | ✅ Live |
| Base Mainnet | June 25, 2026 | 🔜 Upcoming |

---

## API

```bash
# List recent B20 token deployments
GET /api/tokens

# Get token details by address
GET /api/token?address=0x...
```

---

## Roadmap

- [ ] Real-time event feed (WebSocket)
- [ ] Holder count & top holders
- [ ] Policy change alerts
- [ ] Public API for developers
- [ ] Email / Telegram notifications for token issuers
- [ ] Mainnet launch (June 25)

---

## Resources

- [B20 Specification](https://docs.base.org/base-chain/specs/upgrades/beryl/b20)
- [Beryl Hardfork Overview](https://docs.base.org/base-chain/specs/upgrades/beryl/overview)
- [base-std (precompile source)](https://github.com/base/base-std)
- [Base Sepolia Explorer](https://sepolia.basescan.org)

---

## License

MIT
