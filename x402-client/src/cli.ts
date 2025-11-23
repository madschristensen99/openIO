#!/usr/bin/env bun

import { config as loadEnv } from "dotenv";
import { Chain, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  base,
  baseSepolia,
  polygon,
  polygonAmoy,
  avalanche,
  avalancheFuji,
} from "viem/chains";
import { createPaymentHeader } from "x402/client";
import { ChainIdToNetwork, EvmNetworkToChainId } from "x402/types";
import { decodeXPaymentResponse } from "x402-fetch";

// Only load .env if KEY is not already in environment
if (!process.env.KEY) {
  loadEnv();
}

type RawPaymentRequirement = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource?: string;
  description?: string;
  mimeType?: string;
  payTo: string;
  maxTimeoutSeconds?: number;
  asset: string;
  outputSchema?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

type X402Handshake = {
  x402Version?: unknown;
  accepts?: unknown;
  error?: unknown;
  message?: unknown;
};

const chainById = new Map<number, Chain>([
  [polygon.id, polygon],
  [polygonAmoy.id, polygonAmoy],
  [base.id, base],
  [baseSepolia.id, baseSepolia],
  [avalanche.id, avalanche],
  [avalancheFuji.id, avalancheFuji],
]);

const args = process.argv.slice(2);
let resourceUrl: string | undefined;
let httpMethod = "GET";

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === "--method" || arg === "-X") {
    const next = args[++i];
    if (!next) {
      console.error("[x402] --method/-X requires a value");
      process.exit(1);
    }
    httpMethod = next.trim().toUpperCase();
    continue;
  }

  if (!resourceUrl && arg !== "--help" && arg !== "-h") {
    resourceUrl = arg;
  } else if (arg === "--help" || arg === "-h") {
    resourceUrl = undefined;
    break;
  }
}

if (!resourceUrl) {
  console.log("Usage: bun run x402 [--method POST] <URL>");
  process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
}

const targetUrl = resourceUrl;

if (!/^[A-Z]+$/.test(httpMethod)) {
  console.error(`[x402] Invalid HTTP method: ${httpMethod}`);
  process.exit(1);
}

const rawKey = process.env.KEY?.trim();

if (!rawKey) {
  console.error("[x402] Missing KEY in .env");
  process.exit(1);
}

const privateKey = normalizePrivateKey(rawKey);
const account = privateKeyToAccount(privateKey);

const maxPaymentEnv = process.env.MAX_PAYMENT_USDC?.trim();
const maxPaymentBaseUnits = maxPaymentEnv
  ? decimalToBaseUnits(maxPaymentEnv, 6)
  : decimalToBaseUnits("0.1", 6);

async function main() {
  console.log(`[x402] Fetching ${targetUrl}`);
  console.log(`[x402] Using HTTP method ${httpMethod}`);

  console.log("[x402] Initiating initial request...");
  const initialResponse = await fetch(targetUrl, { method: httpMethod });
  console.log(`[x402] Initial response received (status ${initialResponse.status})`);

  if (initialResponse.status !== 402) {
    await printResponse(initialResponse);
    return;
  }

  const handshakePayload = await safeJson(initialResponse);
  console.log(`[x402] Handshake payload: ${stringifyForLog(handshakePayload)}`);
  const { version, requirements, error: handshakeError } = parseHandshake(handshakePayload);

  if (handshakeError) {
    console.warn(`[x402] Server message: ${handshakeError}`);
  }

  const requirement = selectRequirement(requirements);
  console.log(`[x402] Raw payment requirement: ${stringifyForLog(requirement)}`);

  const paymentAmount = parsePaymentAmount(requirement.maxAmountRequired);
  if (paymentAmount > maxPaymentBaseUnits) {
    throw new Error(
      `Payment amount ${formatBaseUnits(paymentAmount)} USDC exceeds MAX_PAYMENT_USDC (${formatBaseUnits(maxPaymentBaseUnits)} USDC)`
    );
  }

  const network = resolveNetworkDetails(requirement.network);
  console.log(`[x402] Paying ${formatBaseUnits(paymentAmount)} USDC on ${network.label}`);
  console.log(`[x402] Using account ${account.address}`);
  console.log(
    `[x402] Resolved chain: id=${network.chainId}, name=${network.chain.name}, rpc=${getRpcUrl(network.chain)}`
  );

  const walletClient = createWalletClient({
    account,
    chain: network.chain,
    transport: http(getRpcUrl(network.chain)),
  });

  const normalizedRequirement = { ...requirement, network: network.label } as RawPaymentRequirement;
  const paymentHeader = await createPaymentHeader(walletClient, version, normalizedRequirement as any);

  console.log("[x402] Initiating paid request with X-PAYMENT header...");
  const paidResponse = await fetch(targetUrl, {
    method: httpMethod,
    headers: {
      "X-PAYMENT": paymentHeader,
      "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
    },
  });
  console.log(paidResponse)
  const reader = paidResponse.body.pipeThrough(new TextDecoderStream()).getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        console.log(value); // Log each chunk
        // Process the chunk here
      }
    } finally {
      reader.releaseLock();
    }
  console.log(`[x402] Paid response received (status ${paidResponse.status})`);

  if (paidResponse.status === 402) {
    throw new Error("Payment failed: received another 402 response");
  }

  const paymentResponseHeader = paidResponse.headers.get("X-PAYMENT-RESPONSE");
  if (paymentResponseHeader) {
    try {
      const decoded = decodeXPaymentResponse(paymentResponseHeader);
      console.log(`[x402] Payment receipt: ${JSON.stringify(decoded)}`);
    } catch (error) {
      console.warn(`[x402] Unable to decode X-PAYMENT-RESPONSE: ${(error as Error).message}`);
    }
  }

}

main().catch((error) => {
  console.error(`[x402] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

function parseHandshake(payload: unknown): {
  version: number;
  requirements: RawPaymentRequirement[];
  error?: string;
} {
  const data = payload as X402Handshake;
  const version = typeof data.x402Version === "number" ? data.x402Version : Number(data.x402Version);

  if (!Number.isFinite(version)) {
    throw new Error("Invalid x402 handshake: missing version");
  }

  if (!Array.isArray(data.accepts) || data.accepts.length === 0) {
    throw new Error("Invalid x402 handshake: no payment options provided");
  }

  const requirements: RawPaymentRequirement[] = [];
  for (const entry of data.accepts) {
    if (!entry || typeof entry !== "object") continue;
    const requirement = entry as Partial<RawPaymentRequirement>;
    if (
      requirement.scheme === "exact" &&
      typeof requirement.network === "string" &&
      typeof requirement.maxAmountRequired === "string" &&
      typeof requirement.payTo === "string" &&
      typeof requirement.asset === "string"
    ) {
      requirements.push(requirement as RawPaymentRequirement);
    }
  }

  if (requirements.length === 0) {
    throw new Error("No compatible payment requirements found in handshake");
  }

  let handshakeError: string | undefined;
  if (typeof data.error === "string" && data.error.trim()) {
    handshakeError = data.error.trim();
  } else if (typeof data.message === "string" && data.message.trim()) {
    handshakeError = data.message.trim();
  }

  return { version, requirements, error: handshakeError };
}

function selectRequirement(requirements: RawPaymentRequirement[]): RawPaymentRequirement {
  const supported = requirements.filter((req) => {
    try {
      resolveNetworkDetails(req.network);
      return true;
    } catch {
      return false;
    }
  });

  if (supported.length === 0) {
    throw new Error("None of the advertised payment networks are supported by this script");
  }

  const selected = supported[0];
  console.log(
    `[x402] Selected requirement network=${selected.network}, maxAmount=${selected.maxAmountRequired}, payTo=${selected.payTo}`
  );
  return selected;
}

function getRpcUrl(chain: Chain): string {
  const candidates = [
    ...(chain.rpcUrls.default?.http ?? []),
    ...(chain.rpcUrls.public?.http ?? []),
  ];

  if (candidates.length === 0) {
    throw new Error(`No RPC URL configured for chain ${chain.id}`);
  }

  return candidates[0];
}

function resolveNetworkDetails(network: string): { label: string; chainId: number; chain: Chain } {
  const chainId = inferChainId(network);
  const chain = chainById.get(chainId);

  if (!chain) {
    throw new Error(`Unsupported EVM chain id ${chainId}`);
  }

  const label =
    ChainIdToNetwork[String(chainId) as keyof typeof ChainIdToNetwork] ??
    (typeof network === "string" && network.trim() ? network.trim() : String(chainId));

  return { label, chainId, chain };
}

function inferChainId(network: string): number {
  if (EvmNetworkToChainId instanceof Map && EvmNetworkToChainId.has(network)) {
    const value = EvmNetworkToChainId.get(network);
    if (typeof value === "number") {
      return value;
    }
  }

  if (network in ChainIdToNetwork) {
    return Number(network);
  }

  const caipMatch = /^eip155:(\d+)$/i.exec(network);
  if (caipMatch) {
    return Number(caipMatch[1]);
  }

  const numeric = Number(network);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }

  throw new Error(`Unsupported network descriptor: ${network}`);
}

function parsePaymentAmount(raw: string): bigint {
  try {
    const value = BigInt(raw);
    if (value < 0n) {
      throw new Error("negative amount");
    }
    return value;
  } catch (error) {
    throw new Error(`Invalid payment amount provided by server: ${raw}`);
  }
}



async function streamWebReadable(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let lastChunkEndedWithNewline = false;
  let chunkIndex = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const text = decoder.decode(value, { stream: true });
        if (text) {
          console.log(`[x402] chunk #${++chunkIndex} (${value.byteLength} bytes)`);
          process.stdout.write(text);
          lastChunkEndedWithNewline = text.endsWith("\n");
        }
      }
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
      process.stdout.write(finalChunk);
      lastChunkEndedWithNewline = finalChunk.endsWith("\n");
    }
  } finally {
    reader.releaseLock();
  }

  if (!lastChunkEndedWithNewline) {
    process.stdout.write("\n");
  }
}

async function streamAsyncIterable(iterable: AsyncIterable<unknown>) {
  const decoder = new TextDecoder();
  let lastChunkEndedWithNewline = false;
  let chunkIndex = 0;

  for await (const chunk of iterable as AsyncIterable<string | Uint8Array>) {
    if (typeof chunk === "string") {
      console.log(`[x402] chunk #${++chunkIndex} (${chunk.length} chars)`);
      process.stdout.write(chunk);
      lastChunkEndedWithNewline = chunk.endsWith("\n");
    } else if (chunk) {
      const text = decoder.decode(chunk, { stream: true });
      if (text) {
        console.log(`[x402] chunk #${++chunkIndex} (${chunk.byteLength ?? text.length} bytes)`);
        process.stdout.write(text);
        lastChunkEndedWithNewline = text.endsWith("\n");
      }
    }
  }

  const finalChunk = decoder.decode();
  if (finalChunk) {
    process.stdout.write(finalChunk);
    lastChunkEndedWithNewline = finalChunk.endsWith("\n");
  }

  if (!lastChunkEndedWithNewline) {
    process.stdout.write("\n");
  }
}

function normalizePrivateKey(key: string): Hex {
  let normalized = key.startsWith("0x") ? key : `0x${key}`;

  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new Error("KEY must be a 32-byte hex string");
  }

  return normalized as Hex;
}

function decimalToBaseUnits(decimal: string, decimals: number): bigint {
  const match = /^\d+(?:\.\d+)?$/.exec(decimal);
  if (!match) {
    throw new Error(`Invalid decimal value: ${decimal}`);
  }

  const [integerPart, fractionPart = ""] = decimal.split(".");
  const paddedFraction = (fractionPart + "0".repeat(decimals)).slice(0, decimals);
  const combined = `${integerPart}${paddedFraction}`.replace(/^0+/, "");
  return BigInt(combined || "0");
}

function formatBaseUnits(value: bigint, decimals = 6): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const base = absolute.toString().padStart(decimals + 1, "0");
  const integer = base.slice(0, -decimals) || "0";
  const fraction = base.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${sign}${integer}.${fraction}` : `${sign}${integer}`;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.clone().json();
  } catch (error) {
    const text = await response.clone().text();
    throw new Error(`Failed to parse x402 response as JSON: ${(error as Error).message}\n${text}`);
  }
}

function stringifyForLog(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === "bigint") {
        return val.toString();
      }
      return val;
    });
  } catch {
    return String(value);
  }
}
