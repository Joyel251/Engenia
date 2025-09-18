"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Clock, Calendar, Bell, ChevronDown, ChevronUp } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface AnnouncementsListProps {
  announcements: Announcement[]
}

export default function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(6)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const isNew = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    return diffHours < 24
  }

  const visibleAnnouncements = announcements.slice(0, visibleCount)
  const hasMore = announcements.length > visibleCount

  if (!mounted) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {visibleAnnouncements.map((announcement, index) => {
          const isExpanded = expandedIds.has(announcement.id)
          const contentPreview = announcement.content.length > 150 
            ? announcement.content.substring(0, 150) + "..."
            : announcement.content

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.95,
                transition: { duration: 0.2 }
              }}
              transition={{ 
                delay: index * 0.08, // Slightly faster stagger for better UX
                duration: 0.5,
                type: "spring",
                stiffness: 120,
                damping: 20
              }}
              layout
              layoutId={`announcement-${announcement.id}`}
              className="relative group"
              whileHover={{ 
                y: -2,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            >
              {/* Background glow for new announcements */}
              {isNew(announcement.createdAt) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl"
                />
              )}
              
              <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                isNew(announcement.createdAt)
                  ? 'border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-black/90 hover:shadow-blue-500/10'
                  : 'border-zinc-800/60 bg-gradient-to-br from-zinc-900/50 to-black/90 hover:border-zinc-700/60'
              } backdrop-blur-sm group-hover:shadow-2xl group-hover:scale-[1.01] md:group-hover:scale-[1.02]`}>
                
                {/* New badge */}
                {isNew(announcement.createdAt) && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                      <Bell className="w-3 h-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-300">New</span>
                    </div>
                  </motion.div>
                )}

                <div className="p-4 md:p-6 lg:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                      <motion.h2 
                        className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-100 transition-colors"
                        layoutId={`title-${announcement.id}`}
                      >
                        {announcement.title}
                      </motion.h2>
                      
                      <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{formatTime(announcement.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <motion.div
                      layout="position"
                      className="text-zinc-300 leading-relaxed text-sm md:text-base"
                    >
                      {isExpanded ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="whitespace-pre-wrap"
                        >
                          {announcement.content}
                        </motion.div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {contentPreview}
                        </div>
                      )}
                    </motion.div>

                    {/* Expand/Collapse Button */}
                    {announcement.content.length > 150 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleExpanded(announcement.id)}
                        className="mt-3 md:mt-4 flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white text-xs md:text-sm font-medium transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600/50 active:scale-95"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Read More
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Updated indicator */}
                  {announcement.updatedAt !== announcement.createdAt && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/60">
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {formatDate(announcement.updatedAt)} at {formatTime(announcement.updatedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4 md:pt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-6 md:px-8 py-3 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white font-medium border border-zinc-700 hover:border-zinc-600 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base active:scale-90"
          >
            Load More ({announcements.length - visibleCount} remaining)
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}