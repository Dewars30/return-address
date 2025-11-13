"use client";

import { useEffect } from "react";

/**
 * Client component to log CSP violations in development
 * Only runs in development mode to avoid production overhead
 */
export function CSPViolationLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Log CSP violations in development
    const reportViolation = (e: SecurityPolicyViolationEvent) => {
      console.warn("[CSP_VIOLATION]", {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        documentURI: e.documentURI,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber,
        columnNumber: e.columnNumber,
        effectiveDirective: e.effectiveDirective,
        originalPolicy: e.originalPolicy,
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener("securitypolicyviolation", reportViolation);

    return () => {
      document.removeEventListener("securitypolicyviolation", reportViolation);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

