"use client";

import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

function isNextSpecialError(error: any): boolean {
  // Check digest first (most reliable)
  const digest = error?.digest;
  if (typeof digest === "string") {
    return (
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_NOT_FOUND")
    );
  }

  // Also check error message and name as fallback
  const message = error?.message || "";
  const name = error?.name || "";

  return (
    message.includes("NEXT_REDIRECT") ||
    message.includes("NEXT_NOT_FOUND") ||
    name === "NEXT_REDIRECT" ||
    name === "NEXT_NOT_FOUND"
  );
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
    // Don't catch Next.js redirect/not-found errors - let them bubble up
    // Returning { hasError: false } prevents ErrorBoundary from catching it
    if (isNextSpecialError(error)) {
      // Re-throw by returning false state - Next.js will handle the redirect
      return { hasError: false };
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
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    // Never render error UI for Next.js special errors
    if (this.state.hasError && this.state.error && !isNextSpecialError(this.state.error)) {
      return (
        <div className="w-full border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="font-semibold">Something went wrong.</div>
          <div className="mt-1 break-all">
            {this.state.error.message || "An unexpected error occurred."}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
