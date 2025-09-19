// app/api/winners/[id]/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin, TABLES } from "@/lib/supabase";

// 🔹 Helper to safely update department points and prevent negative points
async function updateDepartmentPoints(deptId, change) {
  if (!deptId) return;

  const { data: dept, error: deptError } = await supabaseAdmin
    .from(TABLES.DEPARTMENTS)
    .select('points')
    .eq('id', deptId)
    .single();

  if (deptError || !dept) return;

  // Ensure new points never go below 0
  const currentPoints = Math.max(0, dept.points || 0);
  const newPoints = Math.max(0, currentPoints + change);

  await supabaseAdmin
    .from(TABLES.DEPARTMENTS)
    .update({ points: newPoints })
    .eq('id', deptId);
}

// ✅ Get winner by ID
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const { data: winner, error } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select(`
        *,
        department:Department(*),
        event:Event(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    if (error) throw error;

    return NextResponse.json(winner);
  } catch (error) {
    console.error("Error fetching winner:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Update winner and adjust department points correctly
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  try {
    const { data: existingWinner, error: winnerError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select('*')
      .eq('id', id)
      .single();

    if (winnerError && winnerError.code === 'PGRST116') {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    if (winnerError) throw winnerError;

    const oldDeptId = existingWinner.deptId;
    const oldPosition = existingWinner.position;
    const newDeptId = body.deptId;
    const newPosition = body.position;

    const { data: event, error: eventError } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select('*')
      .eq('id', existingWinner.eventId)
      .single();

    if (eventError) throw eventError;

    if (!event || !event.points) {
      return NextResponse.json({ error: "Event points config missing" }, { status: 400 });
    }

    const oldPoints = event.points[String(oldPosition)] || 0;
    const newPoints = event.points[String(newPosition)] || 0;

    // 🔹 Revert old department points safely
    if (oldDeptId && oldPoints > 0) {
      await updateDepartmentPoints(oldDeptId, -oldPoints);
    }

    // 🔹 Update winner
    const { data: updatedWinner, error: updateError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .update({
        studentName: body.studentName,
        deptId: newDeptId,
        position: newPosition,
      })
      .eq('id', id)
      .select(`
        *,
        department:Department(*),
        event:Event(*)
      `)
      .single();

    if (updateError) throw updateError;

    // 🔹 Add points to new department safely
    if (newDeptId && newPoints > 0) {
      await updateDepartmentPoints(newDeptId, newPoints);
    }

    // 🔹 Mark event as completed
    await supabaseAdmin
      .from(TABLES.EVENTS)
      .update({ status: "COMPLETED" })
      .eq('id', existingWinner.eventId);

    return NextResponse.json(updatedWinner);
  } catch (error) {
    console.error("Error updating winner:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Delete winner and rollback points
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select('*')
      .eq('id', id)
      .single();

    if (winnerError && winnerError.code === 'PGRST116') {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    if (winnerError) throw winnerError;

    const { data: event, error: eventError } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .select('*')
      .eq('id', winner.eventId)
      .single();

    if (eventError) throw eventError;

    const rollbackPoints = event?.points?.[String(winner.position)] || 0;

    if (winner.deptId && rollbackPoints > 0) {
      await updateDepartmentPoints(winner.deptId, -rollbackPoints);
    }

    const { error: deleteError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Check remaining winners count and update event status
    const { count: remainingWinners, error: countError } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .select('*', { count: 'exact', head: true })
      .eq('eventId', winner.eventId);

    if (countError) throw countError;

    // If less than 3 winners remain, mark event as ONGOING instead of COMPLETED
    if (remainingWinners < 3 && event?.status === 'COMPLETED') {
      await supabaseAdmin
        .from(TABLES.EVENTS)
        .update({ status: 'ONGOING' })
        .eq('id', winner.eventId);
    }

    return NextResponse.json({ message: "Winner deleted successfully" });
  } catch (error) {
    console.error("Error deleting winner:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
