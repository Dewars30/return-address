"use client";

import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

function isNextSpecialError(error: unknown): boolean {
  const e = error as any;
  const digest = e?.digest;
  const message = e?.message || "";
  const name = e?.name || "";

  if (typeof digest === "string") {
    if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) {
      return true;
    }
  }

  // Fallback: if Next encodes it differently or minifies
  if (
    typeof message === "string" &&
    (message.includes("NEXT_REDIRECT") || message.includes("NEXT_NOT_FOUND"))
  ) {
    return true;
  }

  if (name === "NEXT_REDIRECT" || name === "NEXT_NOT_FOUND") {
    return true;
  }

  return false;
}

function isClerkError(error: any): boolean {
  // Don't catch errors from Clerk components - they handle their own errors
  const stack = error?.stack || "";
  const message = error?.message || "";
  return (
    stack.includes("@clerk") ||
    stack.includes("clerk") ||
    message.includes("clerk") ||
    message.includes("Clerk")
  );
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (isNextSpecialError(error)) {
      return { hasError: false, error: undefined };
    }
    // Don't catch Clerk component errors - they handle their own errors
    if (isClerkError(error)) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // If we somehow catch a Next.js special error here, don't log it
    if (isNextSpecialError(error) || isClerkError(error)) {
      // Don't log Next.js redirect errors - they're expected
      return;
    }

    // Enhanced logging for real errors
    console.error("[ERROR_BOUNDARY] Caught error:", {
      error: {
        name: error?.name,
        message: error?.message,
        digest: error?.digest,
        stack: error?.stack,
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack,
      },
      timestamp: new Date().toISOString(),
    });

    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError && error && !isNextSpecialError(error)) {
      return (
        <div className="mx-auto max-w-2xl py-16">
          <h1 className="text-2xl font-semibold mb-4">Something went wrong.</h1>
          <p className="text-sm text-gray-500">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
