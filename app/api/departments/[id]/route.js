import { supabaseAdmin, TABLES } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    const { data: dept, error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .select(`
        *,
        achievements:Achievement(*),
        winners:Winner(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(dept), { status: 200 });
  } catch (error) {
    console.error('Error fetching department:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, points } = body;

    const { data: updatedDept, error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .update({ name, points })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(updatedDept), { status: 200 });
  } catch (error) {
    console.error('Error updating department:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    const { error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting department:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
