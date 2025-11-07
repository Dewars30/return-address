"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuspendButton({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuspend = async () => {
    if (!confirm("Are you sure you want to suspend this agent? It will be removed from the marketplace.")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agents/${agentId}/suspend`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to suspend agent");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSuspend}
        disabled={isLoading}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Suspending..." : "Suspend"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

