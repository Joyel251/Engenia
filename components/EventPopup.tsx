"use client"
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { X, Calendar, Trophy, Users, MapPin } from "lucide-react"
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

  const getEventImage = (eventType: string, status: string) => {
    const seed = event.id
    const category = eventType.toLowerCase().includes("tech")
      ? "tech"
      : eventType.toLowerCase().includes("dance")
        ? "people"
        : eventType.toLowerCase().includes("photo")
          ? "nature"
          : eventType.toLowerCase().includes("debate")
            ? "business"
            : eventType.toLowerCase().includes("quiz")
              ? "education"
              : "abstract"
    return `https://picsum.photos/seed/${seed}/400/300?category=${category}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 1 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative w-full max-w-4xl max-h-none sm:max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-gradient-to-br from-zinc-900/95 to-black/95 border border-zinc-800/50 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragElastic={0.2}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e: any, info: any) => {
              if (info?.offset?.y > 140 || info?.velocity?.y > 800) onClose()
            }}
          >
            {/* Grab handle (mobile only) */}
            <div className="sm:hidden flex items-center justify-center pt-2">
              <div className="h-1 w-12 rounded-full bg-zinc-600/60" />
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className={[
                'absolute z-[1110] rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors',
                // Base padding
                'p-3 sm:p-2',
                // Positioning: if offset, push further from top/right to avoid BubbleMenu toggle
                offsetForBubbleMenu
                  ? 'top-3 left-3 sm:top-6 sm:left-auto sm:right-[5.5rem] md:right-[6.5rem] lg:right-[7rem]'
                  : 'top-2 right-2 sm:top-4 sm:right-4'
              ].join(' ')}
              style={offsetForBubbleMenu ? { backdropFilter: 'blur(6px)' } : undefined}
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5 text-zinc-300" />
              <span className="sr-only">Close</span>
            </button>

            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Side - Event Image */}
              <div className="lg:w-1/2 p-3 sm:p-6 flex items-center justify-center">
                <TiltedCard
                  imageSrc={getEventImage(event.type, event.status)}
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
              <div className="lg:w-1/2 p-3 sm:p-6 overflow-y-auto custom-scroll max-h-[75vh] sm:max-h-[70vh]">
                <div className="space-y-4 sm:space-y-6 pb-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                      <div
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r ${statusColors[event.status]} ${statusTextColors[event.status]}`}
                      >
                        {event.status}
                      </div>
                      <div className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-zinc-800/50 text-zinc-300">
                        {event.division}
                      </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{event.name}</h2>
                    <p className="text-sm sm:text-base text-zinc-400">{event.type}</p>
                  </div>

                  {/* Mobile Tabs (Details | Winners) when winners exist */}
                  {event.winners.length > 0 && (
                    <div className="sm:hidden">
                      <div className="relative flex bg-zinc-800/40 p-1 rounded-lg border border-zinc-700/40">
                        {(['details','winners'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 text-sm py-2 rounded-md transition-colors ${activeTab === tab ? 'text-white' : 'text-zinc-400'}`}
                          >
                            {tab === 'details' ? 'Details' : 'Winners'}
                          </button>
                        ))}
                        <motion.span
                          layout
                          className={`absolute top-1 bottom-1 w-1/2 rounded-md bg-zinc-700/40`}
                          style={{ left: activeTab === 'details' ? '0.25rem' : 'calc(50% + 0.25rem)' }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Event Info */}
                  {(activeTab === 'details' || event.winners.length === 0) && (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-400">Date & Time</p>
                        <p className="text-xs sm:text-sm text-white font-medium break-words">
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-400">Division</p>
                        <p className="text-xs sm:text-sm text-white font-medium">{event.division}</p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Points System */}
                  {(activeTab === 'details' || event.winners.length === 0) && (
                  <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      <h3 className="font-semibold text-sm sm:text-base text-white">Points System</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {(["1","2","3"] as const).filter(p => event.points[p] !== undefined).map(position => {
                        const points = event.points[position];
                        return (
                          <div key={position} className="text-center p-2 rounded bg-zinc-800/30">
                            <div className="text-base sm:text-lg font-bold text-amber-400">{points}</div>
                            <div className="text-xs text-zinc-400">
                              {position === "1" ? "1st" : position === "2" ? "2nd" : "3rd"} Place
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  )}

                  {/* Guidelines */}
                  {(activeTab === 'details' || event.winners.length === 0) && (
                  <div className="p-3 sm:p-4 rounded-lg bg-zinc-800/30">
                    <h3 className="font-semibold text-sm sm:text-base text-white mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      Guidelines & Rules
                    </h3>
                    <div className="space-y-2">
                      {event.guidelines.split("\n").map((guideline, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-zinc-300">{guideline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Winners */}
                  {event.winners.length > 0 && (activeTab === 'winners' || typeof window !== 'undefined' && window.innerWidth >= 640) && (
                    <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <h3 className="font-semibold text-sm sm:text-base text-white mb-3">🏆 Winners</h3>
                      <div className="space-y-2">
                        {event.winners.map((winner) => {
                          const lowerType = event.type.toLowerCase()
                          const isIndividual = lowerType.includes('individual') || lowerType.includes('solo')
                          const isTeam = lowerType.includes('team') || lowerType.includes('group')
                          const primaryName = isIndividual ? winner.studentName : winner.department.name
                          const secondary = isIndividual && !isTeam ? winner.department.name : undefined
                          const positionText = winner.position === 1 ? "1st" : winner.position === 2 ? "2nd" : winner.position === 3 ? "3rd" : `#${winner.position}`
                          return (
                            <div key={winner.id} className="flex items-center justify-between p-2 rounded bg-zinc-800/30">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm sm:text-base text-white truncate">
                                  {primaryName}
                                </p>
                                {secondary && (
                                  <p className="text-xs text-zinc-400 truncate">{secondary}</p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-xs sm:text-sm font-bold text-purple-400">{positionText}</div>
                                <div className="text-xs text-zinc-400">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
