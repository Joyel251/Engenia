import { supabaseAdmin, TABLES } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    const { data: achievement, error } = await supabaseAdmin
      .from(TABLES.ACHIEVEMENTS)
      .select(`
        *,
        department:Department(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(achievement), { status: 200 });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { deptId, badgeName } = body;

    const { data: updatedAchievement, error } = await supabaseAdmin
      .from(TABLES.ACHIEVEMENTS)
      .update({ deptId, badgeName })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(updatedAchievement), { status: 200 });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    const { error } = await supabaseAdmin
      .from(TABLES.ACHIEVEMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
