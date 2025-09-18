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
  Send
} from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
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
      // Fetch events, departments, and announcements
      const [eventsRes, deptsRes, announcementsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/departments'),
        fetch('/api/announcements')
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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
                  <p className="text-sm text-slate-400">Engenia 2K25 Management</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Events
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
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
                        <span className="text-xs text-slate-400">{event.division}</span>
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
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
              <div className="flex border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'events'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Management
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'announcements'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Announcements
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'events' ? (
              selectedEvent ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedEvent.name}</h2>
                      <p className="text-slate-400">{selectedEvent.division} • {selectedEvent.status}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                {/* Add Winner Form */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Winner {winners.length >= 3 && (
                      <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Event Complete
                      </span>
                    )}
                  </h3>
                  
                  {winners.length >= 3 ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                      <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-medium">All positions filled!</p>
                      <p className="text-green-300 text-sm">This event has been marked as completed.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddWinner} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
                        <select
                          value={winnerForm.position}
                          onChange={(e) => setWinnerForm({...winnerForm, position: Number(e.target.value)})}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                        <select
                          value={winnerForm.deptId}
                          onChange={(e) => setWinnerForm({...winnerForm, deptId: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Student Name (Optional)</label>
                        <input
                          type="text"
                          value={winnerForm.studentName}
                          onChange={(e) => setWinnerForm({...winnerForm, studentName: e.target.value})}
                          placeholder="Individual participant name"
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={isWinnerLoading}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                        >
                          {isWinnerLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Add Winner
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Winners List */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Current Winners ({winners.length})
                  </h3>
                  {winners.length > 0 ? (
                    <div className="space-y-3">
                      {winners.map((winner) => (
                        <div key={winner.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                winner.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                winner.position === 2 ? 'bg-slate-400/20 text-slate-300' :
                                'bg-amber-600/20 text-amber-400'
                              }`}>
                                {winner.position}
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{winner.department.name}</h4>
                                {winner.studentName && (
                                  <p className="text-sm text-slate-400">{winner.studentName}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteWinner(winner.id)}
                              disabled={isWinnerLoading}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isWinnerLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No winners added yet for this event</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Select an Event</h2>
                <p className="text-slate-400">Choose an event from the left panel to manage winners</p>
              </div>
            )
            ) : (
              /* Announcements Tab */
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Megaphone className="w-6 h-6 mr-2" />
                    Manage Announcements
                  </h2>
                </div>

                {/* Create Announcement Form */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Create New Announcement
                  </h3>
                  
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter announcement title..."
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter announcement content..."
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Create Announcement
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Announcements List */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Megaphone className="w-5 h-5 mr-2" />
                    Current Announcements ({announcements.length})
                  </h3>
                  {announcements.length > 0 ? (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-2">{announcement.title}</h4>
                              <p className="text-slate-300 text-sm mb-3">{announcement.content}</p>
                              <p className="text-xs text-slate-500">
                                Created: {new Date(announcement.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              disabled={isSubmitting}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No announcements created yet</p>
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