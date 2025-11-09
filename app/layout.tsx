import type { Metadata } from "next";

import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import Nav from "./components/Nav";

import { ErrorBoundary } from "./components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Return Address",
  description:
    "Return Address is the platform for expert-owned, high-signal AI agents with clear provenance, enforced guardrails, and direct revenue for their creators.",
  icons: {
    icon: "/favicon.ico",
  },
};

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignInUrl={appUrl}
      afterSignUpUrl={appUrl}
    >
      <html lang="en">
        <body className={inter.className}>
          <ErrorBoundary>
            <Nav />
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
