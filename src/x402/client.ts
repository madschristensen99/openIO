// src/x402/client.ts
import axios from "axios";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import { x402Account } from "./wallet";

const baseURL = process.env.X402_API_BASE_URL;
if (!baseURL) {
  throw new Error("X402_API_BASE_URL is not set in env");
}

// Wrap a normal axios instance with x402 payment handling
export const paidApi = withPaymentInterceptor(
  axios.create({ baseURL }),
  x402Account,
);

// Helper function to call a paid endpoint
export async function callPaidEndpoint(path: string, params?: any) {
  const res = await paidApi.get(path, { params });

  // If you want to inspect the payment data returned in headers:
  const paymentHeader = res.headers["x-payment-response"];
  if (paymentHeader) {
    const paymentInfo = decodeXPaymentResponse(paymentHeader as string);
    console.log("x402 payment response:", paymentInfo);
  }

  return res.data;
}
