// lib/prisma.js
import { PrismaClient } from "@prisma/client";

// Validate environment variables
if (!process.env.DIRECT_URL) {
  throw new Error('DIRECT_URL environment variable is not set');
}

const globalForPrisma = globalThis;

// Create Prisma client using direct connection for reliability
const createPrismaClient = () => {
  console.log('[Prisma] Using direct connection for maximum reliability');
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DIRECT_URL, // Use direct connection to avoid pooler issues
      },
    },
  });
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
