# B20 Explorer

Explorer untuk B20 — Base's native token standard (Beryl Hardfork).

## Stack
- Next.js 14 (App Router)
- Viem untuk onchain reads
- Tailwind CSS
- Deploy ke Vercel (gratis)

## Setup

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di vercel.com
3. Set env vars:
   - `NEXT_PUBLIC_NETWORK` = `sepolia` atau `mainnet`
   - `BASE_RPC_URL` = RPC endpoint kamu

## Network

- **Sepolia**: B20 live sejak 18 Juni 2026
- **Mainnet**: B20 live 25 Juni 2026

## Fitur

- Auto-detect semua B20 token dari `B20Created` events
- Token detail page: supply, policies, pause status
- Policy health indicator (open vs restricted)
- Address analysis (variant encoded di address)
- Link ke Basescan

## Roadmap

- [ ] Real-time event feed via WebSocket
- [ ] Holder count & top holders
- [ ] Policy change alerts
- [ ] API endpoint untuk developer
- [ ] Email/Telegram notifications untuk issuer
