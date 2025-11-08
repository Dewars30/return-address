import { db } from "@/lib/db";
import Link from "next/link";
import { type AgentSpec } from "@/lib/agentSpec";

type AgentsWithIncludes = Awaited<
  ReturnType<
    typeof db.agent.findMany<{
      include: {
        owner: { select: { handle: true; name: true } };
        specs: true;
      };
    }>
  >
>;

export default async function Home() {
  // Query all published agents with error handling
  let agents: AgentsWithIncludes;
  try {
    agents = await db.agent.findMany({
      where: {
        status: "published",
      },
      include: {
        owner: {
          select: {
            handle: true,
            name: true,
          },
        },
        specs: {
          where: {
            isActive: true,
          },
          take: 1,
          orderBy: {
            version: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Database error loading agents:", error);
    // Return empty state on database error
    agents = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Agents with a return address.</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Return Address hosts expert-owned, vertical AI agents — high-signal systems with visible creators, enforced guardrails, and real revenue for the people behind them.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="#marketplace"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Explore agents
          </Link>
          <Link
            href="/creator/onboarding"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Become a creator
          </Link>
        </div>
      </div>

      {/* Marketplace Section */}
      <div id="marketplace" className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Agent Marketplace</h2>
        <p className="text-lg text-gray-600 mb-6">
          Discover curated agents with creator attribution and subscription-based access
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No agents available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const spec = agent.specs[0]?.spec as AgentSpec | undefined;
            if (!spec) return null;

            return (
              <Link
                key={agent.id}
                href={`/agents/${agent.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{spec.profile.name}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {spec.profile.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {spec.profile.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold">${spec.pricing.monthlyPriceUsd}</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                  {agent.owner.handle && (
                    <p className="text-sm text-gray-600">@{agent.owner.handle}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

