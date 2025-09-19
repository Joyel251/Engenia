// Initialize default settings in the database
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const TABLES = {
  SETTINGS: 'Settings',
}

async function initializeSettings() {
  try {
    console.log('Checking existing settings...')
    
    // Check if settings already exist
    const { data: existingSettings, error: checkError } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('*')
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }
    
    if (existingSettings && existingSettings.length > 0) {
      console.log('Settings already exist:', existingSettings[0])
      
      // Update existing settings to include showPodium if missing
      const currentSettings = existingSettings[0]
      if (!currentSettings.hasOwnProperty('showPodium')) {
        const { data: updatedSettings, error: updateError } = await supabaseAdmin
          .from(TABLES.SETTINGS)
          .update({ showPodium: true })
          .eq('id', currentSettings.id)
          .select()
        
        if (updateError) throw updateError
        console.log('Updated settings with showPodium:', updatedSettings[0])
      }
      return
    }
    
    console.log('No settings found, creating default settings...')
    
    // Create default settings
    const defaultSettings = {
      id: '1',
      leaderboardVisible: true,
      lockdown: false,
      showPodium: false // Default to locked/hidden
    }
    
    const { data: newSettings, error: createError } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .insert([defaultSettings])
      .select()
    
    if (createError) throw createError
    
    console.log('Default settings created:', newSettings[0])
    
  } catch (error) {
    console.error('Error initializing settings:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeSettings()
  .then(() => {
    console.log('Settings initialization complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Settings initialization failed:', error)
    process.exit(1)
  })