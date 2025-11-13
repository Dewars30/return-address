"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Nav() {
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
            <SignedIn>
              <Link
                href="/creator/agents"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Creator dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Creator dashboard
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

