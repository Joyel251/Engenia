import { NextResponse } from 'next/server';

// In-memory fallback for demo. Use a database or KV store for production.
let launched = false;

export async function GET() {
  return NextResponse.json({ launched });
}

export async function POST(request) {
  // TODO: Add admin authentication here
  const { reset } = request ? await request.json().catch(() => ({})) : {};
  if (reset) {
    launched = false;
    return NextResponse.json({ launched });
  }
  launched = true;
  return NextResponse.json({ launched });
}
