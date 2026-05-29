import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global;
const sqliteUrl = process.env.DATABASE_URL || "file:./dev.db";
const sqliteAdapter = new PrismaBetterSqlite3({ url: sqliteUrl });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: sqliteAdapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
