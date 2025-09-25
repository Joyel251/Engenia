import { NextResponse } from 'next/server'

// In-memory flag (same as launchstatus endpoint)
const g = globalThis as any
if (g.__ENGENIA_LAUNCHED__ === undefined) {
  g.__ENGENIA_LAUNCHED__ = false
}

export async function POST(request: Request) {
  try {
    // Toggle the current launch status
    const currentStatus = !!g.__ENGENIA_LAUNCHED__
    g.__ENGENIA_LAUNCHED__ = !currentStatus
    
    return NextResponse.json({ 
      launched: g.__ENGENIA_LAUNCHED__, 
      message: g.__ENGENIA_LAUNCHED__ ? 'Website launched' : 'Website locked' 
    }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to toggle launch status' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ launched: !!g.__ENGENIA_LAUNCHED__ }, { status: 200 })
}