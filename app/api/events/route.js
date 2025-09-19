import { supabaseAdmin, TABLES } from '../../../lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { data: events, error } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select(`
        *,
        winners:Winner(*)
      `)
      .order('date', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify(events), { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, date, status, division, type, guidelines, points } = body;

    if (!name || !date || !division || !type || !points) {
      return new Response(JSON.stringify({ error: 'name, date, division, type, and points are required' }), { status: 400 });
    }

    // Explicitly generate an ID since Supabase table does not auto-generate for TEXT PK
    const id = randomUUID();

    const { data: newEvent, error } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .insert({
        id,
        name,
        date: new Date(date).toISOString(),
        status: status || 'UPCOMING',
        division,
        type,
        guidelines,
        points,
      })
      .select()
      .single();

    if (error) {
      // Surface Supabase/PostgREST error details to client for easier debugging
      console.error('Supabase error creating event:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Failed to create event',
          details: error.details || undefined,
          hint: error.hint || undefined,
          code: error.code || undefined
        }), 
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(newEvent), { status: 201 });
  } catch (error) {
    console.error('Error creating event (unexpected):', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal Server Error'
      }), 
      { status: 500 }
    );
  }
}
