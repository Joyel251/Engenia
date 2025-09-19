"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Trophy, 
  Users, 
  Settings, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  Save,
  X,
  Megaphone,
  Send,
  Lock,
  Unlock,
  RotateCcw,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface Settings {
  id: string
  leaderboardVisible: boolean
  lockdown: boolean
  showPodium: boolean
}

interface Settings {
  id: string
  leaderboardVisible: boolean
  lockdown: boolean
}

interface Event {
  id: string
  name: string
  status: string
  division: string
  type: string
  date: string
  points: Record<string, number>
}

interface Department {
  id: string
  name: string
}

interface Winner {
  id: string
  position: number
  studentName: string | null
  eventId: string
  deptId: string
  department: Department
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWinnerLoading, setIsWinnerLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('events')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Winner form state
  const [winnerForm, setWinnerForm] = useState({
    position: 1,
    studentName: '',
    deptId: ''
  })

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  })
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/nirvakixypss')
      return
    }
    setIsAuthenticated(true)
    fetchInitialData()
  }, [router])

  const fetchInitialData = async () => {
    try {
      // Fetch events, departments, announcements, and settings
      const [eventsRes, deptsRes, announcementsRes, settingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/departments'),
        fetch('/api/announcements'),
        fetch('/api/settings')
      ])

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
      }

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json()
        setDepartments(deptsData)
      }

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData)
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        // Settings API now returns default settings if none exist
        setSettings(settingsData?.[0] || { id: '1', leaderboardVisible: true, lockdown: false, showPodium: false })
      } else {
        // Fallback default settings
        setSettings({ id: '1', leaderboardVisible: true, lockdown: false, showPodium: false })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEventWinners = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/winners`)
      if (response.ok) {
        const winnersData = await response.json()
        setWinners(winnersData)
      }
    } catch (error) {
      console.error('Error fetching winners:', error)
    }
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    fetchEventWinners(event.id)
    setActiveTab('winners')
  }

  const handleAddWinner = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEvent || !winnerForm.deptId) {
      toast.error('Please select an event and department')
      return
    }

    setIsWinnerLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/winners', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          position: winnerForm.position,
          studentName: winnerForm.studentName || null,
          deptId: winnerForm.deptId
        })
      })

      if (response.ok) {
        toast.success('Winner added successfully!')
        fetchEventWinners(selectedEvent.id)
        // Refresh events list to update status
        fetchInitialData()
        setWinnerForm({ position: 1, studentName: '', deptId: '' })
      } else {
        const error = await response.json()
        if (error.error?.includes('position')) {
          toast.error('This position is already taken!')
        } else if (error.error?.includes('department')) {
          toast.error('This department already has a winner!')
        } else {
          toast.error(error.error || 'Failed to add winner')
        }
      }
    } catch (error) {
      console.error('Error adding winner:', error)
      toast.error('Network error')
    } finally {
      setIsWinnerLoading(false)
    }
  }

  const handleDeleteWinner = async (winnerId: string) => {
    if (!confirm('Are you sure you want to delete this winner?')) return

    setIsWinnerLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/winners/${winnerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Winner deleted successfully!')
        if (selectedEvent) {
          fetchEventWinners(selectedEvent.id)
        }
        // Refresh events list to update status
        fetchInitialData()
      } else {
        toast.error('Failed to delete winner')
      }
    } catch (error) {
      console.error('Error deleting winner:', error)
      toast.error('Network error')
    } finally {
      setIsWinnerLoading(false)
    }
  }

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...settings,
          ...newSettings
        })
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast.success('Settings updated successfully!')
      } else {
        toast.error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to reset this event? This will delete all winners and reset the event status to ONGOING.')) return

    setIsWinnerLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      
      // Delete all winners for this event
      const winnersResponse = await fetch(`/api/events/${eventId}/winners`)
      if (winnersResponse.ok) {
        const winnersData = await winnersResponse.json()
        for (const winner of winnersData) {
          await fetch(`/api/winners/${winner.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        }
      }

      // Reset event status
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'ONGOING' })
      })

      toast.success('Event reset successfully!')
      fetchInitialData()
      if (selectedEvent) {
        fetchEventWinners(selectedEvent.id)
      }
    } catch (error) {
      console.error('Error resetting event:', error)
      toast.error('Failed to reset event')
    } finally {
      setIsWinnerLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/nirvakixypss')
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: announcementForm.title.trim(),
          content: announcementForm.content.trim()
        })
      })

      if (response.ok) {
        toast.success('Announcement created successfully!')
        setAnnouncementForm({ title: '', content: '' })
        fetchInitialData() // Refresh announcements
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create announcement')
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Announcement deleted successfully!')
        fetchInitialData() // Refresh announcements
      } else {
        toast.error('Failed to delete announcement')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-white">Admin Panel</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Engenia 2K25 Management</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Settings Controls */}
              {settings && (
                <div className="space-y-3 sm:space-y-0">
                  {/* Mobile: Section Headers */}
                  <div className="block sm:hidden">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">System Controls</h3>
                  </div>
                  
                  {/* Leaderboard Controls */}
                  <div className="bg-slate-700/30 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                    <div className="block sm:hidden mb-2">
                      <span className="text-xs text-slate-400">Leaderboard Management</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                      <button
                        onClick={() => handleUpdateSettings({ lockdown: !settings.lockdown })}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2.5 sm:py-2 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          settings.lockdown 
                            ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500/50' 
                            : 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-500/50'
                        }`}
                        title={settings.lockdown ? 'Unlock leaderboard - Allow students to see rankings' : 'Lock leaderboard - Hide rankings from students'}
                      >
                        {settings.lockdown ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span className="font-medium">
                          {settings.lockdown ? 'Unlock Leaderboard' : 'Lock Leaderboard'}
                        </span>
                        {isSubmitting && (
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent ml-1"></div>
                        )}
                      </button>
                      
                      {/* Removed Show/Hide Leaderboard control; lock controls suffice */}
                    </div>
                  </div>
                  
                  {/* Podium Controls */}
                  <div className="bg-slate-700/30 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                    <div className="block sm:hidden mb-2">
                      <span className="text-xs text-slate-400">Podium Management</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleUpdateSettings({ showPodium: !settings.showPodium })}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center sm:justify-start space-x-2 px-3 py-2.5 sm:py-2 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          settings.showPodium 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-500/50' 
                            : 'bg-slate-600 hover:bg-slate-700 text-white border-2 border-slate-500/50'
                        }`}
                        title={settings.showPodium ? 'Hide podium - Students see regular list' : 'Show podium - Students see top 3 podium display'}
                      >
                        {settings.showPodium ? (
                          <>
                            <Trophy className="w-4 h-4" />
                            <span className="font-medium">Hide Podium</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span className="font-medium">Show Podium</span>
                          </>
                        )}
                        {isSubmitting && (
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent ml-1"></div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Status Indicators (Mobile) */}
              {settings && (
                <div className="block sm:hidden bg-slate-700/20 rounded-lg p-3 border border-slate-600/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Current Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        settings.lockdown ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-slate-400">
                        Leaderboard: <span className={settings.lockdown ? 'text-red-400' : 'text-green-400'}>
                          {settings.lockdown ? 'Locked' : 'Open'}
                        </span>
                      </span>
                    </div>
                    {/* Removed page visibility indicator */}
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        settings.showPodium ? 'bg-yellow-500' : 'bg-slate-500'
                      }`}></div>
                      <span className="text-slate-400">
                        Podium: <span className={settings.showPodium ? 'text-yellow-400' : 'text-slate-400'}>
                          {settings.showPodium ? 'Shown' : 'Hidden'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium border-2 border-red-500/50 w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Events Panel */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                Events
              </h2>
              <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEvent?.id === event.id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <h3 className="font-medium text-white text-sm">{event.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        event.status === 'ONGOING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {event.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 hidden sm:inline">{event.division}</span>
                        {event.status === 'COMPLETED' && (
                          <Trophy className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            {/* Tab Navigation */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 mb-4 sm:mb-6">
              <div className="flex border-b border-slate-700 overflow-x-auto">
                {!selectedEvent && (
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'events'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Event Management</span>
                    <span className="xs:hidden">Events</span>
                  </button>
                )}
                {!selectedEvent && (
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'announcements'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Megaphone className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Announcements</span>
                    <span className="sm:hidden">News</span>
                  </button>
                )}
                {selectedEvent && (
                  <button
                    onClick={() => setActiveTab('winners')}
                    className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'winners'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span className="truncate max-w-[200px] sm:max-w-none">
                      <span className="hidden sm:inline">Manage Winners - </span>{selectedEvent.name}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {selectedEvent ? (
              /* Winner Management for Selected Event */
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h2 className="text-lg sm:text-xl font-semibold text-white truncate">{selectedEvent.name}</h2>
                      {selectedEvent.status === 'COMPLETED' && (
                        <span className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-medium w-fit">
                          <Trophy className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span>Event Completed</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{selectedEvent.division} • {selectedEvent.status}</p>
                  </div>
                  <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                    {/* Reset Event Button */}
                    <button
                      onClick={() => handleResetEvent(selectedEvent.id)}
                      disabled={isWinnerLoading}
                      className="group flex items-center justify-center w-9 h-9 rounded-full bg-slate-700/50 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 border border-slate-600/50 hover:border-orange-500/30 transition-all duration-200 hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reset event - removes all winners and sets status to ONGOING"
                    >
                      <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedEvent(null)
                        setActiveTab('events')
                      }}
                      className="group flex items-center justify-center w-9 h-9 rounded-full bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-600/50 hover:border-red-500/30 transition-all duration-200 hover:scale-105 shadow-sm"
                      title="Close event management and return to events list"
                    >
                      <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                  </div>
                </div>

                {/* Add Winner Form */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-white mb-4 flex items-center">
                    <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Add Winner {winners.length >= 3 && (
                      <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Event Complete
                      </span>
                    )}
                  </h3>
                  
                  {winners.length >= 3 ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                      <Trophy className="w-6 sm:w-8 h-6 sm:h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-medium text-sm sm:text-base">All positions filled!</p>
                      <p className="text-green-300 text-xs sm:text-sm">This event has been marked as completed.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddWinner} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Position</label>
                        <select
                          value={winnerForm.position}
                          onChange={(e) => setWinnerForm({...winnerForm, position: Number(e.target.value)})}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[1, 2, 3].map(pos => {
                            const isPositionTaken = winners.some(w => w.position === pos)
                            return (
                              <option key={pos} value={pos} disabled={isPositionTaken}>
                                {pos === 1 ? '1st Place' : pos === 2 ? '2nd Place' : '3rd Place'}
                                {isPositionTaken ? ' (Taken)' : ''}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Department</label>
                        <select
                          value={winnerForm.deptId}
                          onChange={(e) => setWinnerForm({...winnerForm, deptId: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => {
                            const isDeptTaken = winners.some(w => w.department.id === dept.id)
                            return (
                              <option key={dept.id} value={dept.id} disabled={isDeptTaken}>
                                {dept.name} {isDeptTaken ? '(Already has winner)' : ''}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                          <span className="hidden sm:inline">Student Name (Optional)</span>
                          <span className="sm:hidden">Name (Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={winnerForm.studentName}
                          onChange={(e) => setWinnerForm({...winnerForm, studentName: e.target.value})}
                          placeholder="Individual participant name"
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                        <button
                          type="submit"
                          disabled={isWinnerLoading}
                          className="w-full px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center text-sm"
                        >
                          {isWinnerLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              <span className="hidden xs:inline">Adding...</span>
                              <span className="xs:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Add Winner</span>
                              <span className="sm:hidden">Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Winners List */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-4 flex items-center">
                    <Trophy className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Current Winners ({winners.length})
                  </h3>
                  {winners.length > 0 ? (
                    <div className="space-y-3">
                      {winners.map((winner) => (
                        <div key={winner.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                              <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                                winner.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                winner.position === 2 ? 'bg-slate-400/20 text-slate-300' :
                                'bg-amber-600/20 text-amber-400'
                              }`}>
                                {winner.position}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-white text-sm sm:text-base truncate">{winner.department.name}</h4>
                                {winner.studentName && (
                                  <p className="text-xs sm:text-sm text-slate-400 truncate">{winner.studentName}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteWinner(winner.id)}
                              disabled={isWinnerLoading}
                              className="group flex items-center justify-center w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-600/30 hover:border-red-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ml-2 flex-shrink-0"
                              title="Delete this winner"
                            >
                              {isWinnerLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border border-red-400 border-t-transparent"></div>
                              ) : (
                                <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:scale-110 transition-transform duration-200" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-slate-400">
                      <Trophy className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm sm:text-base">No winners added yet for this event</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'events' ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 sm:p-12 text-center">
                <Calendar className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-slate-600 mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Select an Event</h2>
                <p className="text-sm sm:text-base text-slate-400">Choose an event from the {window.innerWidth < 1280 ? 'panel above' : 'left panel'} to manage winners</p>
              </div>
            ) : (
              /* Announcements Tab */
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
                    <Megaphone className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                    Manage Announcements
                  </h2>
                </div>

                {/* Create Announcement Form */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-white mb-4 flex items-center">
                    <Send className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Create New Announcement
                  </h3>
                  
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter announcement title..."
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter announcement content..."
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          Create Announcement
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Announcements List */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-4 flex items-center">
                    <Megaphone className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Current Announcements ({announcements.length})
                  </h3>
                  {announcements.length > 0 ? (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white mb-2 text-sm sm:text-base">{announcement.title}</h4>
                              <p className="text-slate-300 text-xs sm:text-sm mb-3 break-words">{announcement.content}</p>
                              <p className="text-xs text-slate-500">
                                Created: {new Date(announcement.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              disabled={isSubmitting}
                              className="group flex items-center justify-center w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-600/30 hover:border-red-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm sm:ml-3 flex-shrink-0 self-start"
                              title="Delete this announcement"
                            >
                              <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-slate-400">
                      <Megaphone className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm sm:text-base">No announcements created yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}