import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Vercel-optimized Prisma configuration
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pool settings for Vercel
  __internal: {
    engine: {
      connectionTimeout: 20000,
      maxWait: 20000,
      timeout: 20000,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add connection retry logic specifically for Vercel
async function connectWithRetry() {
  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      console.log(`❌ Connection attempt failed. Retries left: ${retries - 1}`);
      console.log(`Error: ${error.message}`);
      
      retries--;
      
      if (retries === 0) {
        console.error('🚨 All connection attempts failed');
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// Override the connect method
const originalConnect = prisma.$connect.bind(prisma);
prisma.$connect = connectWithRetry;

export default prisma;