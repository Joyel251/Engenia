import { supabaseAdmin, TABLES } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/departments/bonus
// Body: { deptId: string, points: number, reason: string }
export async function POST(req) {
  try {
    const body = await req.json();
    const deptId = String(body?.deptId || "").trim();
    const pointsRaw = body?.points;
    const reason = String(body?.reason || "").trim();

    if (!deptId) {
      return NextResponse.json({ error: "deptId is required" }, { status: 400 });
    }

    const points = Number(pointsRaw);
    if (!Number.isFinite(points)) {
      return NextResponse.json({ error: "points must be a number" }, { status: 400 });
    }

    if (points === 0) {
      return NextResponse.json({ error: "points cannot be 0" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    // Fetch department current points
    const { data: dept, error: deptError } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .select('id, points, name')
      .eq('id', deptId)
      .single();

    if (deptError) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const currentPoints = Math.max(0, Number(dept?.points || 0));
    const updatedPoints = Math.max(0, currentPoints + points);

    const { error: updateError } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .update({ points: updatedPoints })
      .eq('id', deptId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update points" }, { status: 500 });
    }

    // Optionally: store an audit log if a table exists; for now, return payload
    return NextResponse.json({
      success: true,
      deptId,
      departmentName: dept?.name,
      change: points,
      reason,
      newPoints: updatedPoints,
    }, { status: 200 });
  } catch (error) {
    console.error('Error awarding bonus:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


