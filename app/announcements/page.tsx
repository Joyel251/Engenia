import { supabaseAdmin, TABLES } from '@/lib/supabase';
import nextDynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { Clock, Megaphone, Calendar } from 'lucide-react'

// Simple bounded retry for transient connection failures
async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 250): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      if (i > 0) {
        console.warn(`[announcements] retry ${i}/${attempts}`)
        await new Promise(r => setTimeout(r, delayMs * i))
      }
      return await fn()
    } catch (e: any) {
      lastErr = e
      if (e?.code && !/PGRST|network/i.test(e.code)) break
    }
  }
  throw lastErr
}

// Dynamic imports for client components
const BubbleMenu = nextDynamic(() => import('@/components/BubbleMenu'), { ssr: false })
const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })
const AnnouncementsList = nextDynamic(() => import('@/components/AnnouncementsList'), { ssr: false })
const PageIntroAnimation = nextDynamic(() => import('@/components/PageIntroAnimation'), { ssr: false })
const AnimatedPageHeader = nextDynamic(() => import('@/components/PageIntroAnimation').then(mod => ({ default: mod.AnimatedPageHeader })), { ssr: false })
const AnimatedPageContent = nextDynamic(() => import('@/components/PageIntroAnimation').then(mod => ({ default: mod.AnimatedPageContent })), { ssr: false })

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default async function AnnouncementsPage() {
  let announcements: Announcement[] = []
  
  try {
    const rawAnnouncements = await withRetry(async () => {
      const { data, error } = await supabaseAdmin
        .from(TABLES.ANNOUNCEMENTS)
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }) as any[]
    
    // Format announcements for client
    announcements = rawAnnouncements.map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt
    }))
  } catch (error: any) {
    console.error('[announcements] failed to fetch announcements after retries:', error)
    announcements = []
  }

  return (
<PageIntroAnimation className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 text-foreground overflow-hidden" style={{backgroundColor: 'transparent'}} aria-labelledby="announcements-heading">
      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#00bcd4" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
      </div>
      
      {/* Floating navigation menu */}
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
        {/* Header Section */}
        <AnimatedPageHeader>
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Megaphone className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
            
            <h1 id="announcements-heading" className="text-4xl md:text-6xl font-heading font-bold mb-4 tracking-tight">
              Announcements
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
              Stay updated with the latest news and updates from Engenia 2K25
            </p>
          </div>
        </AnimatedPageHeader>

        <AnimatedPageContent>
          {/* Announcements Content */}
          {announcements.length > 0 ? (
            // @ts-ignore - Dynamic import typing issue
            <AnnouncementsList announcements={announcements} />
          ) : (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <Calendar className="w-16 h-16 text-zinc-600 mx-auto" />
                <div className="absolute -inset-2 bg-zinc-600/10 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl text-zinc-400 mb-4">No announcements yet</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Check back soon for important updates and news about Engenia 2K25 events and activities.
              </p>
            </div>
          )}
        </AnimatedPageContent>
      </div>
    </PageIntroAnimation>
  );
}