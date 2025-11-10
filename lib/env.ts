/**
 * Environment variable validation and type-safe access
 * Provides early warnings in development and errors in production for missing critical vars
 */

type EnvConfig = {
  // App
  NEXT_PUBLIC_APP_URL: string;

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  // Optional Clerk redirect URLs (v5 pattern)
  NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL?: string;

  // Database
  DATABASE_URL: string;
  DIRECT_URL?: string;
  PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS?: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // OpenAI
  OPENAI_API_KEY: string;

  // Storage (S3/Supabase) - Optional
  S3_ENDPOINT?: string;
  S3_REGION?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_BUCKET_NAME?: string;

  // Admin
  ADMIN_EMAILS?: string;

  // Platform
  PLATFORM_FEE_BPS?: string;
};

const requiredVars: (keyof EnvConfig)[] = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
];

const optionalVars: (keyof EnvConfig)[] = [
  "DIRECT_URL",
  "PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
  "ADMIN_EMAILS",
  "PLATFORM_FEE_BPS",
];

let warned = false;

function checkEnvVars() {
  if (warned) return;
  warned = true;

  const missing: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  // Check required vars
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missing.push(varName);
    }
  }

  if (missing.length === 0) {
    return;
  }

  const message = `Missing required environment variables: ${missing.join(", ")}`;

  if (isProduction) {
    // In production, log error but don't throw (to avoid breaking startup)
    // The app will fail at runtime when these vars are accessed
    console.error(`[ENV] ${message}`);
  } else {
    // In development, warn once
    console.warn(`[ENV] ${message}`);
  }
}

// Run check on import
checkEnvVars();

// Export typed getters (non-invasive, just for convenience)
export const env = {
  get appUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  },

  get clerkPublishableKey(): string {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  },

  get clerkSecretKey(): string {
    return process.env.CLERK_SECRET_KEY || "";
  },

  get databaseUrl(): string {
    return process.env.DATABASE_URL || "";
  },

  get directUrl(): string | undefined {
    return process.env.DIRECT_URL;
  },

  get stripeSecretKey(): string {
    return process.env.STRIPE_SECRET_KEY || "";
  },

  get stripeWebhookSecret(): string {
    return process.env.STRIPE_WEBHOOK_SECRET || "";
  },

  get openaiApiKey(): string {
    return process.env.OPENAI_API_KEY || "";
  },

  get adminEmails(): string[] {
    const emails = process.env.ADMIN_EMAILS;
    if (!emails) return [];
    return emails.split(",").map((e) => e.trim()).filter(Boolean);
  },

  get s3Endpoint(): string | undefined {
    return process.env.S3_ENDPOINT;
  },

  get s3Region(): string {
    return process.env.S3_REGION || "us-east-1";
  },

  get s3AccessKeyId(): string | undefined {
    return process.env.S3_ACCESS_KEY_ID;
  },

  get s3SecretAccessKey(): string | undefined {
    return process.env.S3_SECRET_ACCESS_KEY;
  },

  get s3BucketName(): string | undefined {
    return process.env.S3_BUCKET_NAME;
  },

  get platformFeeBps(): number {
    const bps = process.env.PLATFORM_FEE_BPS;
    if (!bps) return 500; // Default 5%
    const parsed = parseInt(bps, 10);
    return isNaN(parsed) ? 500 : parsed;
  },
};

