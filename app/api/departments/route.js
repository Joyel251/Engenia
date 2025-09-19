import { supabaseAdmin, TABLES } from '../../../lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    // Get departments with achievements and winners
    const { data: departments, error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .select(`
        *,
        achievements:Achievement(*),
        winners:Winner(
          *,
          event:Event(*)
        )
      `)
      .order('points', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(departments), { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, points } = body;
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
    }

    // Generate explicit id to satisfy TEXT PK without default
    const id = randomUUID();

    const { data: newDept, error } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .insert({ id, name, points: points || 0 })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(newDept), { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
