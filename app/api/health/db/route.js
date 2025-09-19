import { NextResponse } from 'next/server';
import { supabaseAdmin, TABLES } from '@/lib/supabase';

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
      if (e?.code && !/PGRST|network/i.test(e.code)) break;
    }
  }
  throw lastErr;
}

export async function GET() {
  try {
    console.log('🔍 Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('🔌 Attempting Supabase connection...');
    
    // Test connection with retry mechanism
    await withRetry(async () => {
      const { error } = await supabaseAdmin
        .from(TABLES.EVENTS)
        .select('id')
        .limit(1);
      if (error) throw error;
    });
    console.log('✅ Supabase connection successful');
    
    // Test basic query with retry
    const { count, error } = await withRetry(async () => {
      return await supabaseAdmin
        .from(TABLES.EVENTS)
        .select('*', { count: 'exact', head: true });
    });
    
    if (error) throw error;
    
    console.log('📊 Event count:', count);
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      eventCount: count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Supabase health check failed after retries:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
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