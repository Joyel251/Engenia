import prisma from '@/lib/prisma';
import Leaderboard from "@/components/Leaderboard"
import nextDynamic from 'next/dynamic'

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 250): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      if (i > 0) {
        console.warn(`[leaderboard] retry ${i}/${attempts}`)
        await new Promise(r => setTimeout(r, delayMs * i))
      }
      return await fn()
    } catch (e: any) {
      lastErr = e
      if (e?.name && !/Prisma|Initialization|Network/i.test(e.name)) break
    }
  }
  throw lastErr
}

// Dynamic imports for client components
const BubbleMenu = nextDynamic(() => import('@/components/BubbleMenu'), { ssr: false })
const LightRays = nextDynamic(() => import('@/components/light-rays'), { ssr: false })
const PageIntroAnimation = nextDynamic(() => import('@/components/PageIntroAnimation'), { ssr: false })
const AnimatedPageHeader = nextDynamic(() => import('@/components/PageIntroAnimation').then(mod => ({ default: mod.AnimatedPageHeader })), { ssr: false })
const AnimatedPageContent = nextDynamic(() => import('@/components/PageIntroAnimation').then(mod => ({ default: mod.AnimatedPageContent })), { ssr: false })

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DepartmentRanking {
  id: string
  name: string
  points: number
  achievements: Array<{
    id: string
    badgeName: string
  }>
  winners: Array<{
    id: string
    position: number
    studentName: string | null
    event: {
      id: string
      name: string
      division: string
      type: string | null
      points: any
    }
  }>
  totalEvents: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  calculatedPoints: number
  rank: number
}

export default async function LeaderboardPage() {
  try {
    // Fetch settings for podium visibility with retry
  const settings = await withRetry(() => (prisma as any).settings.findFirst()) as { leaderboardVisible?: boolean } | null

    // Fetch departments with their winners and achievements (retry to survive transient network issue)
    const departments = await withRetry(() => (prisma as any).department.findMany({
      include: {
        achievements: true,
        winners: {
          include: { event: true },
          orderBy: { event: { date: 'desc' } }
        }
      },
      orderBy: { points: 'desc' }
    })) as any[]

  // Calculate detailed rankings and statistics (points derived from winners' event points)
  const departmentRankings: DepartmentRanking[] = (departments as any[]).map((dept: any) => {
      const winners = dept.winners || [];
      const firstPlaces = winners.filter((w: any) => w.position === 1).length;
      const secondPlaces = winners.filter((w: any) => w.position === 2).length;
      const thirdPlaces = winners.filter((w: any) => w.position === 3).length;
      
      // Calculate points from event participation
      const calculatedPoints = winners.reduce((total: number, winner: any) => {
        const eventPoints = winner.event?.points || {};
        const positionKey = winner.position.toString();
        return total + (eventPoints[positionKey] || 0);
      }, 0);

      return {
        id: dept.id,
        name: dept.name,
        // Use calculatedPoints as canonical points value
        points: calculatedPoints,
        achievements: dept.achievements || [],
        winners: winners.map((w: any) => ({
          id: w.id,
          position: w.position,
          studentName: w.studentName,
          event: {
            id: w.event.id,
            name: w.event.name,
            division: w.event.division,
            type: w.event.type,
            points: w.event.points
          }
        })),
        totalEvents: winners.length,
        firstPlaces,
        secondPlaces,
        thirdPlaces,
        calculatedPoints,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by computed points (calculatedPoints already assigned to points)
    departmentRankings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      // Tiebreaker: more first places wins
      if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces;
      // Secondary tiebreaker: more second places
      if (b.secondPlaces !== a.secondPlaces) return b.secondPlaces - a.secondPlaces;
      // Final tiebreaker: more total events participated
      return b.totalEvents - a.totalEvents;
    });

    // Assign ranks
    departmentRankings.forEach((dept, index) => {
      dept.rank = index + 1;
    });

    return (
      <PageIntroAnimation className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 bg-black text-white overflow-hidden" aria-labelledby="leaderboard-heading">
        {/* Light Rays Background */}
        <div className="absolute inset-0 pointer-events-none">
          <LightRays />
        </div>
        
        {/* Floating navigation menu - Hide logo on leaderboard page */}
        <BubbleMenu hideLogo useFixedPosition />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <AnimatedPageHeader>
            <div className="text-center mb-8 md:mb-12">
              <h1 id="leaderboard-heading" className="text-4xl md:text-6xl font-heading font-bold mb-4 tracking-tight">
                Leaderboard
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                Department rankings based on event results
              </p>
            </div>
          </AnimatedPageHeader>

          <AnimatedPageContent>
            {/* Leaderboard Component */}
            <Leaderboard departments={departmentRankings} showPodium={Boolean(settings?.leaderboardVisible)} />
          </AnimatedPageContent>
        </div>
      </PageIntroAnimation>
    );
  } catch (error) {
    console.error('Error fetching leaderboard data after retries:', error);
    return (
      <PageIntroAnimation className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <LightRays />
        </div>
        <BubbleMenu hideLogo useFixedPosition />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <AnimatedPageHeader>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8 tracking-tight">
              Leaderboard
            </h1>
          </AnimatedPageHeader>
          <AnimatedPageContent>
            <div className="text-center py-20">
              <h3 className="text-2xl text-zinc-400 mb-4">Unable to load leaderboard</h3>
              <p className="text-zinc-500">Temporary database connection issue. Please try again shortly.</p>
            </div>
          </AnimatedPageContent>
        </div>
      </PageIntroAnimation>
    );
  }
}