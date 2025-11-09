"use client";

import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  nextRedirectError?: any;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

function isNextSpecialError(error: any): boolean {
  const digest = error?.digest;
  if (typeof digest !== "string") return false;

  return (
    digest.startsWith("NEXT_REDIRECT") ||
    digest.startsWith("NEXT_NOT_FOUND")
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
    // For Next.js redirect/not-found errors, store them to rethrow in render
    if (isNextSpecialError(error)) {
      return { hasError: true, error, nextRedirectError: error };
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
      return;
    }
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    // If we have a Next.js redirect error, rethrow it so Next.js can handle it
    if (this.state.nextRedirectError) {
      throw this.state.nextRedirectError;
    }

    if (this.state.hasError && this.state.error) {
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
