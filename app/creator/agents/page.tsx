import { requireCreator } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import StripeConnectButton from "./StripeConnectButton";

export default async function CreatorAgentsPage() {
  const user = await requireCreator();

  // Get user with stripeAccountId
  const userWithStripe = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeAccountId: true },
  });

  const hasStripeAccount = !!userWithStripe?.stripeAccountId;

  // Get user's agents
  const agents = await db.agent.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      specs: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <Link
            href="/creator/agents/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create new agent
          </Link>
        </div>

        {/* Stripe Connect Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payout Setup</h2>
          {hasStripeAccount ? (
            <div className="flex items-center space-x-2 text-green-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">Stripe connected</span>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your Stripe account to receive payouts from agent subscriptions.
              </p>
              <StripeConnectButton />
            </div>
          )}
        </div>

        {/* Agents Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
          {agents.length === 0 ? (
            <p className="text-gray-600">No agents yet. Create your first agent to get started.</p>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => {
                const spec = agent.specs[0]?.spec as any;
                return (
                  <div
                    key={agent.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">
                            {spec?.profile?.name || "Unnamed Agent"}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              agent.status === "published"
                                ? "bg-green-100 text-green-800"
                                : agent.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Created {new Date(agent.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={`/creator/agents/${agent.id}`}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

