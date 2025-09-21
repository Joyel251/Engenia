"use client"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"
import { X, Calendar, Trophy, Users, MapPin, ChevronDown, ChevronsDown } from "lucide-react"
import TiltedCard from "./TiltedCard"

interface Event {
  id: string
  name: string
  status: "UPCOMING" | "ONGOING" | "COMPLETED"
  division: "ONSTAGE" | "OFFSTAGE"
  type: string
  date: string
  guidelines: string
  points: { [key: string]: number }
  winners: Array<{
    id: string
    deptId: string
    position: number
    studentName: string
    department: { id: string; name: string; points: number }
  }>
}

interface EventPopupProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  /** If true, shifts the close button left/down to avoid overlapping BubbleMenu at top-right */
  offsetForBubbleMenu?: boolean
}

const statusColors = {
  UPCOMING: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  ONGOING: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  COMPLETED: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
}

const statusTextColors = {
  UPCOMING: "text-blue-400",
  ONGOING: "text-green-400",
  COMPLETED: "text-purple-400",
}

export default function EventPopup({ event, isOpen, onClose, offsetForBubbleMenu = true }: EventPopupProps) {
  if (!event) return null
  const [activeTab, setActiveTab] = useState<'details' | 'winners'>('details')
  const [scrolled, setScrolled] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventImage = () => {
    return `/${event.id}.jpg`
  }

  const onScrollHandler = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    
    setScrolled(scrollTop > 10)
    
    const progress = scrollTop / (scrollHeight - clientHeight)
    setScrollProgress(Math.min(progress, 1))
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const scrollContainer = document.querySelector('.scroll-container')
        if (scrollContainer) {
          const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight
          setShowScrollIndicator(isScrollable)
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isOpen, activeTab])

  useEffect(() => {
    if (scrolled) {
      const timer = setTimeout(() => {
        setShowScrollIndicator(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [scrolled])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 1 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative w-full max-w-4xl max-h-screen overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-gradient-to-br from-zinc-900/95 to-black/95 border border-zinc-800/50 backdrop-blur-xl flex flex-col sm:flex-row"
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragElastic={0.2}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e: any, info: any) => {
              if (info?.offset?.y > 140 || info?.velocity?.y > 800) onClose()
            }}
          >
            {/* Grab handle (mobile only) */}
            <div className="sm:hidden flex items-center justify-center pt-2 pb-1">
              <div className="h-1 w-16 rounded-full bg-zinc-600/60" />
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className={[
                'hidden sm:flex absolute z-[1110] w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors items-center justify-center',
                offsetForBubbleMenu
                  ? 'top-6 right-[5.5rem] md:right-[6.5rem] lg:right-[7rem]'
                  : 'top-4 right-4'
              ].join(' ')}
              style={offsetForBubbleMenu ? { backdropFilter: 'blur(6px)' } : undefined}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Mobile Close Button */}
            <motion.button
              onClick={onClose}
              className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1110] bg-gradient-to-r from-zinc-800/95 to-zinc-700/95 hover:from-zinc-700/95 hover:to-zinc-600/95 transition-all rounded-full backdrop-blur-lg border border-zinc-600/30 shadow-lg flex items-center justify-center gap-2"
              animate={{
                padding: scrolled ? '14px 24px' : '10px 20px',
                scale: scrolled ? 1.05 : 1,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              aria-label="Close modal"
            >
              <motion.div
                animate={{
                  rotate: scrolled ? 180 : 0,
                  opacity: !scrolled ? [1, 0.3, 1] : 1,
                }}
                transition={{ 
                  rotate: { type: 'spring', stiffness: 300, damping: 25 },
                  opacity: !scrolled ? { 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  } : { duration: 0.3 }
                }}
              >
                <ChevronDown className={`text-zinc-200 transition-all ${scrolled ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </motion.div>
              <span className={`text-zinc-200 font-semibold transition-all ${scrolled ? 'text-base' : 'text-sm'}`}>
                {scrolled ? 'Close' : 'Close'}
              </span>
              {scrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-1 h-1 rounded-full bg-zinc-400"
                />
              )}
            </motion.button>

            {/* Left Side - Event Image */}
            <div className="w-full sm:w-1/2 p-3 sm:p-6 flex items-center justify-center">
              <TiltedCard
                imageSrc={getEventImage()}
                altText={`${event.name} event image`}
                captionText={event.name}
                containerHeight="250px"
                containerWidth="100%"
                imageHeight="250px"
                imageWidth="250px"
                rotateAmplitude={8}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-[15px] flex items-end p-4">
                    <div className="text-white">
                      <div
                        className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-2 bg-gradient-to-r ${statusColors[event.status]}`}
                      >
                        {event.status}
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">{event.name}</h3>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Right Side - Event Details */}
            <div className="w-full sm:w-1/2 relative">
              {/* Desktop Double Arrow Scroll Indicator */}
              <AnimatePresence>
                {showScrollIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex-col items-center"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, 8, 0],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="flex flex-col items-center"
                    >
                      <ChevronsDown className="w-6 h-6 text-zinc-400/80" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scroll Progress Indicator */}
              <motion.div
                className="hidden sm:block absolute right-1 top-4 bottom-4 w-1 bg-zinc-800/30 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrolled ? 0.6 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-full bg-gradient-to-b from-blue-400 to-purple-400 rounded-full origin-top"
                  style={{ height: `${scrollProgress * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </motion.div>

              <div
                className="scroll-container p-3 sm:p-6 overflow-y-auto max-h-[70vh] space-y-6 pb-24 sm:pb-6"
                onScroll={onScrollHandler}
                tabIndex={0}
              >
                {/* Header */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${statusColors[event.status]} ${statusTextColors[event.status]}`}
                    >
                      {event.status}
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-zinc-800/50 text-zinc-300">
                      {event.division}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
                  <p className="text-base text-zinc-400">{event.type}</p>
                </div>

                {/* Mobile Tabs (Details | Winners) when winners exist */}
                {event.winners.length > 0 && (
                  <div className="sm:hidden">
                    <div className="relative flex bg-zinc-800/40 p-1 rounded-lg border border-zinc-700/40">
                      {(['details', 'winners'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-3 text-base font-semibold rounded-md transition-colors ${
                            activeTab === tab ? 'text-white' : 'text-zinc-400'
                          }`}
                          aria-selected={activeTab === tab}
                          role="tab"
                        >
                          {tab === 'details' ? 'Details' : 'Winners'}
                        </button>
                      ))}
                      <motion.span
                        layout
                        className="absolute top-1 bottom-1 w-1/2 rounded-md bg-zinc-700/40"
                        style={{ left: activeTab === 'details' ? '0.25rem' : 'calc(50% + 0.25rem)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}

                {/* Event Info */}
                {(activeTab === 'details' || event.winners.length === 0) && (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
                        <Calendar className="w-6 h-6 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-400">Date & Time</p>
                          <p className="text-sm font-medium text-white break-words">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
                        <MapPin className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-zinc-400">Division</p>
                          <p className="text-sm font-medium text-white">{event.division}</p>
                        </div>
                      </div>
                    </div>

                    {/* Points System */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-6 h-6 text-amber-400" />
                        <h3 className="font-semibold text-lg text-white">Points System</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {(["1", "2", "3"] as const)
                          .filter(p => event.points[p] !== undefined)
                          .map(position => {
                            const points = event.points[position]
                            return (
                              <div key={position} className="text-center p-3 rounded bg-zinc-800/30">
                                <div className="text-xl font-bold text-amber-400">{points}</div>
                                <div className="text-sm text-zinc-400">
                                  {position === "1" ? "1st" : position === "2" ? "2nd" : "3rd"} Place
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    {/* Guidelines with scroll indicator */}
                    <div className="relative p-4 rounded-lg bg-zinc-800/30">
                      <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-3">
                        <Users className="w-6 h-6 text-cyan-400" />
                        Guidelines & Rules
                      </h3>
                      <div className="relative space-y-3 max-h-40 overflow-y-auto custom-scroll pr-2">
                        {event.guidelines.split("\n").map((guideline, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                            <p className="text-sm text-zinc-300">{guideline}</p>
                          </div>
                        ))}
                        {/* Bottom fade overlay */}
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-800/90 to-transparent rounded-b-lg" />
                        {/* Animated double down arrow */}
                        <motion.div
                          className="absolute bottom-2 right-2"
                          animate={{ y: [0, 8, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          aria-hidden="true"
                        >
                          <ChevronsDown className="w-5 h-5 text-cyan-400/80" />
                        </motion.div>
                      </div>
                    </div>
                  </>
                )}

                {/* Winners */}
                {event.winners.length > 0 && (activeTab === 'winners' || (typeof window !== 'undefined' && window.innerWidth >= 640)) && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <h3 className="font-semibold text-lg text-white mb-4">🏆 Winners</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scroll pr-2">
                      {event.winners.map(winner => {
                        const lowerType = event.type.toLowerCase()
                        const isIndividual = lowerType.includes('individual') || lowerType.includes('solo')
                        const isTeam = lowerType.includes('team') || lowerType.includes('group')
                        const primaryName = isIndividual ? winner.studentName : winner.department.name
                        const secondary = isIndividual && !isTeam ? winner.department.name : undefined
                        const positionText = winner.position === 1 ? "1st" : winner.position === 2 ? "2nd" : winner.position === 3 ? "3rd" : `#${winner.position}`
                        return (
                          <div key={winner.id} className="flex items-center justify-between p-3 rounded bg-zinc-800/30">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-base text-white truncate">
                                {primaryName}
                              </p>
                              {secondary && (
                                <p className="text-sm text-zinc-400 truncate">{secondary}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <div className="text-sm font-bold text-purple-400">{positionText}</div>
                              <div className="text-sm text-zinc-400">
                                {(event.points?.[winner.position.toString()] ?? 0)} pts
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
