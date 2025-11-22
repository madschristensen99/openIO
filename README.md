# OpenIO

OpenIO combines the Next.js frontend from the master branch with the TypeScript helpers and wallet utilities added on main. The repo now ships a paid API client that works with the x402 payment flow, alongside the existing experience scaffolded by `create-next-app`.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The page updates automatically as you edit `app/page.tsx`.

## X402 integration

The SDK files under `src/x402` expect the following environment variables:

| Variable | Description |
| --- | --- |
| `X402_API_BASE_URL` | Base URL for the x402 paid endpoints. |
| `X402_PRIVATE_KEY` | Private key that drives `x402Account`. |

Ensure these are set before invoking `callPaidEndpoint` or importing the wallet helper.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

Deploy the app easily on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Check out [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
