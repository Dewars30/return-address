import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logError, logInfo } from "@/lib/log";

/**
 * Health check endpoint to test database connection
 * GET /api/health/db
 *
 * With PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true, prepared statements are disabled globally,
 * so all Prisma queries work correctly with connection poolers (PgBouncer/Supavisor).
 * This route must be dynamic (not statically generated) since it tests a live DB connection.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    // With PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true, prepared statements are disabled globally
    await prisma.$queryRawUnsafe("SELECT 1");

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

