import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CreatorOnboardingForm from "./CreatorOnboardingForm";

// This page uses getCurrentUser() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export default async function CreatorOnboardingPage() {
  const user = await getCurrentUser();

  // If not authenticated, middleware will redirect to sign-in
  // But if we get here without a user, redirect to home
  if (!user) {
    redirect("/");
  }

  // If already a creator, redirect to agents page
  // This prevents redirect loops - if user is already a creator, they shouldn't be here
  if (user.isCreator) {
    redirect("/creator/agents");
  }

  // User is authenticated but not a creator - show onboarding form
  const initialDisplayName = user.name || "";
  return <CreatorOnboardingForm initialDisplayName={initialDisplayName} />;
}
