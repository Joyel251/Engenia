import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add connection timeout and retry logic for Vercel
const originalConnect = prisma.$connect.bind(prisma);
prisma.$connect = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      await originalConnect();
      break;
    } catch (error) {
      console.log(`Database connection attempt failed, ${retries - 1} retries left:`, error.message);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export default prisma;