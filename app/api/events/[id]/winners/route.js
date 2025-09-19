import { supabaseAdmin, TABLES } from '../../../../../lib/supabase';

// ✅ Get all winners for a specific event
export async function GET(req, { params }) {
  try {
    const { id } = params; // eventId

    const { data: event, error: eventError } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select(`
        *,
        winners:Winner(
          *,
          department:Department(*)
        )
      `)
      .eq('id', id)
      .single();

    if (eventError && eventError.code === 'PGRST116') {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    if (eventError) throw eventError;

    // Sort winners by position (1st → 2nd → 3rd)
    const sortedWinners = event.winners.sort((a, b) => a.position - b.position);

    return new Response(JSON.stringify(sortedWinners), { status: 200 });
  } catch (error) {
    console.error('Error fetching event winners:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
