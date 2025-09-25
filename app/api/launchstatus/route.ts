import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('launched')
      .single()
    
    if (error) {
      // If no settings exist, create default with launched: false
      const { data: newSettings, error: insertError } = await supabaseAdmin
        .from(TABLES.SETTINGS)
        .insert([{ id: '1', launched: false, leaderboardVisible: true, lockdown: false, showPodium: false }])
        .select('launched')
        .single()
      
      if (insertError) {
        console.error('Failed to create settings:', insertError)
        return NextResponse.json({ launched: false }, { status: 200 })
      }
      
      return NextResponse.json({ launched: !!newSettings.launched }, { status: 200 })
    }
    
    return NextResponse.json({ launched: !!data.launched }, { status: 200 })
  } catch (e) {
    console.error('Launch status GET error:', e)
    return NextResponse.json({ launched: false }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    let launched = true
    try {
      const body = await request.json().catch(() => null)
      if (body && typeof body.launched === 'boolean') {
        launched = body.launched
      }
    } catch {}
    
    // Update or insert the launch status in database
    const { data, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .upsert(
        { id: '1', launched },
        { onConflict: 'id' }
      )
      .select('launched')
      .single()
    
    if (error) {
      console.error('Failed to update launch status:', error)
      return NextResponse.json({ error: 'Failed to set launch status' }, { status: 500 })
    }
    
    return NextResponse.json({ launched: !!data.launched }, { status: 200 })
  } catch (e) {
    console.error('Launch status POST error:', e)
    return NextResponse.json({ error: 'Failed to set launch status' }, { status: 500 })
  }
}
