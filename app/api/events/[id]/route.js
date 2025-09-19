import { supabaseAdmin, TABLES } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    const { data: event, error } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select(`
        *,
        winners:Winner(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(event), { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, date, status } = body;

    const updateData = {
      name,
      status,
      ...(date && { date: new Date(date).toISOString() })
    };

    const { data: updatedEvent, error } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(updatedEvent), { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    const { error } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
