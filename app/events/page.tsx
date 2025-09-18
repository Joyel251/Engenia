import prisma from '@/lib/prisma';
import EventCards from "@/components/event-cards"
import nextDynamic from 'next/dynamic'

// Simple bounded retry for transient connection failures (e.g., first cold start)
async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 250): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      if (i > 0) {
        console.warn(`[events] retry ${i}/${attempts}`)
        await new Promise(r => setTimeout(r, delayMs * i))
      }
      return await fn()
    } catch (e: any) {
      lastErr = e
      // Abort early on known non‑retryable prisma errors (e.g., validation)
      if (e?.name && !/Prisma|Initialization|Network/i.test(e.name)) break
    }
  }
  throw lastErr
}

// BubbleMenu is a client component; load dynamically to avoid SSR mismatch
const BubbleMenu = nextDynamic(() => import('@/components/BubbleMenu'), { ssr: false })
const LightRays = nextDynamic(() => import('@/components/light-rays'), { ssr: false })

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function EventsPage() {
  let rawEvents: any[] = []
  try {
    rawEvents = await withRetry(() => prisma.event.findMany({
      include: {
        winners: { include: { department: true } }
      },
      orderBy: { date: 'asc' }
    }))
  } catch (error: any) {
    console.error('[events] failed to fetch events after retries:', error)
    // Graceful empty state on production connection failure
    rawEvents = []
  }

  // Normalize nullable fields for client component expectations
  const events = rawEvents.map((e: any) => ({
    id: e.id,
    name: e.name,
    status: e.status,
    division: e.division,
    type: e.type ?? 'General',
    date: (e.date instanceof Date ? e.date.toISOString() : e.date) as string,
    guidelines: e.guidelines ?? '',
    points: (e.points as any) ?? { 1: 0, 2: 0, 3: 0 },
    winners: e.winners.map((w: any) => ({
      id: w.id,
      eventId: w.eventId,
      deptId: w.deptId,
      position: w.position,
      studentName: w.studentName ?? 'Anonymous',
      department: w.department
    }))
  }));

  return (
    <main className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 bg-black text-white overflow-hidden" aria-labelledby="events-heading">
      {/* Light Rays Background */}
      <div className="absolute inset-0 pointer-events-none">
        <LightRays />
      </div>
      
      {/* Floating navigation menu - Hide logo on events page */}
      <BubbleMenu hideLogo useFixedPosition />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 id="events-heading" className="text-4xl md:text-6xl font-heading font-bold mb-8 md:mb-12 tracking-tight">
          Events
        </h1>

        {/* Event Cards Section */}
        <EventCards events={events} />
        {rawEvents.length === 0 && (
          <div className="mt-16 text-center text-sm text-zinc-500">
            <p>No events could be loaded. (Possible temporary database connection issue.)</p>
          </div>
        )}
      </div>
    </main>
  );
}