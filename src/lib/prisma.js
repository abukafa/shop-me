import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global;

let prismaInstance;

if (typeof window === "undefined") {
  const dbUrlString = process.env.DATABASE_URL;
  if (!dbUrlString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  try {
    const url = new URL(dbUrlString);
    const host = url.hostname;
    const port = Number(url.port) || 3306;
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const database = url.pathname.substring(1);

    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 5,
    });

    prismaInstance = globalForPrisma.prisma || new PrismaClient({
      adapter,
      log: ["query"],
    });
  } catch (error) {
    console.error("Failed to initialize PrismaMariaDb adapter:", error);
    throw error;
  }
} else {
  prismaInstance = globalForPrisma.prisma || new PrismaClient();
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

