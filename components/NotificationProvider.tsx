"use client"

import { useAnnouncementNotifications } from './useAnnouncementNotifications'

export default function NotificationProvider() {
  useAnnouncementNotifications()
  
  // This component renders nothing but provides notification functionality
  return null
}