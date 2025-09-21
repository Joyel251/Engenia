"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, LayoutGroup } from "motion/react"
import { Trophy, Medal, Award, Users, Star, ChevronRight, RefreshCw, Table2, Grid, Lock } from "lucide-react"

interface Settings {
  leaderboardVisible: boolean
  lockdown: boolean
}

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

interface LeaderboardProps {
  departments: DepartmentRanking[]
  settings?: Settings | null
  showPodium?: boolean // controls whether top 3 podium is visible
  locked?: boolean     // controls whether leaderboard is locked
  live?: boolean        // enable live updates
  pollIntervalMs?: number // polling interval in ms
}

const PODIUM_COLORS = {
  1: {
    gradient: "from-yellow-400 via-amber-400 to-orange-500",
    glow: "shadow-[0_0_50px_rgba(251,191,36,0.3)]",
    ring: "ring-yellow-400/30",
    icon: "text-yellow-400"
  },
  2: {
    gradient: "from-gray-300 via-slate-300 to-zinc-400", 
    glow: "shadow-[0_0_40px_rgba(148,163,184,0.25)]",
    ring: "ring-slate-400/30",
    icon: "text-slate-300"
  },
  3: {
    gradient: "from-amber-600 via-yellow-600 to-orange-700",
    glow: "shadow-[0_0_35px_rgba(217,119,6,0.25)]",
    ring: "ring-amber-600/30",
    icon: "text-amber-600"
  }
}

export default function Leaderboard({ departments, settings, showPodium = true, locked = false, live = false, pollIntervalMs = 5000 }: LeaderboardProps) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  // Recompute initial points purely from winners' event points so all totals are consistent
  const initialComputed = departments.map(d => {
    const recomputed = d.winners.reduce((sum, w) => {
      const pts = (w.event?.points || {})[w.position.toString()] || 0
      return sum + pts
    }, 0)
    return { ...d, points: recomputed }
  })
  
  const [data, setData] = useState<DepartmentRanking[]>(initialComputed)
  const prevRanksRef = useRef<Record<string, number>>({})
  const prevPointsRef = useRef<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Initialize previous rank and points maps
  useEffect(() => {
    const rankMap: Record<string, number> = {}
    const ptsMap: Record<string, number> = {}
    data.forEach(d => { rankMap[d.id] = d.rank; ptsMap[d.id] = d.points })
    prevRanksRef.current = rankMap
    prevPointsRef.current = ptsMap
  }, [])

  // Trigger card animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // If podium is enabled, prefer Cards view so students see podium by default
  useEffect(() => {
    if (showPodium && !locked) {
      setViewMode('cards')
    }
  }, [showPodium, locked])

  // Fetch transform & ranking logic (shared for polling + manual refresh)
  const performFetch = useCallback(async () => {
    const res = await fetch('/api/departments', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch departments')
    const raw = await res.json()
        const transformed: DepartmentRanking[] = (raw || []).map((dept: any) => {
      const winners = dept.winners || []
      const firstPlaces = winners.filter((w: any) => w.position === 1).length
      const secondPlaces = winners.filter((w: any) => w.position === 2).length
      const thirdPlaces = winners.filter((w: any) => w.position === 3).length
      const calculatedPoints = winners.reduce((total: number, winner: any) => {
        const eventPoints = winner.event?.points || {}
        const positionKey = winner.position?.toString?.() || ''
        return total + (eventPoints?.[positionKey] || 0)
      }, 0)
      return {
        id: dept.id,
        name: dept.name,
        points: dept.points,
        achievements: dept.achievements || [],
        winners: winners.map((w: any) => ({
          id: w.id,
          position: w.position,
          studentName: w.studentName,
              event: { id: w.event.id, name: w.event.name, division: w.event.division, type: w.event.type, points: w.event.points }
        })),
        totalEvents: winners.length,
        firstPlaces,
        secondPlaces,
        thirdPlaces,
        calculatedPoints,
        rank: 0
      }
    })
    // Replace points with computed points from winners for consistency
    transformed.forEach(d => {
      d.points = d.winners.reduce((sum, w) => {
        const pts = (w.event?.points || {})[w.position.toString()] || 0
        return sum + pts
      }, 0)
    })
    transformed.sort((a,b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces
      if (b.secondPlaces !== a.secondPlaces) return b.secondPlaces - a.secondPlaces
      return b.totalEvents - a.totalEvents
    })
    transformed.forEach((d,i) => d.rank = i+1)
    const prevRankMap = { ...prevRanksRef.current }
    const prevPointsMap = { ...prevPointsRef.current }
        const newRankMap: Record<string, number> = {}
        const newPointsMap: Record<string, number> = {}
        transformed.forEach(d => { 
          newRankMap[d.id] = d.rank; 
          const cp = d.winners.reduce((sum, w) => {
            const pts = (w.event?.points || {})[w.position.toString()] || 0
            return sum + pts
          }, 0)
          newPointsMap[d.id] = cp
        })
    prevRanksRef.current = newRankMap
    prevPointsRef.current = newPointsMap
    const enriched = transformed.map(d => ({
      ...d,
      _prevRank: prevRankMap[d.id],
      _prevPoints: prevPointsMap[d.id]
    })) as any
    setData(enriched)
    setLastUpdated(new Date())
  }, [])

  // Manual refresh (soft; avoids full reload for animation continuity)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    
    // Trigger card swap animation before fetching
    setAnimateCards(false)
    
    try { 
      await performFetch() 
      
      // Re-trigger animations after data update
      setTimeout(() => {
        setAnimateCards(true)
      }, 100)
      
    } catch (e) { 
      console.error(e) 
    } finally { 
      setIsRefreshing(false) 
    }
  }, [performFetch])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6" />
      case 2: return <Medal className="w-6 h-6" />
      case 3: return <Award className="w-6 h-6" />
      default: return <Star className="w-5 h-5" />
    }
  }

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) return getRankIcon(rank)
    return <span className="text-2xl font-bold text-zinc-400">#{rank}</span>
  }

  const getCardStyles = (rank: number) => {
    if (rank <= 3 && PODIUM_COLORS[rank as keyof typeof PODIUM_COLORS]) {
      const colors = PODIUM_COLORS[rank as keyof typeof PODIUM_COLORS]
      return {
        gradient: colors.gradient,
        glow: colors.glow,
        ring: colors.ring,
        icon: colors.icon
      }
    }
    return {
      gradient: "from-zinc-800 to-zinc-900",
      glow: "shadow-[0_0_20px_rgba(0,0,0,0.3)]",
      ring: "ring-zinc-700/40",
      icon: "text-zinc-400"
    }
  }

  // Derived sorted list (ensures consistent ordering by rank)
  const sortedData = [...data].sort((a,b) => a.rank - b.rank)
  const topThree = sortedData.slice(0, 3)
  const displayDepartments = sortedData

  // Polling disabled - only manual refresh available
  // useEffect(() => {
  //   if (!live) return
  //   let timer: any
  //   const loop = async () => {
  //     setIsPolling(true)
  //     try { await performFetch() } catch (e) { console.error(e) } finally { setIsPolling(false); timer = setTimeout(loop, pollIntervalMs) }
  //   }
  //   loop()
  //   return () => clearTimeout(timer)
  // }, [live, pollIntervalMs, performFetch])

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Locked State: Show SVG and message, hide all rankings/cards */}
      {locked ? (
        <div className="flex flex-col items-center justify-center py-16">
          {/* Nicer animated lock icon */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} className="relative mb-6">
            <div className="absolute -inset-4 bg-amber-500/10 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.15)]">
              <Lock className="w-12 h-12 text-amber-400" />
            </div>
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">Leaderboard is Locked</h2>
          <p className="text-base md:text-lg text-amber-200/80 text-center max-w-xl mb-4">Rankings are hidden during the event. Please check back later!</p>
        </div>
      ) : (
        <>
  {/* Compact header controls */}
  <div className="flex flex-wrap items-center justify-end mb-6 gap-3">
        <div className="flex items-center gap-2 bg-zinc-800/50 rounded-full p-1 pr-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${viewMode==='table' ? 'bg-blue-500 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            <Table2 className="w-4 h-4" /> Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${viewMode==='cards' ? 'bg-blue-500 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" /> Cards
          </button>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-zinc-500 px-2 py-1 rounded bg-zinc-800/50">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 180 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-full bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Hint: Podium enabled but in table view */}
      {showPodium && viewMode === 'table' && (
        <div className="w-full mb-4 rounded-md bg-amber-500/10 border border-amber-400/20 text-amber-200 text-xs px-3 py-2">
          Podium view is enabled. Switch to "Cards" to see the top 3 podium.
        </div>
      )}

      {viewMode === 'table' && (
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-black">
          <div className="overflow-x-auto">
            <LayoutGroup>
              <table className="w-full text-sm hidden sm:table">
                <thead>
                  <tr className="text-[10px] md:text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-900/60">
                    <th className="py-2 md:py-2.5 pl-5 md:pl-6 pr-2 text-left font-medium">Rank</th>
                    <th className="py-2 md:py-2.5 px-2 text-left font-medium">Department</th>
                    <th className="py-2 md:py-2.5 px-2 text-right font-medium">Points</th>
                    <th className="py-2 md:py-2.5 px-2 text-center font-medium">1st</th>
                    <th className="py-2 md:py-2.5 px-2 text-center font-medium">2nd</th>
                    <th className="py-2 md:py-2.5 px-2 text-center font-medium">3rd</th>
                    <th className="py-2 md:py-2.5 px-2 text-center font-medium">Events</th>
                  </tr>
                </thead>
                <tbody className="relative">
                  <AnimatePresence initial={false}>
                    {displayDepartments.map((dept) => {
                      const rankChange = (dept as any)._prevRank && (dept as any)._prevRank !== dept.rank ? (dept as any)._prevRank - dept.rank : 0
                      const pointsChange = (dept as any)._prevPoints !== undefined ? dept.points - (dept as any)._prevPoints : 0
                      return (
                        <motion.tr
                          key={dept.id}
                          layout
                          layoutId={dept.id}
                          initial={false}
                          animate={{ backgroundColor: rankChange !== 0 ? 'rgba(34,197,94,0.10)' : 'rgba(0,0,0,0)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
                          className={`group border-t border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${rankChange < 0 ? 'outline outline-1 outline-emerald-500/40' : rankChange > 0 ? 'outline outline-1 outline-red-500/40' : ''}`}
                        >
                          <td className="py-1.5 md:py-2 pl-5 md:pl-6 pr-2 font-semibold text-zinc-200">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold">{dept.rank}</span>
                              {rankChange !== 0 && (
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className={`w-2 h-2 rounded-full ${rankChange < 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-1.5 md:py-2 px-2 font-medium text-white whitespace-pre-wrap max-w-[220px]">
                            <div className="flex flex-col gap-1">
                              <span className="leading-tight">{dept.name}</span>
                              {/* Achievements removed */}
                            </div>
                          </td>
                          <td className="py-1.5 md:py-2 px-2 text-right font-semibold tabular-nums">
                            <div className="flex items-center justify-end gap-2">
                              <motion.span key={dept.points} initial={{ scale: 1.15, color: '#22d3ee' }} animate={{ scale: 1, color: '#ffffff' }} className="text-white">
                                {dept.points.toLocaleString()}
                              </motion.span>
                              {pointsChange > 0 && (
                                <motion.span
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="text-[10px] font-medium text-emerald-400 ml-2"
                                >
                                  +{pointsChange}
                                </motion.span>
                              )}
                            </div>
                          </td>
                          <td className="py-1.5 md:py-2 px-2 text-center font-medium text-amber-400">{dept.firstPlaces}</td>
                          <td className="py-1.5 md:py-2 px-2 text-center font-medium text-zinc-300">{dept.secondPlaces}</td>
                          <td className="py-1.5 md:py-2 px-2 text-center font-medium text-orange-500">{dept.thirdPlaces}</td>
                          <td className="py-1.5 md:py-2 px-2 text-center text-zinc-300">{dept.totalEvents}</td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </LayoutGroup>
          </div>
          {/* Mobile condensed list */}
          <div className="sm:hidden divide-y divide-zinc-800">
            {displayDepartments.map(dept => {
              const rankChange = (dept as any)._prevRank && (dept as any)._prevRank !== dept.rank ? (dept as any)._prevRank - dept.rank : 0
              const pointsChange = (dept as any)._prevPoints !== undefined ? dept.points - (dept as any)._prevPoints : 0
              return (
                <motion.div
                  key={dept.id}
                  layout
                  layoutId={`mobile-row-${dept.id}`}
                  className={`px-3 py-2.5 flex items-center gap-3 relative overflow-hidden rounded-sm`}
                  initial={false}
                  animate={{ backgroundColor: rankChange !== 0 ? 'rgba(34,197,94,0.08)' : 'transparent' }}
                  transition={{ type: 'spring', stiffness: 450, damping: 38, mass: 0.6 }}
                >
                  {rankChange !== 0 && (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 pointer-events-none ${rankChange < 0 ? 'animate-pulse' : ''}`}
                      style={{ background: rankChange < 0 ? 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.18), transparent 70%)' : 'radial-gradient(circle at 30% 50%, rgba(244,63,94,0.18), transparent 70%)' }}
                    />
                  )}
                  <div className="flex flex-col items-center w-10">
                    <span className="text-sm font-bold text-zinc-200">{dept.rank}</span>
                    {rankChange !== 0 && (
                      <div className={`w-2 h-2 rounded-full mt-0.5 ${rankChange < 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">{dept.name}</span>
                      <span className="text-sm font-bold text-cyan-300 tabular-nums">{dept.points}</span>
                    </div>
                    <div className="mt-1 grid grid-cols-4 gap-1 text-[10px] text-zinc-400">
                      <div className="text-center"><span className="block text-amber-400 font-semibold">{dept.firstPlaces}</span><span className="opacity-60">1st</span></div>
                      <div className="text-center"><span className="block text-zinc-300 font-semibold">{dept.secondPlaces}</span><span className="opacity-60">2nd</span></div>
                      <div className="text-center"><span className="block text-orange-500 font-semibold">{dept.thirdPlaces}</span><span className="opacity-60">3rd</span></div>
                      <div className="text-center"><span className="block text-zinc-300 font-semibold">{dept.totalEvents}</span><span className="opacity-60">Evt</span></div>
                    </div>
                    {pointsChange !== 0 && (
                      <div className="mt-1 text-[10px] font-medium flex items-center gap-1">
                        <span className={pointsChange>0 ? 'text-emerald-400' : 'text-red-400'}>{pointsChange>0?`+${pointsChange}`:pointsChange}</span>
                        <span className="text-zinc-500">since update</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
          {isPolling && (
            <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-zinc-800/70 text-cyan-300 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> updating
            </div>
          )}
        </div>
      )}

      {viewMode === 'cards' && (
        <>
          {/* existing podium + cards below */}
        </>
      )}

  {viewMode==='cards' && showPodium && topThree.length === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-16 px-2 md:px-6"
        >
          {/* Ambient glow */}
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-r from-amber-500/10 via-yellow-300/10 to-purple-500/10" />
          <div className="flex items-end justify-center gap-3 md:gap-10 max-w-4xl mx-auto">
            {/* Second */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center w-28 md:w-40"
            >
              <div className="relative w-full">
                <div className={`h-28 md:h-40 rounded-t-xl rounded-b-sm bg-gradient-to-br ${getCardStyles(2).gradient} ${getCardStyles(2).glow} flex flex-col items-center justify-end pb-3 ring-2 ${getCardStyles(2).ring}`}> 
                  <Medal className={`w-8 h-8 mb-1 ${getCardStyles(2).icon}`} />
                  <span className="text-xs md:text-sm font-semibold text-white px-2 text-center line-clamp-2">{topThree[1].name}</span>
                  <span className="text-[10px] md:text-xs text-zinc-200/70">{topThree[1].points} pts</span>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full h-3 bg-gradient-to-r from-white/10 via-white/30 to-white/10 blur-md rounded-full" />
              </div>
              <div className="mt-6 text-sm font-medium text-zinc-400">2nd</div>
            </motion.div>
            {/* First */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center w-32 md:w-48"
            >
              <div className="relative w-full">
                <div className={`h-36 md:h-56 rounded-t-xl rounded-b-sm bg-gradient-to-br ${getCardStyles(1).gradient} ${getCardStyles(1).glow} flex flex-col items-center justify-end pb-4 ring-2 ${getCardStyles(1).ring}`}> 
                  <Trophy className={`w-10 h-10 mb-2 ${getCardStyles(1).icon}`} />
                  <span className="text-sm md:text-base font-bold text-white px-2 text-center line-clamp-2">{topThree[0].name}</span>
                  <span className="text-xs md:text-sm text-amber-100/80 font-semibold">{topThree[0].points} pts</span>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full h-4 bg-gradient-to-r from-amber-300/10 via-yellow-200/30 to-amber-300/10 blur-xl rounded-full" />
              </div>
              <div className="mt-8 text-sm font-semibold text-amber-400">Champion</div>
            </motion.div>
            {/* Third */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center w-24 md:w-36"
            >
              <div className="relative w-full">
                <div className={`h-24 md:h-32 rounded-t-xl rounded-b-sm bg-gradient-to-br ${getCardStyles(3).gradient} ${getCardStyles(3).glow} flex flex-col items-center justify-end pb-2 ring-2 ${getCardStyles(3).ring}`}> 
                  <Award className={`w-6 h-6 mb-1 ${getCardStyles(3).icon}`} />
                  <span className="text-[11px] md:text-sm font-semibold text-white px-2 text-center line-clamp-2">{topThree[2].name}</span>
                  <span className="text-[10px] md:text-xs text-zinc-200/70">{topThree[2].points} pts</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-white/10 via-white/30 to-white/10 blur-sm rounded-full" />
              </div>
              <div className="mt-5 text-sm font-medium text-zinc-400">3rd</div>
            </motion.div>
          </div>
        </motion.div>
      )}
  {viewMode==='cards' && !showPodium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-12 max-w-3xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-yellow-600/10 backdrop-blur-sm p-6 text-center">
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(253,224,71,0.15),transparent_60%)]" />
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Standings Locked</h2>
            <p className="text-sm md:text-base text-amber-200/80 max-w-xl mx-auto">
              The final podium will be revealed soon.
            </p>
          </div>
        </motion.div>
      )}

      {viewMode==='cards' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence mode="wait">
          {displayDepartments.map((dept, index) => {
            const styles = getCardStyles(dept.rank)
            return (
              <motion.div
                key={dept.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ 
                  opacity: animateCards ? 1 : 0, 
                  y: animateCards ? 0 : 50,
                  scale: 1
                }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${styles.gradient} p-1 ${styles.glow} ring-1 ${styles.ring} transition-all duration-300`}
                onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
              >

                {/* Rank Badge and decorative SVGs removed for cleaner design */}

                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 md:p-6 h-full relative overflow-hidden">
                  {/* subtle ambient gradient */}
                  <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
                  {/* Department Header */}
                  <div className="relative mb-3 pr-10 min-h-[54px] flex flex-col justify-start">
                    <h3 className="text-lg md:text-xl font-bold text-white leading-tight break-words">
                      {dept.name}
                    </h3>
                    {/* Achievements and SVGs removed */}
                  </div>

                  {/* Points & Rank progress */}
                  <div className="relative mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {dept.points.toLocaleString()}<span className="text-sm text-zinc-400 ml-1">pts</span>
                      {(dept as any)._prevPoints !== undefined && (dept as any)._prevPoints !== dept.points && (
                        <motion.span
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${(dept.points - (dept as any)._prevPoints) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {(dept.points - (dept as any)._prevPoints) > 0 ? `+${dept.points - (dept as any)._prevPoints}` : (dept.points - (dept as any)._prevPoints)}
                        </motion.span>
                      )}
                    </div>
                    {/* Animated bar versus leader */}
                    <div className="mt-3 h-2 w-full rounded-full bg-zinc-800/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5,(dept.points / (sortedData[0]?.points || 1))*100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                      />
                    </div>
                  </div>

                  {/* Podium stats */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="text-center p-2 rounded-md bg-white/80 text-black shadow-inner">
                      <div className="text-base font-bold text-amber-600">{dept.firstPlaces}</div>
                      <div className="text-[10px] font-medium text-black/70">1st</div>
                    </div>
                    <div className="text-center p-2 rounded-md bg-white/80 text-black shadow-inner">
                      <div className="text-base font-bold text-zinc-700">{dept.secondPlaces}</div>
                      <div className="text-[10px] font-medium text-black/70">2nd</div>
                    </div>
                    <div className="text-center p-2 rounded-md bg-white/80 text-black shadow-inner">
                      <div className="text-base font-bold text-orange-600">{dept.thirdPlaces}</div>
                      <div className="text-[10px] font-medium text-black/70">3rd</div>
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide bg-white/75 rounded px-2 py-1 text-black">
                      <span className="font-medium text-black/70">Events</span>
                      <span className="font-semibold">{dept.totalEvents}</span>
                    </div>
                    {/* Achievements entry removed */}
                  </div>

                  {/* Expand Indicator */}
                  <div className="relative flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-#1a1a8c">
                      {/* SVGs removed */}
                      <span>{selectedDept === dept.id ? 'Hide Details' : 'View Details'}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedDept === dept.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                      >
                        {/* Recent Wins */}
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-white mb-2">Recent Wins</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto custom-scroll">
                            {dept.winners.slice(0, 5).map((winner) => (
                              <div key={winner.id} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-300 truncate">{winner.event.name}</span>
                                <span className={`px-2 py-1 rounded ${
                                  winner.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                  winner.position === 2 ? 'bg-gray-400/20 text-gray-300' :
                                  'bg-amber-600/20 text-amber-400'
                                }`}>
                                  {winner.position === 1 ? '1st' : winner.position === 2 ? '2nd' : '3rd'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Achievements removed */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>) }

  {/* Stats Summary (always visible) */}
  <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 grid grid-cols-3 gap-3 p-4 md:p-5 rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/60 text-center"
      >
        <div>
          <div className="text-xl md:text-2xl font-bold text-white leading-tight">{data.length}</div>
          <div className="text-[11px] md:text-xs text-zinc-400 uppercase tracking-wide">Departments</div>
        </div>
        <div>
          <div className="text-xl md:text-2xl font-bold text-white leading-tight">
            {data.reduce((sum, d) => sum + d.totalEvents, 0)}
          </div>
            <div className="text-[11px] md:text-xs text-zinc-400 uppercase tracking-wide">Total Events</div>
        </div>
        <div>
          <div className="text-xl md:text-2xl font-bold text-white leading-tight">
            {Math.max(...data.map(d => d.points)).toLocaleString()}
          </div>
          <div className="text-[11px] md:text-xs text-zinc-400 uppercase tracking-wide">High Score</div>
        </div>
      </motion.div>

      {/* Refresh Loading Overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-zinc-900/90 p-6 rounded-2xl flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-white">Refreshing leaderboard...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  )
}