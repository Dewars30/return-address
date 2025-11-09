"use client";

import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Nav() {
  const { isSignedIn } = useUser();

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
            {isSignedIn ? (
              <>
                <Link
                  href="/creator/agents"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Creator dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
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

