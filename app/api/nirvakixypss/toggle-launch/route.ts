import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    // Get current launch status from database
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('launched')
      .single()
    
    let currentStatus = false
    if (!fetchError && currentData) {
      currentStatus = !!currentData.launched
    }
    
    // Toggle the status
    const newStatus = !currentStatus
    
    // Update in database
    const { data, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .upsert(
        { id: '1', launched: newStatus },
        { onConflict: 'id' }
      )
      .select('launched')
      .single()
    
    if (error) {
      console.error('Failed to toggle launch status:', error)
      return NextResponse.json({ error: 'Failed to toggle launch status' }, { status: 500 })
    }
    
    const launched = !!data.launched
    return NextResponse.json({ 
      launched, 
      message: launched ? 'Website launched' : 'Website locked' 
    }, { status: 200 })
  } catch (e) {
    console.error('Toggle launch status error:', e)
    return NextResponse.json({ error: 'Failed to toggle launch status' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('launched')
      .single()
    
    if (error) {
      return NextResponse.json({ launched: false }, { status: 200 })
    }
    
    return NextResponse.json({ launched: !!data.launched }, { status: 200 })
  } catch (e) {
    console.error('Get launch status error:', e)
    return NextResponse.json({ launched: false }, { status: 200 })
  }
}
