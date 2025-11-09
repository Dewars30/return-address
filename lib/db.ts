import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Test database connection
 * Returns true if connection is successful, false otherwise
 * Uses $queryRawUnsafe to avoid prepared statements (works with connection poolers)
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.$queryRawUnsafe("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

