// Environment variables
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// API Configuration
// Using Next.js API routes for server-side security
export const API_BASE_URL = "/api";

// For any client-side direct API calls (if needed)
export const TRENDSAGE_API_URL =
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL || "http://localhost:8000";
// Keep old name for backward compatibility
export const CREDBUZZ_API_URL =
  process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
  "http://localhost:8000";

export const CREDBUZZ_ACCOUNT =
  process.env.NEXT_PUBLIC_CREDBUZZ_ACCOUNT!;

export const OWNER_SOLANA_ADDRESS =
  process.env.NEXT_PUBLIC_OWNER_SOLANA_ADDRESS!;
