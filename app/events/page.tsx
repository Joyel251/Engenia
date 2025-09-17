import prisma from '@/lib/prisma';
import EventCards from "@/components/event-cards"
import nextDynamic from 'next/dynamic'

// BubbleMenu is a client component; load dynamically to avoid SSR mismatch
const BubbleMenu = nextDynamic(() => import('@/components/BubbleMenu'), { ssr: false })
const LightRays = nextDynamic(() => import('@/components/light-rays'), { ssr: false })

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function EventsPage() {
  // Fetch events with winners for context (status, division, etc.)
  const rawEvents = await (prisma as any).event.findMany({
    include: { 
      winners: {
        include: {
          department: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });

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
      </div>
    </main>
  );
}