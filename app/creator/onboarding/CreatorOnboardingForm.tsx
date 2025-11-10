"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function CreatorOnboardingForm() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: clerkUser?.firstName || clerkUser?.username || "",
    handle: "",
    shortBio: "",
  });

  // Update displayName when Clerk user loads
  if (isLoaded && clerkUser && !formData.displayName) {
    setFormData((prev) => ({
      ...prev,
      displayName: clerkUser.firstName || clerkUser.username || "",
    }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/creator/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }

      // Use window.location.href to force full page reload and ensure server gets fresh data
      window.location.href = "/creator/agents";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Become a Creator</h1>
        <p className="text-gray-600 mb-8">
          Complete your creator profile to start building and monetizing AI agents.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, displayName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">
              Handle *
            </label>
            <input
              type="text"
              id="handle"
              required
              value={formData.handle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))
              }
              placeholder="your-handle"
              pattern="[a-z0-9-]+"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              value={formData.shortBio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shortBio: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Complete Onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

