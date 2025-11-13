import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Export db as alias for backward compatibility
export const db = prisma;

/**
 * Test database connection
 * Returns true if connection is successful, false otherwise
 * With PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true, prepared statements are disabled globally,
 * so all Prisma queries work correctly with connection poolers (PgBouncer/Supavisor).
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

