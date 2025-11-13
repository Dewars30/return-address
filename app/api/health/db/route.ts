import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logError, logInfo } from "@/lib/log";

/**
 * Health check endpoint to test database connection
 * GET /api/health/db
 *
 * With pgbouncer=true in DATABASE_URL, prepared statements are disabled at connection level,
 * so standard $queryRaw works correctly with connection poolers.
 * This route must be dynamic (not statically generated) since it tests a live DB connection.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    // With pgbouncer=true in DATABASE_URL, prepared statements are disabled at connection level
    // So we can use standard $queryRaw (or keep $queryRawUnsafe - both work)
    await prisma.$queryRaw`SELECT 1`;

    logInfo({ route: "/api/health/db", statusCode: 200 }, "Database health check passed");

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
      },
      { status: 200 }
    );
  } catch (error) {
    logError(
      { route: "/api/health/db", statusCode: 500 },
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

