/**
 * Rate limiting helper for agent invocations
 * Uses UsageLog to track requests per caller per agent
 */

import { prisma } from "./db";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 60; // Max 60 requests per window

/**
 * Check if caller has exceeded rate limit for agent
 * Returns true if rate limit exceeded, false otherwise
 */
export async function checkRateLimit(
  callerId: string,
  agentId: string
): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  // Count requests in the current window
  const requestCount = await prisma.usageLog.count({
    where: {
      callerId,
      agentId,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  return requestCount >= RATE_LIMIT_MAX_REQUESTS;
}

