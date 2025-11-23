# OpenIO

Obfuscated compute + paid APIs in one workspace. You get a Next.js 16 shell, a production-ready x402 client, and an AI assistant endpoint wired for RAG so you can ship privacy-preserving flows fast.

```
Build with:
- Next.js app pages + layouts for builder/deployer UX
- x402 paid API client (axios + viem wallet) under src/x402
- AI assistant proxy at /api/ai-chat for contextual chat
```

## Stack Snapshot

| Layer | What lives here |
| --- | --- |
| UI | Next.js 16, React 19, Tailwind CSS 4 |
| Paid APIs | `x402-axios` interceptor + viem wallet helpers |
| Chain / data | 0G TS SDK, ethers/viem for EVM |
| AI | `/api/ai-chat` proxy with RAG-backed context |

## What the site does

- Landing hero: Privacy Compute Hub with CTAs to explore models or jump into the builder.
- Model hub (`/dapp/models`): Tabbed browser for trending models, zk circuits, FHE engines, datasets, and featured spaces.
- Builder (`/dapp/builder`): Dual-mode IDE. Code Mode uses a file explorer + editor with AI sidebar; Flow Mode uses React Flow to chain ZK/FHE/iO nodes visually.
- Deploy (`/dapp/deploy`): Compile and deploy sealed contracts with a terminal log, file explorer, and editor.
- AI Flow (`/ai-flow`): Prompt-driven flow diagram generator rendered with React Flow.
- Docs/Community/Pricing/Profile: Static sections to round out the navigation.

## Economic Model

openIO isn’t a toy demo – it has real running costs and real economic value. Infra today (compute, storage, indexing, other APIs) runs about $16/day, roughly $5,840/year. Instead of guessing subscription tiers, openIO uses **per-call pricing** so usage maps directly to cost: heavy users pay more, light users pay less, and infra is covered by the value-creating flows.

Work is measured in **bits** – a unit of computational complexity. Each endpoint has a bit cost based on its work: reading chain data, simulating routes, hitting external APIs, persisting to 0G, etc. A simple signal check might be a few hundred bits; a full multi-market route simulation can be tens of thousands. Each bit maps to a tiny USDC price (e.g., $0.00001–$0.0001/bit), so cheap calls cost fractions of a cent while heavy jobs can cost a few dollars.

Payments run through **x402 on Polygon**. When an agent hits an openIO endpoint, we return HTTP 402 with the bit cost converted to USDC. The x402 client pays from the caller’s wallet, then automatically retries to fetch the result. No accounts, API keys, or credit cards – just machine-native per-request stablecoin payments. This makes metering straightforward and aligns revenue with actual compute.

Why it matters: imagine **Ava**, a trader running a **$1,000,000** on-chain strategy. If openIO’s routing and timing improve execution by **3 bps (0.03%)**, that’s ~**$300** per trade. Suppose her plan consumes **20,000 bits** priced at $0.0001/bit – she pays **$2.00** via x402. She saves ~$300, pays $2 for the compute. Even at **1 bp (~$100)** improvement, the economics are clearly positive. That is the core design: meter complexity in bits, price it fairly in USDC with x402, and let users pay only when the alpha is worth it.

## Using the web app

1) Home: Visit `/` to see the hero and quick CTAs.  
2) Explore the catalog: `/dapp/models` lets you switch tabs (models/spaces/datasets/zk-circuits/fhe-engines/flow-diagrams) and review metadata.  
3) Build: `/dapp/builder`  
   - Code Mode: edit `.io` files, create modules, and use the AI sidebar for scaffolding.  
   - Node Mode: drag/drop and connect ZK/FHE/iO steps; color-coded edges keep flows readable.  
4) Deploy: `/dapp/deploy` to tweak the sample sealed contract, then hit **Compile** and **Deploy** to see the mocked pipeline and deployment logs.  
5) Generate flows with AI: `/ai-flow` to describe a process and render it as a React Flow diagram.  
6) Chat anywhere: `<AiChat page="builder" | "deploy" />` renders the RAG-backed assistant for in-context help.

## Quickstart

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Environment

Create `.env` with the values your deployment needs:

```
# x402 payment rail
X402_PRIVATE_KEY=0xyour_private_key
X402_API_BASE_URL=https://api.your-paid-endpoint.com
X402_NETWORK=polygon-amoy
X402_FACILITATOR_URL=https://x402-amoy.polygon.technology

# App + AI
OPENAI_API_KEY=sk-...
SESSION_SECRET=change-me

# 0G storage (if used in your flows)
ZG_PRIVATE_KEY=0x...
```

Keep secrets out of commits. Restart the dev server after edits.

## x402 Paid Call in 60 Seconds

`src/x402/client.ts` wraps axios with the x402 payment interceptor so every request is invoice-aware.

```ts
import { callPaidEndpoint } from "./src/x402/client";

async function demo() {
  const result = await callPaidEndpoint("/protected-route", { foo: "bar" });
  console.log("paid response", result);
}

demo();
```

`X402_API_BASE_URL` and `X402_PRIVATE_KEY` must be set before importing the helper. Inspect payment headers with `decodeXPaymentResponse` (already wired in the helper).

## AI Assistant

- `POST /api/ai-chat` proxies to the OpenIO assistant with RAG context.
- Use `<AiChat page="builder" | "deploy" />` to render the sidebar chat UI across dapp flows.

## Project Map

```
app/            Next.js routes and layouts
public/         Static assets
src/x402/       Paid API client + wallet helpers
docs/           Docusaurus docs starter (optional)
scripts/        Utility scripts
```

## Scripts

- `npm run dev` — start Next.js locally
- `npm run build` — production build
- `npm start` — serve built app
- `npm run lint` — ESLint across the repo

## Deploy

- Vercel: `npm run build` then connect the repo; set the env vars above.
- Any Node host: `npm run build && npm start` with `PORT` set.
