import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Checking Settings table structure...')
    
    // Try to query the Settings table to see what columns exist
    const { data: settingsData, error: queryError } = await supabaseAdmin
      .from('Settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    console.log('Settings query result:', { settingsData, queryError })

    if (queryError) {
      return NextResponse.json({
        error: 'Settings table query failed',
        details: queryError,
        message: 'The Settings table might not exist or might have permission issues',
        suggestion: 'Please create the Settings table with launched column manually in Supabase'
      }, { status: 500 })
    }

    // Check what columns are available by looking at the returned data structure
    const availableColumns = settingsData ? Object.keys(settingsData) : []
    const hasLaunchedColumn = availableColumns.includes('launched')
    
    console.log('Available columns:', availableColumns)
    console.log('Has launched column:', hasLaunchedColumn)

    return NextResponse.json({
      message: 'Settings table check complete',
      table_exists: true,
      launched_column_exists: hasLaunchedColumn,
      available_columns: availableColumns,
      current_data: settingsData,
      recommendations: hasLaunchedColumn 
        ? ['Settings table is properly configured']
        : ['Need to add launched column to Settings table']
    })

  } catch (e) {
    console.error('Database check error:', e)
    return NextResponse.json({ 
      error: 'Database check failed', 
      details: e,
      message: 'Unexpected error during database check'
    }, { status: 500 })
  }
}
