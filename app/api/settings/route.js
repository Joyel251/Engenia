import { supabaseAdmin, TABLES } from '../../../lib/supabase';

// Force dynamic execution and Node.js runtime for Supabase-backed API
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    let { data: settings, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('*');

    if (error) throw error;

    // If no settings exist, create default settings
    if (!settings || settings.length === 0) {
      const defaultSettings = {
        id: '1',
        leaderboardVisible: true,
        lockdown: false,
        showPodium: false
      };
      
      const { data: newSettings, error: insertError } = await supabaseAdmin
        .from(TABLES.SETTINGS)
        .insert([defaultSettings])
        .select();
        
      if (insertError) {
        console.error('Error creating default settings:', insertError);
        // Return default settings even if insert fails
        return new Response(JSON.stringify([defaultSettings]), { status: 200 });
      }
      
      settings = newSettings;
    }

    return new Response(JSON.stringify(settings), { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings on error
    const defaultSettings = [{
      id: '1',
      leaderboardVisible: true,
      lockdown: false,
      showPodium: false
    }];
    return new Response(JSON.stringify(defaultSettings), { status: 200 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { leaderboardVisible, lockdown, showPodium, id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    // First try to update
    let { data: updatedSettings, error } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .update({ 
        leaderboardVisible, 
        lockdown,
        showPodium 
      })
      .eq('id', id)
      .select();

    // If no rows updated (settings don't exist), create them
    if (!updatedSettings || updatedSettings.length === 0) {
      const newSettings = {
        id,
        leaderboardVisible: leaderboardVisible ?? true,
        lockdown: lockdown ?? false,
        showPodium: showPodium ?? false
      };
      
      const { data: insertedSettings, error: insertError } = await supabaseAdmin
        .from(TABLES.SETTINGS)
        .insert([newSettings])
        .select();
        
      if (insertError) throw insertError;
      updatedSettings = insertedSettings;
    }

    if (error) throw error;

    return new Response(JSON.stringify(updatedSettings[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
