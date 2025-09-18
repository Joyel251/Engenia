// app/api/winners/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔹 Helper to safely update department points and prevent negative points
async function updateDepartmentPoints(deptId, change) {
  if (!deptId) return;

  const dept = await prisma.department.findUnique({ where: { id: deptId } });
  if (!dept) return;

  // Ensure new points never go below 0
  const currentPoints = Math.max(0, dept.points || 0);
  const newPoints = Math.max(0, currentPoints + change);

  await prisma.department.update({
    where: { id: deptId },
    data: { points: newPoints },
  });
}

// ✅ Get winner by ID
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const winner = await prisma.winner.findUnique({
      where: { id },
      include: { department: true, event: true },
    });

    if (!winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });

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
    const existingWinner = await prisma.winner.findUnique({ where: { id } });
    if (!existingWinner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });

    const oldDeptId = existingWinner.deptId;
    const oldPosition = existingWinner.position;
    const newDeptId = body.deptId;
    const newPosition = body.position;

    const event = await prisma.event.findUnique({ where: { id: existingWinner.eventId } });
    if (!event || !event.points) return NextResponse.json({ error: "Event points config missing" }, { status: 400 });

    const oldPoints = event.points[String(oldPosition)] || 0;
    const newPoints = event.points[String(newPosition)] || 0;

    // 🔹 Revert old department points safely
    if (oldDeptId && oldPoints > 0) await updateDepartmentPoints(oldDeptId, -oldPoints);

    // 🔹 Update winner
    const updatedWinner = await prisma.winner.update({
      where: { id },
      data: {
        studentName: body.studentName,
        deptId: newDeptId,
        position: newPosition,
      },
      include: { department: true, event: true },
    });

    // 🔹 Add points to new department safely
    if (newDeptId && newPoints > 0) await updateDepartmentPoints(newDeptId, newPoints);

    // 🔹 Mark event as completed
    await prisma.event.update({ where: { id: existingWinner.eventId }, data: { status: "COMPLETED" } });

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
    const winner = await prisma.winner.findUnique({ where: { id } });
    if (!winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });

    const event = await prisma.event.findUnique({ where: { id: winner.eventId } });
    const rollbackPoints = event?.points?.[String(winner.position)] || 0;

    if (winner.deptId && rollbackPoints > 0) await updateDepartmentPoints(winner.deptId, -rollbackPoints);

    await prisma.winner.delete({ where: { id } });

    // Check remaining winners count and update event status
    const remainingWinners = await prisma.winner.count({
      where: { eventId: winner.eventId }
    });

    // If less than 3 winners remain, mark event as ONGOING instead of COMPLETED
    if (remainingWinners < 3 && event?.status === 'COMPLETED') {
      await prisma.event.update({
        where: { id: winner.eventId },
        data: { status: 'ONGOING' }
      });
    }

    return NextResponse.json({ message: "Winner deleted successfully" });
  } catch (error) {
    console.error("Error deleting winner:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
