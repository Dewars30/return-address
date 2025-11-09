import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default async function Nav() {
  const user = await getCurrentUser();
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  const isAdmin = user && adminEmails.includes(user.email);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Return Address
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/marketplace"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Marketplace
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/agents"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {user.isCreator ? (
                  <Link
                    href="/creator/agents"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Creator dashboard
                  </Link>
                ) : (
                  <Link
                    href="/creator/onboarding"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Become a creator
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton
                mode="modal"
                forceRedirectUrl={false}
              >
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

