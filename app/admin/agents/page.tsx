import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SuspendButton from "./SuspendButton";

export default async function AdminAgentsPage() {
  const admin = await requireAdmin();

  // Get all agents with owner info
  let agents: Awaited<ReturnType<typeof db.agent.findMany<{
    include: {
      owner: { select: { handle: true; name: true; email: true } };
      specs: true;
    };
  }>>>;
  try {
    agents = await db.agent.findMany({
      include: {
        owner: {
          select: {
            handle: true,
            name: true,
            email: true,
          },
        },
        specs: {
          where: { isActive: true },
          take: 1,
          orderBy: { version: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database error loading agents:", error);
    agents = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin: Agent Management</h1>
          <p className="text-gray-600 mt-2">Manage all agents on the platform</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => {
                const spec = agent.specs[0]?.spec as any;
                const agentName = spec?.profile?.name || "Unnamed Agent";

                return (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {agentName}
                        </div>
                        <div className="text-sm text-gray-500">/{agent.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {agent.owner.handle ? `@${agent.owner.handle}` : agent.owner.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">{agent.owner.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          agent.status === "published"
                            ? "bg-green-100 text-green-800"
                            : agent.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {agent.status !== "suspended" ? (
                        <SuspendButton agentId={agent.id} />
                      ) : (
                        <span className="text-gray-400">Suspended</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

