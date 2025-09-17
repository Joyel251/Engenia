import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  const started = Date.now()
  try {
    // Lightweight query; select 1 row or count
    const eventCount = await prisma.event.count()
    const durationMs = Date.now() - started
    return NextResponse.json({
      ok: true,
      eventCount,
      durationMs,
      dbHost: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'unknown'
    }, { status: 200 })
  } catch (error) {
    const durationMs = Date.now() - started
    console.error('[DB_HEALTH] Error:', error)
    return NextResponse.json({
      ok: false,
      durationMs,
      name: error?.name,
      message: error?.message,
      code: error?.code || undefined,
      digest: error?.digest || undefined
    }, { status: 500 })
  }
}
