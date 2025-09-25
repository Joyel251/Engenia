import { NextResponse } from 'next/server'

// In-memory flag (resets on server restart). Replace with DB if persistence is required.
const g = globalThis as any
if (g.__ENGENIA_LAUNCHED__ === undefined) {
  g.__ENGENIA_LAUNCHED__ = false
}

export async function GET() {
  return NextResponse.json({ launched: !!g.__ENGENIA_LAUNCHED__ }, { status: 200 })
}

export async function POST(request: Request) {
  try {
    let launched = true
    try {
      const body = await request.json().catch(() => null)
      if (body && typeof body.launched === 'boolean') {
        launched = body.launched
      }
    } catch {}
    g.__ENGENIA_LAUNCHED__ = launched
    return NextResponse.json({ launched }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to set launch status' }, { status: 500 })
  }
}