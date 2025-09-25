import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Adding launched column to Settings table...')
    
    // First, check current state
    const { data: beforeData } = await supabaseAdmin
      .from('Settings')
      .select('*')
      .single()
    
    console.log('Before adding column:', beforeData)

    // Try to update the existing row to add the launched field
    // Supabase should automatically add the column if it doesn't exist when we insert/update
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('Settings')
      .update({ launched: false }) // Add the new column with default value
      .eq('id', '1')
      .select('*')
      .single()

    if (updateError) {
      console.error('Failed to add launched column via update:', updateError)
      
      // Alternative approach: try inserting with upsert
      const { data: upsertData, error: upsertError } = await supabaseAdmin
        .from('Settings')
        .upsert(
          { 
            id: '1', 
            leaderboardVisible: beforeData?.leaderboardVisible ?? true,
            lockdown: beforeData?.lockdown ?? false,
            showPodium: beforeData?.showPodium ?? false,
            launched: false 
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (upsertError) {
        return NextResponse.json({
          error: 'Failed to add launched column',
          details: { updateError, upsertError },
          message: 'You need to manually add the launched column in Supabase SQL editor',
          sql_command: `ALTER TABLE public."Settings" ADD COLUMN launched BOOLEAN DEFAULT false;`
        }, { status: 500 })
      }

      return NextResponse.json({
        message: 'launched column added successfully via upsert',
        before: beforeData,
        after: upsertData,
        success: true
      })
    }

    return NextResponse.json({
      message: 'launched column added successfully via update',
      before: beforeData,
      after: updatedData,
      success: true
    })

  } catch (e) {
    console.error('Add launched column error:', e)
    return NextResponse.json({ 
      error: 'Failed to add launched column', 
      details: e,
      message: 'You need to manually add the launched column in Supabase',
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Open the SQL Editor',
        '3. Run: ALTER TABLE public."Settings" ADD COLUMN launched BOOLEAN DEFAULT false;',
        '4. Test the API again'
      ]
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to add the launched column',
    instructions: [
      'Send a POST request to this endpoint to add the launched column',
      'Or manually run in Supabase SQL editor:',
      'ALTER TABLE public."Settings" ADD COLUMN launched BOOLEAN DEFAULT false;'
    ]
  })
}