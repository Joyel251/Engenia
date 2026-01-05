import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (for browser/frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key (for API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database table names (matching your Prisma schema)
export const TABLES = {
  DEPARTMENTS: 'Department',
  EVENTS: 'Event',
  WINNERS: 'Winner',
  ACHIEVEMENTS: 'Achievement',
  ANNOUNCEMENTS: 'Announcement',
  SETTINGS: 'Settings',
  ADMIN: 'Admin',
  PHOTO_GALLERY: 'PhotoGallery', // Updated to match Prisma and Supabase table name
} as const

// Helper types based on your Prisma schema
export interface Department {
  id: string
  name: string
  points: number
}

export interface Event {
  id: string
  name: string
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
  date: string
  division: 'ONSTAGE' | 'OFFSTAGE'
  points: Record<string, any>
  guidelines?: string
  type?: 'INDIVIDUAL' | 'TEAM'
}

export interface Winner {
  id: string
  eventId: string
  deptId: string
  position: number
  studentName?: string
}

export interface Achievement {
  id: string
  deptId: string
  badgeName: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: string
  leaderboardVisible: boolean
  lockdown: boolean
  showPodium: boolean
  launched?: boolean
}

export interface Admin {
  id: string
  username: string
  password: string
}

// Photo Gallery interface - with division support
export interface PhotoGallery {
  id: string;
  driveurl: string;
  created_at: string;
  division?: 'ONSTAGE' | 'OFFSTAGE' | null;
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Get all departments with their points
  async getDepartments() {
    const { data, error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .select('*')
      .order('points', { ascending: false })
    
    if (error) throw error
    return data as Department[]
  },

  // Get all events
  async getEvents() {
    const { data, error } = await supabase
      .from(TABLES.EVENTS)
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  },

  // Get all announcements
  async getAnnouncements() {
    const { data, error } = await supabase
      .from(TABLES.ANNOUNCEMENTS)
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return data as Announcement[]
  },

  // Get all photos from gallery
  async getPhotoGallery() {
    const { data, error } = await supabase
      .from(TABLES.PHOTO_GALLERY)
  .select('id, driveurl, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as PhotoGallery[]
  },

  // Get winners for an event
  async getEventWinners(eventId: string) {
    const { data, error } = await supabase
      .from(TABLES.WINNERS)
      .select(`
        *,
        department:Department(*),
        event:Event(*)
      `)
      .eq('eventId', eventId)
    
    if (error) throw error
    return data
  },

  // Get leaderboard (departments with points)
  async getLeaderboard() {
    const { data, error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .select('*')
      .order('points', { ascending: false })
    
    if (error) throw error
    return data as Department[]
  },
}

// Admin helpers using service role key
export const supabaseAdminHelpers = {
  // Create a new department
  async createDepartment(name: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .insert({ name, points: 0 })
      .select()
      .single()
    
    if (error) throw error
    return data as Department
  },

  // Update department points
  async updateDepartmentPoints(deptId: string, points: number) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .update({ points })
      .eq('id', deptId)
      .select()
      .single()
    
    if (error) throw error
    return data as Department
  },

  // Create a new event
  async createEvent(event: Omit<Event, 'id'>) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .insert(event)
      .select()
      .single()
    
    if (error) throw error
    return data as Event
  },

  // Create a new announcement
  async createAnnouncement(title: string, content: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.ANNOUNCEMENTS)
      .insert({ title, content })
      .select()
      .single()
    
    if (error) throw error
    return data as Announcement
  },

  // Add photo to gallery
  async addPhoto(driveurl: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.PHOTO_GALLERY)
      .insert({ driveurl: driveurl })
      .select()
      .single()
    
    if (error) throw error
    return data as PhotoGallery
  },

  // Get all photos (admin function)
  async getAllPhotos() {
    const { data, error } = await supabaseAdmin
      .from(TABLES.PHOTO_GALLERY)
  .select('id, driveurl, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as PhotoGallery[]
  },

  // Delete photo from gallery
  async deletePhoto(photoId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.PHOTO_GALLERY)
      .delete()
      .eq('id', photoId)
      .select('id, driveurl, created_at')
      .single()
    
    if (error) throw error
    return data as PhotoGallery
  },

  // Add winner
  async addWinner(winner: Omit<Winner, 'id'>) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .insert(winner)
      .select()
      .single()
    
    if (error) throw error
    return data as Winner
  },

  // Get settings
  async getSettings() {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('*')
      .limit(1)
      .single()
    
    if (error) throw error
    return data as Settings
  },

  // Update settings
  async updateSettings(settings: Partial<Omit<Settings, 'id'>>) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .update(settings)
      .select()
      .single()
    
    if (error) throw error
    return data as Settings
  },
}
