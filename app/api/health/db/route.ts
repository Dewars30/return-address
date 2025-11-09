import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health check endpoint to test database connection
 * GET /api/health/db
 */
export async function GET(request: NextRequest) {
  try {
    // Test database connection with simple query
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

