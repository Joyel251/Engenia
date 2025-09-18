"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const LAST_CHECK_KEY = 'engenia_last_announcement_check'

export function useAnnouncementNotifications() {
  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkForNewAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements')
        if (!response.ok) return

        const announcements: Announcement[] = await response.json()
        if (announcements.length === 0) return

        const lastCheck = localStorage.getItem(LAST_CHECK_KEY)
        const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 24 * 60 * 60 * 1000) // Default to 24h ago

        const newAnnouncements = announcements.filter(announcement => {
          const announcementTime = new Date(announcement.createdAt)
          return announcementTime > lastCheckTime
        })

        if (newAnnouncements.length > 0) {
          // Show toast for the most recent announcement
          const latest = newAnnouncements[0]
          const preview = latest.content.length > 100 
            ? latest.content.substring(0, 100) + "..." 
            : latest.content

          toast.success('New Announcement!', {
            description: `${latest.title}\n${preview}`,
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/announcements'
              }
            }
          })

          // If multiple new announcements, show a summary toast
          if (newAnnouncements.length > 1) {
            toast.info(`${newAnnouncements.length - 1} more new announcements`, {
              description: 'Check the announcements page for more updates',
              duration: 5000,
              action: {
                label: 'View All',
                onClick: () => {
                  window.location.href = '/announcements'
                }
              }
            })
          }
        }

        // Update last check time
        localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
      } catch (error) {
        console.error('Error checking for new announcements:', error)
      }
    }

    // Check immediately on mount
    checkForNewAnnouncements()

    // Then check every 5 minutes
    interval = setInterval(checkForNewAnnouncements, 5 * 60 * 1000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])
}

// Hook for manual announcement notifications (for admin actions)
export function showAnnouncementToast(type: 'created' | 'updated' | 'deleted', title: string) {
  switch (type) {
    case 'created':
      toast.success('Announcement Created!', {
        description: `"${title}" has been published`,
        duration: 5000
      })
      break
    case 'updated':
      toast.info('Announcement Updated', {
        description: `"${title}" has been modified`,
        duration: 4000
      })
      break
    case 'deleted':
      toast.error('Announcement Deleted', {
        description: `"${title}" has been removed`,
        duration: 4000
      })
      break
  }
}