import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // SQLite workaround for Vercel: copy DB to /tmp
  const dbName = "dev.db";
  const sourcePath = path.join(process.cwd(), "prisma", dbName);
  const targetPath = path.join("/tmp", dbName);

  if (fs.existsSync(sourcePath)) {
    if (!fs.existsSync(targetPath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`Failed to copy ${dbName} to ${targetPath}:`, err);
      }
    }
  }

  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: `file:${targetPath}`,
      },
    },
    log: ["error"],
  });
} else {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error", "warn"],
    });

  if ((process.env.NODE_ENV as string) !== "production") {
     globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
