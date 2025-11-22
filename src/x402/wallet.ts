// src/x402/wallet.ts
import { privateKeyToAccount } from "viem/accounts";

const pk = process.env.X402_PRIVATE_KEY;

if (!pk) {
  throw new Error("X402_PRIVATE_KEY is not set in env");
}

// viem Account object – chain-agnostic, works across EVM networks
export const x402Account = privateKeyToAccount(pk as `0x${string}`);
