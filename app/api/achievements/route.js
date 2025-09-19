import { supabaseAdmin, TABLES } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { data: achievements, error } = await supabaseAdmin
      .from(TABLES.ACHIEVEMENTS)
      .select(`
        *,
        department:Department(*)
      `);

    if (error) throw error;

    return new Response(JSON.stringify(achievements), { status: 200 });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { deptId, badgeName } = body;

    if (!deptId || !badgeName) {
      return new Response(JSON.stringify({ error: 'deptId and badgeName required' }), { status: 400 });
    }

    const { data: newAchievement, error } = await supabaseAdmin
      .from(TABLES.ACHIEVEMENTS)
      .insert({ deptId, badgeName })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(newAchievement), { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
