import { supabaseAdmin, TABLES } from '../../../lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { data: winners, error } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select(`
        *,
        event:Event(*),
        department:Department(*)
      `);

    if (error) throw error;

    return new Response(JSON.stringify(winners), { status: 200 });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  // ✅ Authentication is now handled by middleware.js - no need for adminAuth here
  try {
    const body = await req.json();
    const { eventId, deptId, position, studentName } = body;

    if (!eventId || !deptId || !position) {
      return new Response(JSON.stringify({ error: 'eventId, deptId, and position are required' }), { status: 400 });
    }

    // 1️⃣ First, fetch event to get division info
    const { data: event, error: eventError } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    // 2️⃣ Division-based validation
    if (event.division === 'OFFSTAGE') {
      // OFFSTAGE: Check if this specific position is already taken by any department
      const { data: existingPositionWinner, error: positionCheckError } = await supabaseAdmin
        .from(TABLES.WINNERS)
        .select('id')
        .eq('eventId', eventId)
        .eq('position', position)
        .single();

      if (positionCheckError && positionCheckError.code !== 'PGRST116') {
        throw positionCheckError;
      }

      if (existingPositionWinner) {
        return new Response(JSON.stringify({ 
          error: `Position ${position} already has a winner for this event` 
        }), { status: 400 });
      }

      // OFFSTAGE: Also check if this department already won this specific position
      const { data: existingDeptPositionWinner, error: deptPositionCheckError } = await supabaseAdmin
        .from(TABLES.WINNERS)
        .select('id')
        .eq('eventId', eventId)
        .eq('deptId', deptId)
        .eq('position', position)
        .single();

      if (deptPositionCheckError && deptPositionCheckError.code !== 'PGRST116') {
        throw deptPositionCheckError;
      }

      if (existingDeptPositionWinner) {
        return new Response(JSON.stringify({ 
          error: 'This department already won this position' 
        }), { status: 400 });
      }
    } else {
      // ONSTAGE: Check if position already exists for this event
      const { data: existingPositionWinner, error: positionCheckError } = await supabaseAdmin
        .from(TABLES.WINNERS)
        .select('id')
        .eq('eventId', eventId)
        .eq('position', position)
        .single();

      if (positionCheckError && positionCheckError.code !== 'PGRST116') {
        throw positionCheckError;
      }

      if (existingPositionWinner) {
        return new Response(JSON.stringify({ 
          error: `Position ${position} already has a winner for this event` 
        }), { status: 400 });
      }

      // ONSTAGE: Check if department already has ANY winner for this event
      const { data: existingDeptWinner, error: deptCheckError } = await supabaseAdmin
        .from(TABLES.WINNERS)
        .select('id')
        .eq('eventId', eventId)
        .eq('deptId', deptId)
        .single();

      if (deptCheckError && deptCheckError.code !== 'PGRST116') {
        throw deptCheckError;
      }

      if (existingDeptWinner) {
        return new Response(JSON.stringify({ 
          error: 'This department already has a winner for this event' 
        }), { status: 400 });
      }
    }

    // 3️⃣ Get points for the winner based on position
    let pointsForPosition = event.points[position] || 0;

    // 4️⃣ Create winner with explicit UUID
    const winnerId = randomUUID();
    const { data: newWinner, error: winnerError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .insert([{ 
        id: winnerId,
        eventId, 
        deptId, 
        position, 
        studentName: studentName || null 
      }])
      .select(`
        *,
        event:Event(*),
        department:Department(*)
      `)
      .single();

    if (winnerError) throw winnerError;

    // 5️⃣ Update department points
    const { data: dept, error: deptError } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .select('points')
      .eq('id', deptId)
      .single();

    if (deptError) throw deptError;

    const newPoints = Math.max((dept?.points || 0) + pointsForPosition, 0); // no negative points

    const { error: updateError } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .update({ points: newPoints })
      .eq('id', deptId);

    if (updateError) throw updateError;

    // 6️⃣ Check if event now has all 3 winners (1st, 2nd, 3rd) and mark as completed
    const { count: totalWinners, error: countError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select('*', { count: 'exact', head: true })
      .eq('eventId', eventId);

    if (countError) throw countError;

    if (totalWinners >= 3) {
      const { error: eventUpdateError } = await supabaseAdmin
        .from(TABLES.EVENTS)
        .update({ status: 'COMPLETED' })
        .eq('id', eventId);

      if (eventUpdateError) throw eventUpdateError;
    }

    return new Response(JSON.stringify(newWinner), { status: 201 });
  } catch (error) {
    console.error('Error in winners POST:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}