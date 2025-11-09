import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health check endpoint to test database connection
 * GET /api/health/db
 */
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await db.$queryRaw`SELECT 1 as test`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      test: result,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorString = String(error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: errorMessage,
        errorDetails: errorString,
        // Generic connection hint - no provider-specific assumptions
        connectionHint: errorString.includes("Tenant or user not found") ||
          errorString.includes("authentication failed") ||
          errorString.includes("connection refused")
          ? "Check DATABASE_URL environment variable is set correctly and database is accessible"
          : null,
      },
      { status: 500 }
    );
  }
}

