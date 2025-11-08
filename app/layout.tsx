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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          <ErrorBoundary>
            <Nav />
            <main>{children}</main>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
