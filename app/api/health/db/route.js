import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    console.log('🔌 Attempting database connection...');
    
    // Test connection with timeout
    const connectionTest = prisma.$queryRaw`SELECT 1 as test`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
    );
    
    await Promise.race([connectionTest, timeoutPromise]);
    
    console.log('✅ Database connection successful');
    
    // Test basic query
    const count = await prisma.event.count();
    console.log('📊 Event count:', count);
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      eventCount: count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database health check failed:');
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