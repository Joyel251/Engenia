import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple bounded retry for transient connection failures
async function withRetry(fn, attempts = 3, delayMs = 250) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      if (i > 0) {
        console.warn(`[health] retry ${i}/${attempts}`);
        await new Promise(r => setTimeout(r, delayMs * i));
      }
      return await fn();
    } catch (e) {
      lastErr = e;
      if (e?.name && !/Prisma|Initialization|Network/i.test(e.name)) break;
    }
  }
  throw lastErr;
}

export async function GET() {
  try {
    console.log('🔍 Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    console.log('🔌 Attempting database connection...');
    
    // Test connection with retry mechanism
    await withRetry(() => prisma.$queryRaw`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    
    // Test basic query with retry
    const count = await withRetry(() => prisma.event.count());
    console.log('📊 Event count:', count);
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      eventCount: count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database health check failed after retries:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}