/**
 * Stripe integration for payments and Stripe Connect
 */

import Stripe from "stripe";
import { db } from "./db";

let stripeClient: Stripe | null = null;

/**
 * Initialize and return Stripe client
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2023-10-16", // Use stable API version supported by Stripe SDK
      typescript: true,
    });
  }
  return stripeClient;
}

/**
 * Create or retrieve Stripe Connect Express account for a user
 * Stores stripeAccountId on the User if created
 */
export async function createConnectAccount(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true, email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Return existing account if present
  if (user.stripeAccountId) {
    return user.stripeAccountId;
  }

  // Create new Express account
  const stripe = getStripeClient();
  const account = await stripe.accounts.create({
    type: "express",
    country: "US", // TODO: Make configurable or detect from user
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Store account ID
  await db.user.update({
    where: { id: userId },
    data: { stripeAccountId: account.id },
  });

  return account.id;
}

/**
 * Create Stripe Connect onboarding link for a user
 * Ensures the user has a Stripe account first
 */
export async function createConnectOnboardingLink(
  userId: string
): Promise<string> {
  const stripe = getStripeClient();
  const accountId = await createConnectAccount(userId);

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/creator/agents?refresh=true`,
    return_url: `${appUrl}/creator/agents?success=true`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

/**
 * Create Stripe Checkout session for agent subscription
 * Uses Stripe Connect to route payment to creator's account
 */
export async function createCheckoutSession(params: {
  agentId: string;
  userId: string;
  monthlyPriceUsd: number;
  creatorStripeAccountId: string;
  successUrl: string;
  cancelUrl: string;
  platformFeeBps?: number; // Basis points (e.g., 500 = 5%)
}): Promise<string> {
  const stripe = getStripeClient();
  const platformFeeBps = params.platformFeeBps || 500; // Default 5% platform fee

  // Get or create Stripe customer for user
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: params.userId,
      },
    });

    customerId = customer.id;

    // Store customer ID
    await db.user.update({
      where: { id: params.userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Calculate unit amount in cents
  const unitAmount = Math.round(params.monthlyPriceUsd * 100);
  const applicationFeePercent = (platformFeeBps / 10000) * 100; // Convert to percentage

  // Create checkout session on platform account with Connect transfer
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Agent Subscription",
          },
          recurring: {
            interval: "month",
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        agentId: params.agentId,
        userId: params.userId,
      },
      application_fee_percent: applicationFeePercent,
      transfer_data: {
        destination: params.creatorStripeAccountId,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session.url || "";
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }

  try {
    stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return true;
  } catch (err) {
    return false;
  }
}

