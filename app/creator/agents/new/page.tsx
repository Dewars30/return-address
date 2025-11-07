"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AgentCategory,
  BaseTone,
  CategoryPolicy,
  createDefaultAgentSpec,
  validateAgentSpec,
  type AgentSpec,
} from "@/lib/agentSpec";

const CATEGORIES: AgentCategory[] = [
  "tax",
  "fitness",
  "coaching",
  "business",
  "real_estate",
  "other",
];

const MODEL_IDS = ["gpt-4.1-mini", "gpt-4", "gpt-3.5-turbo"];

const BASE_TONES: BaseTone[] = ["direct", "friendly", "formal"];

const CATEGORY_POLICIES: CategoryPolicy[] = ["default", "sensitive"];

const PRICE_OPTIONS = [9, 19, 29, 49];

export default function NewAgentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AgentSpec>(createDefaultAgentSpec());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate AgentSpec
      if (!validateAgentSpec(formData)) {
        throw new Error("Invalid agent specification");
      }

      const response = await fetch("/api/creator/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spec: formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create agent");
      }

      const data = await response.json();
      router.push(`/creator/agents/${data.agentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Agent</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.profile.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.profile.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.profile.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, category: e.target.value as AgentCategory },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Model Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Model</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="modelId" className="block text-sm font-medium text-gray-700 mb-2">
                  Model ID *
                </label>
                <select
                  id="modelId"
                  required
                  value={formData.model.modelId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model: { ...prev.model, modelId: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {MODEL_IDS.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="temperature"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Temperature (0-1) *
                </label>
                <input
                  type="number"
                  id="temperature"
                  required
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.model.temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model: { ...prev.model, temperature: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="maxTokens"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Max Tokens *
                </label>
                <input
                  type="number"
                  id="maxTokens"
                  required
                  min="1"
                  value={formData.model.maxTokens}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model: { ...prev.model, maxTokens: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Behavior Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Behavior</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="baseTone" className="block text-sm font-medium text-gray-700 mb-2">
                  Base Tone *
                </label>
                <select
                  id="baseTone"
                  required
                  value={formData.behavior.baseTone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      behavior: { ...prev.behavior, baseTone: e.target.value as BaseTone },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {BASE_TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="additionalInstructions"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Instructions (Optional)
                </label>
                <textarea
                  id="additionalInstructions"
                  rows={4}
                  value={formData.behavior.additionalInstructions || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      behavior: {
                        ...prev.behavior,
                        additionalInstructions: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Guardrails Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Guardrails</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.guardrails.showDisclosure}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        guardrails: {
                          ...prev.guardrails,
                          showDisclosure: e.target.checked,
                        },
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Disclosure</span>
                </label>
              </div>
              <div>
                <label
                  htmlFor="categoryPolicy"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Policy *
                </label>
                <select
                  id="categoryPolicy"
                  required
                  value={formData.guardrails.categoryPolicy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guardrails: {
                        ...prev.guardrails,
                        categoryPolicy: e.target.value as CategoryPolicy,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CATEGORY_POLICIES.map((policy) => (
                    <option key={policy} value={policy}>
                      {policy.charAt(0).toUpperCase() + policy.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="disallowedTopics"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Disallowed Topics (comma-separated)
                </label>
                <input
                  type="text"
                  id="disallowedTopics"
                  value={formData.guardrails.disallowedTopics.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guardrails: {
                        ...prev.guardrails,
                        disallowedTopics: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t.length > 0),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="topic1, topic2, topic3"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="monthlyPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Monthly Price (USD) *
                </label>
                <select
                  id="monthlyPrice"
                  required
                  value={formData.pricing.monthlyPriceUsd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        monthlyPriceUsd: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {PRICE_OPTIONS.map((price) => (
                    <option key={price} value={price}>
                      ${price}/month
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="trialMessages"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Trial Messages *
                </label>
                <input
                  type="number"
                  id="trialMessages"
                  required
                  min="0"
                  value={formData.pricing.trialMessages}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        trialMessages: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Limits Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Limits</h2>
            <div>
              <label
                htmlFor="maxMessagesPerDay"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Max Messages Per Day *
              </label>
              <input
                type="number"
                id="maxMessagesPerDay"
                required
                min="1"
                value={formData.limits.maxMessagesPerDay}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    limits: {
                      ...prev.limits,
                      maxMessagesPerDay: parseInt(e.target.value),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
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
              {isSubmitting ? "Creating..." : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

