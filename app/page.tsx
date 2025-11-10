import { prisma } from "@/lib/db";
import Link from "next/link";
import { AgentMarketplace } from "./components/AgentMarketplace";

type AgentsWithIncludes = Awaited<
  ReturnType<
    typeof prisma.agent.findMany<{
      include: {
        owner: { select: { handle: true; name: true } };
        specs: true;
      };
    }>
  >
>;

export default async function Home() {
  // Query all published, non-suspended agents with error handling
  let agents: AgentsWithIncludes;
  try {
    agents = await prisma.agent.findMany({
      where: {
        status: "published", // Only published agents, exclude suspended
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
      <div id="marketplace">
        <AgentMarketplace agents={agents} />
      </div>
    </div>
  );
}

