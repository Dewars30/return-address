import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { logError, logInfo } from "@/lib/log";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logError(
      { route: "/api/stripe/webhook", statusCode: 500 },
      new Error("STRIPE_WEBHOOK_SECRET is not set")
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logError(
      { route: "/api/stripe/webhook", statusCode: 400 },
      err instanceof Error ? err : new Error(String(err)),
      { stripeEventType: "signature_verification_failed" }
    );
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get subscription from session
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!subscriptionId) {
        logError(
          { route: "/api/stripe/webhook", stripeEventType: event.type, statusCode: 200 },
          new Error("No subscription ID in checkout session")
        );
        return NextResponse.json({ received: true });
      }

      // Retrieve subscription to get metadata
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const metadata = subscription.metadata;

      const agentId = metadata.agentId;
      const userId = metadata.userId;

      if (!agentId || !userId) {
        logError(
          {
            route: "/api/stripe/webhook",
            stripeEventType: event.type,
            statusCode: 200,
          },
          new Error("Missing agentId or userId in subscription metadata")
        );
        return NextResponse.json({ received: true });
      }

      // Get customer ID
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      if (!customerId) {
        logError(
          {
            route: "/api/stripe/webhook",
            stripeEventType: event.type,
            agentId,
            userId,
            statusCode: 200,
          },
          new Error("No customer ID in subscription")
        );
        return NextResponse.json({ received: true });
      }

      // Create or update subscription in database
      await prisma.subscription.upsert({
        where: {
          stripeSubscriptionId: subscriptionId,
        },
        update: {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        create: {
          userId,
          agentId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      logInfo(
        {
          route: "/api/stripe/webhook",
          stripeEventType: event.type,
          agentId,
          userId,
          statusCode: 200,
        },
        "Subscription created/updated from checkout"
      );
    }

    // Handle subscription.canceled
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      // Get metadata from subscription (in case checkout.session.completed hasn't fired yet)
      const metadata = subscription.metadata;
      const agentId = metadata.agentId;
      const userId = metadata.userId;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      // Upsert to handle idempotency (subscription may not exist yet if events arrive out of order)
      if (agentId && userId && customerId) {
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          update: {
            status: "canceled",
          },
          create: {
            userId,
            agentId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            status: "canceled",
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        });
      } else {
        // Fallback: update if exists (for backwards compatibility)
        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            status: "canceled",
          },
        });
      }
    }

    // Handle subscription.updated (status changes)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      // Get metadata from subscription (in case checkout.session.completed hasn't fired yet)
      const metadata = subscription.metadata;
      const agentId = metadata.agentId;
      const userId = metadata.userId;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      // Upsert to handle idempotency (subscription may not exist yet if events arrive out of order)
      if (agentId && userId && customerId) {
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          update: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            userId,
            agentId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      } else {
        // Fallback: update if exists (for backwards compatibility)
        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
    }

    // Handle subscription past_due
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        // Retrieve subscription to get metadata (in case checkout.session.completed hasn't fired yet)
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const metadata = subscription.metadata;
          const agentId = metadata.agentId;
          const userId = metadata.userId;

          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;

          // Upsert to handle idempotency (subscription may not exist yet if events arrive out of order)
          if (agentId && userId && customerId) {
            await prisma.subscription.upsert({
              where: {
                stripeSubscriptionId: subscriptionId,
              },
              update: {
                status: "past_due",
              },
              create: {
                userId,
                agentId,
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                status: "past_due",
                currentPeriodEnd: subscription.current_period_end
                  ? new Date(subscription.current_period_end * 1000)
                  : null,
              },
            });
          } else {
            // Fallback: update if exists (for backwards compatibility)
            await prisma.subscription.updateMany({
              where: {
                stripeSubscriptionId: subscriptionId,
              },
              data: {
                status: "past_due",
              },
            });
          }
        } catch (err) {
          // If subscription retrieval fails, fallback to updateMany
          await prisma.subscription.updateMany({
            where: {
              stripeSubscriptionId: subscriptionId,
            },
            data: {
              status: "past_due",
            },
          });
        }
      }
    }

    logInfo(
      { route: "/api/stripe/webhook", stripeEventType: event.type, statusCode: 200 },
      "Webhook processed successfully"
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(
      {
        route: "/api/stripe/webhook",
        stripeEventType: event?.type,
        statusCode: 500,
      },
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Webhook route configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

