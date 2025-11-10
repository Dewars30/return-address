import { requireCreator } from "@/lib/auth";
import { NewAgentForm } from "./NewAgentForm";

export const dynamic = "force-dynamic";

export default async function NewAgentPage() {
  // Enforce creator access server-side
  await requireCreator();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Agent</h1>
        <NewAgentForm />
      </div>
    </div>
  );
}
