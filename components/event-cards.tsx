"use client"

import { useState } from "react"
import { motion } from "motion/react"
import TiltedCard from "./TiltedCard"
import EventPopup from "./EventPopup"
import BubbleMenu from "./BubbleMenu"

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

interface EventCardsProps {
  events: Event[]
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

export default function EventCards({ events }: EventCardsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const getEventImage = (event: Event) => {
    return `${event.id}.jpg`
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsPopupOpen(true)
  }

  const closePopup = () => {
    setIsPopupOpen(false)
    setSelectedEvent(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl text-zinc-400 mb-4">No events found</h3>
        <p className="text-zinc-500">Check back later for upcoming events!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" role="list">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            className="group"
            role="listitem"
            initial={{ opacity: 0, y: 18, scale: 0.99 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 4px 32px rgba(0,255,255,0.10)' }}
            whileTap={{ scale: 0.97 }}
            viewport={{ once: false, amount: 0.25, margin: "-40px 0px -40px 0px" }}
            transition={{ duration: 0.28, delay: index * 0.03, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <motion.button
              type="button"
              aria-label={`View details for ${event.name}`}
              onClick={() => handleEventClick(event)}
              className="relative w-full text-left bg-zinc-900/60 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-zinc-800/60 hover:border-zinc-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition-all duration-300 hover:bg-zinc-900/80 disabled:opacity-60 overflow-hidden pointer-events-auto touch-manipulation md:hover:shadow-lg md:hover:shadow-blue-500/10"
              whileTap={{ scale: 0.985 }}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              
              {/* Event Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative inline-flex items-center">
                  {event.status === "ONGOING" && (
                    <span className="absolute -inset-0.5 rounded-full bg-green-500/20 animate-ping" aria-hidden="true" />
                  )}
                  <div className={`relative px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${statusColors[event.status]} backdrop-blur-sm`}>
                    <span className={statusTextColors[event.status]}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  {formatDate(event.date)}
                </div>
              </div>

              {/* Tilted Card */}
              <div className="mb-4 h-56 sm:h-64 pointer-events-none select-none">
                <TiltedCard
                  imageSrc={getEventImage(event)}
                  altText={`${event.name} event image`}
                  captionText=""
                  containerHeight="100%"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  rotateAmplitude={8}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-[15px] flex items-end p-3 md:p-4 pointer-events-none">
                      <div className="text-white w-full">
                        <div className="mb-2">
                          <span className="px-2 py-1 rounded-full text-[10px] md:text-xs font-medium bg-zinc-800/70 text-zinc-200">
                            {event.division}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1" title={event.name}>
                  {event.name}
                </h3>
                <p className="text-zinc-400 text-xs md:text-sm line-clamp-1" title={event.type}>{event.type}</p>
                
                {/* Points Preview */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Points:</span>
                  <div className="flex gap-1">
                    {(["1","2","3"] as const).filter(p => event.points[p] !== undefined).map(position => (
                      <span key={position} className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                        {event.points[position]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Winners Preview */}
                {event.winners.filter(w => w.position <= 3).length > 0 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500 mb-2 block">Winners:</span>
                    <div className="space-y-1">
                      {event.winners
                        .filter(w => w.position <= 3)
                        .sort((a, b) => a.position - b.position)
                        .map((winner) => {
                          const lowerType = event.type.toLowerCase()
                          const isIndividual = lowerType.includes('individual') || lowerType.includes('solo')
                          const displayPrimary = isIndividual ? winner.studentName : winner.department.name
                          const displaySecondary = isIndividual ? winner.department.name : undefined
                          const positionText = winner.position === 1 ? "1st" : winner.position === 2 ? "2nd" : winner.position === 3 ? "3rd" : `#${winner.position}`
                          return (
                            <div key={winner.id} className="flex justify-between items-center text-sm">
                              <div className="flex-1 min-w-0">
                                <span className="text-zinc-300 truncate block" title={displayPrimary}>{displayPrimary}</span>
                                {displaySecondary && <span className="text-[10px] text-zinc-500 truncate block" title={displaySecondary}>{displaySecondary}</span>}
                              </div>
                              <span className="text-purple-400 text-xs ml-2 flex-shrink-0">{positionText}</span>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )}

                <span className="block w-full mt-4 py-2 px-4 bg-white/10 group-hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium text-center pointer-events-none">
                  View Details
                </span>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Event Popup */}
      <EventPopup
        event={selectedEvent}
        isOpen={isPopupOpen}
        onClose={closePopup}
      />
    </>
  )
}
