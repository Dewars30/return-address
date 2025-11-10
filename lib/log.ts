/**
 * Minimal, focused observability for production debugging
 * Never logs PII, secrets, or full request bodies
 */

type LogContext = {
  route?: string;
  agentId?: string;
  userId?: string;
  callerId?: string;
  stripeEventType?: string;
  statusCode?: number;
  [key: string]: unknown;
};

type LogExtra = Record<string, unknown>;

/**
 * Sanitize extra data to prevent logging secrets or PII
 */
function sanitizeExtra(extra?: LogExtra): LogExtra | undefined {
  if (!extra) return undefined;

  const sanitized: LogExtra = {};
  const sensitiveKeys = [
    "password",
    "secret",
    "token",
    "key",
    "email",
    "authId",
    "stripeAccountId",
    "stripeCustomerId",
    "stripeSubscriptionId",
  ];

  for (const [key, value] of Object.entries(extra)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((sk) => lowerKey.includes(sk));

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 200) {
      // Truncate long strings
      sanitized[key] = value.substring(0, 200) + "...";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Hash user/caller ID for logging (no PII)
 */
function hashId(id: string | undefined): string | undefined {
  if (!id) return undefined;
  // Simple hash for logging (not cryptographic)
  return id.substring(0, 8) + "...";
}

/**
 * Log info message with context
 */
export function logInfo(context: LogContext, message: string, extra?: LogExtra): void {
  const sanitizedExtra = sanitizeExtra(extra);
  const payload = {
    level: "info",
    message,
    context: {
      ...context,
      userId: hashId(context.userId),
      callerId: hashId(context.callerId),
    },
    ...(sanitizedExtra && { extra: sanitizedExtra }),
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(payload));
}

/**
 * Log error with context
 */
export function logError(
  context: LogContext,
  error: Error | unknown,
  extra?: LogExtra
): void {
  const sanitizedExtra = sanitizeExtra(extra);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const payload = {
    level: "error",
    message: errorMessage,
    context: {
      ...context,
      userId: hashId(context.userId),
      callerId: hashId(context.callerId),
    },
    ...(errorStack && { stack: errorStack }),
    ...(sanitizedExtra && { extra: sanitizedExtra }),
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(payload));
}

