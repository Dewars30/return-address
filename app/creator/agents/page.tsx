import Link from "next/link";

import { requireCreator } from "@/lib/auth";

import { db } from "@/lib/db";

export default async function CreatorAgentsPage() {
  const user = await requireCreator();

  // Fetch Stripe connection + agents in parallel
  const [userWithStripe, agents] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { stripeAccountId: true },
    }),
    db.agent.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasStripeAccount = !!userWithStripe?.stripeAccountId;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your agents</h1>
          <p className="text-sm text-muted-foreground">
            Create, publish, and manage your Return Address agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasStripeAccount ? (
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-emerald-600 border-emerald-200 bg-emerald-50">
              Stripe connected
            </span>
          ) : (
            <Link
              href="/creator/agents?connect-stripe=1"
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              Connect Stripe to publish
            </Link>
          )}
          <Link
            href="/creator/agents/new"
            className="inline-flex items-center rounded-md bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-900"
          >
            Create new agent
          </Link>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          You haven&apos;t created any agents yet. Start by creating your first
          vertical agent.
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/creator/agents/${agent.id}`}
              className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-accent"
            >
              <div className="space-y-0.5">
                <div className="font-medium">{agent.slug}</div>
                <div className="text-xs text-muted-foreground">
                  Status: {agent.status}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(agent.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
