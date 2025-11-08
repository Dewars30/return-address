import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Nav from "./components/Nav";

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
  // Extract domain from NEXT_PUBLIC_APP_URL for Clerk
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://returnaddress.io";
  const domain = appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      domain={domain}
    >
      <html lang="en">
        <body className={inter.className}>
          <Nav />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
