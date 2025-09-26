import { supabaseAdmin, TABLES } from '@/lib/supabase';
import EventCards from "@/components/event-cards"
import nextDynamic from 'next/dynamic'

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })

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
      // Abort early on known non-retryable supabase errors
      if (e?.code && !/PGRST|network/i.test(e.code)) break
    }
  }
  throw lastErr
}

import BubbleMenu from '@/components/BubbleMenu'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function EventsPage() {
  let rawEvents: any[] = []
  let settings: any = null
  
  try {
    // Fetch both events and settings
    const [eventsResult, settingsResult] = await Promise.all([
      withRetry(async () => {
        const { data, error } = await supabaseAdmin
          .from(TABLES.EVENTS)
          .select(`
            *,
            winners:Winner(
              *,
              department:Department(*)
            )
          `)
          .order('date', { ascending: true });
        
        if (error) throw error;
        return data || [];
      }),
      withRetry(async () => {
        const { data, error } = await supabaseAdmin
          .from(TABLES.SETTINGS)
          .select('*');
        
        if (error && error.code !== 'PGRST116') throw error;
        return data && data.length > 0 ? data[0] : { lockdown: false };
      })
    ])
    
    rawEvents = eventsResult
    settings = settingsResult
    
    // Debug logging
    console.log('[events] Raw events from database:', rawEvents.length, rawEvents.map(e => ({ id: e.id, name: e.name })))
    console.log('[events] Settings:', settings)
  } catch (error: any) {
    console.error('[events] failed to fetch events after retries:', error)
    // Graceful empty state on production connection failure
    rawEvents = []
  }

  // Normalize nullable fields and filter winners based on lock status
  const events = rawEvents.map((e: any) => ({
    id: e.id,
    name: e.name,
    status: e.status,
    division: e.division,
    type: e.type ?? 'General',
    date: (e.date instanceof Date ? e.date.toISOString() : e.date) as string,
    guidelines: e.guidelines ?? '',
    points: (e.points as any) ?? { 1: 0, 2: 0, 3: 0 },
    winners: settings?.lockdown ? [] : e.winners.map((w: any) => ({
      id: w.id,
      eventId: w.eventId,
      deptId: w.deptId,
      position: w.position,
      studentName: w.studentName ?? 'Anonymous',
      department: w.department
    }))
  }));

  console.log('[events] Final processed events:', events.length, events.map(e => ({ id: e.id, name: e.name, status: e.status })))

  return (
<main className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 text-foreground overflow-hidden" style={{backgroundColor: 'transparent'}} aria-labelledby="events-heading">
      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={14} beamNumber={8} lightColor="#00bcd4" speed={1.2} noiseIntensity={1.4} scale={0.15} rotation={0} />
      </div>
      
      {/* Floating navigation menu - Hide logo on events page */}
      <BubbleMenu
        logo="/logo5.png"
        items={[
          { label: 'home', href: '/home', ariaLabel: 'Home', rotation: -8, hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' } },
          { label: 'events', href: '/events', ariaLabel: 'Events', rotation: 8, hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' } },
          { label: 'leaderboard', href: '/leaderboard', ariaLabel: 'Leaderboard', rotation: 8, hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' } },
          { label: 'photogallery', href: '/photogallery', ariaLabel: 'Photo Gallery', rotation: 8, hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' } },
          { label: 'updates', href: '/announcements', ariaLabel: 'Updates & Announcements', rotation: -8, hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' } }
        ]}
        menuAriaLabel="Toggle navigation"
        menuBg="rgba(255, 255, 255, 0.95)"
        menuContentColor="#111111"
        useFixedPosition={true}
        animationEase="back.out(1.5)"
        animationDuration={0.6}
        staggerDelay={0.1}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 id="events-heading" className="text-4xl md:text-6xl font-heading font-bold mb-8 md:mb-12 tracking-tight">
          Events
        </h1>

        {settings?.lockdown && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
            Winners are hidden while the competition is locked.
          </div>
        )}

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