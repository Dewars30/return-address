import { db } from "@/lib/db";
import { AgentMarketplace } from "../components/AgentMarketplace";

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

export default async function MarketplacePage() {
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
      <AgentMarketplace agents={agents} />
    </div>
  );
}

