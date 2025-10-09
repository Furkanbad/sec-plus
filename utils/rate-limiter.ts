// utils/rate-limiter.ts
import pLimit from "p-limit";

export const OPENAI_CONCURRENT_REQUESTS = 1;
export const openaiRequestLimiter = pLimit(OPENAI_CONCURRENT_REQUESTS);

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
