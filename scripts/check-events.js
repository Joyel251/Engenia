// Check what events are in the database
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
  EVENTS: 'Event',
  WINNERS: 'Winner',
  DEPARTMENTS: 'Department'
}

async function checkDatabase() {
  try {
    console.log('=== CHECKING DATABASE CONTENTS ===\n')
    
    // Check events
    console.log('📅 EVENTS:')
    const { data: events, error: eventsError } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select('*')
      .order('date', { ascending: true })
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError)
    } else {
      console.log(`Found ${events.length} events:`)
      events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.name} (${event.status}) - ${event.division}`)
        console.log(`     ID: ${event.id}`)
        console.log(`     Date: ${event.date}`)
        console.log(`     Type: ${event.type}`)
        console.log(`     Points: ${JSON.stringify(event.points)}`)
        console.log('')
      })
    }
    
    // Check departments
    console.log('\n🏢 DEPARTMENTS:')
    const { data: departments, error: deptsError } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .select('*')
      .order('name', { ascending: true })
    
    if (deptsError) {
      console.error('Error fetching departments:', deptsError)
    } else {
      console.log(`Found ${departments.length} departments:`)
      departments.forEach((dept, index) => {
        console.log(`  ${index + 1}. ${dept.name} (${dept.points} points)`)
      })
    }
    
    // Check winners
    console.log('\n🏆 WINNERS:')
    const { data: winners, error: winnersError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select(`
        *,
        event:Event(name),
        department:Department(name)
      `)
      .order('position', { ascending: true })
    
    if (winnersError) {
      console.error('Error fetching winners:', winnersError)
    } else {
      console.log(`Found ${winners.length} winners:`)
      winners.forEach((winner, index) => {
        console.log(`  ${index + 1}. ${winner.event.name} - Position ${winner.position}`)
        console.log(`     Department: ${winner.department.name}`)
        console.log(`     Student: ${winner.studentName || 'Team Event'}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('Error checking database:', error)
  }
}

// Run the check
checkDatabase()
  .then(() => {
    console.log('Database check complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database check failed:', error)
    process.exit(1)
  })