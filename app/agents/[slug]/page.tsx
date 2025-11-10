import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { type AgentSpec } from "@/lib/agentSpec";
import Chat from "./Chat";

export default async function AgentDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  try {
    // Load agent with active spec and creator (exclude suspended)
    const agent = await prisma.agent.findFirst({
      where: {
        slug,
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
    });

    if (!agent) {
      notFound();
    }

    const spec = agent.specs[0]?.spec as AgentSpec | undefined;
    if (!spec) {
      notFound();
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Agent Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{spec.profile.name}</h1>
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                {spec.profile.category}
              </span>
            </div>
            {agent.owner.handle && (
              <p className="text-gray-600">
                Created by <span className="font-medium">@{agent.owner.handle}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">Hosted on Return Address.</p>
          </div>

          <p className="text-gray-700 mb-6">{spec.profile.description}</p>

          {/* Pricing Info */}
          <div className="flex items-center space-x-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-3xl font-bold">${spec.pricing.monthlyPriceUsd}</p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{spec.pricing.trialMessages}</p>
              <p className="text-sm text-gray-500">free trial messages</p>
            </div>
          </div>

          {/* Disclosure */}
          {spec.guardrails.showDisclosure && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> This is an AI assistant. Responses are
                generated and should be verified for accuracy.
              </p>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Chat with {spec.profile.name}</h2>
          <Chat agentSlug={slug} />
        </div>

        {/* Return Address Attribution */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Every agent on Return Address has a visible creator, defined constraints, and isolated knowledge.
          </p>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error("Error loading agent:", error);
    notFound();
  }
}

