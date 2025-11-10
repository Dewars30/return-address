"use client";

import { useState } from "react";

type Props = {
  initialDisplayName: string;
};

export default function CreatorOnboardingForm({ initialDisplayName }: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [handle, setHandle] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/creator/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          handle,
          shortBio,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Failed to complete onboarding");
        setLoading(false);
        return;
      }

      // Use window.location.href to force full page reload and ensure server gets fresh data
      // This prevents race conditions where router.push() navigates before DB update commits
      window.location.href = "/creator/agents";
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Become a Creator</h1>
        <p className="text-gray-600 mb-8">
          Complete your creator profile to start building and monetizing AI agents.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              id="displayName"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">
              Creator Handle *
            </label>
            <input
              type="text"
              id="handle"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your-handle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              pattern="[a-z0-9\-]+"
              title="Use only lowercase letters, numbers, and hyphens."
            />
            <p className="mt-1 text-sm text-gray-500">
              Lowercase letters, numbers, and hyphens only. Must be unique.
            </p>
          </div>

          <div>
            <label htmlFor="shortBio" className="block text-sm font-medium text-gray-700 mb-2">
              Short Bio (Optional)
            </label>
            <textarea
              id="shortBio"
              rows={4}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Completing..." : "Complete onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

