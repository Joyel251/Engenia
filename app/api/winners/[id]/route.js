// app/api/winners/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ Get winner by ID
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const winner = await prisma.winner.findUnique({
      where: { id },
      include: {
        department: true,
        event: true,
      },
    });

    if (!winner) {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

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
    const existingWinner = await prisma.winner.findUnique({
      where: { id },
    });

    if (!existingWinner) {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    const oldDeptId = existingWinner.deptId;
    const oldPosition = existingWinner.position;
    const newDeptId = body.deptId;
    const newPosition = body.position;

    // 🔹 Get event
    const event = await prisma.event.findUnique({
      where: { id: existingWinner.eventId },
    });

    if (!event || !event.points) {
      return NextResponse.json({ error: "Event points config missing" }, { status: 400 });
    }

    // 🔹 Points mapping
    const oldPoints = event.points[String(oldPosition)] || 0;
    const newPoints = event.points[String(newPosition)] || 0;

    // 🔹 Revert old department points
    if (oldDeptId && oldPoints > 0) {
      await prisma.department.update({
        where: { id: oldDeptId },
        data: { points: { decrement: oldPoints } },
      });
    }

    // 🔹 Update winner record
    const updatedWinner = await prisma.winner.update({
      where: { id },
      data: {
        studentName: body.studentName,
        deptId: newDeptId,
        position: newPosition,
      },
      include: {
        department: true,
        event: true,
      },
    });

    // 🔹 Add points to new department
    if (newDeptId && newPoints > 0) {
      await prisma.department.update({
        where: { id: newDeptId },
        data: { points: { increment: newPoints } },
      });
    }

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
    const winner = await prisma.winner.findUnique({
      where: { id },
    });

    if (!winner) {
      return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: winner.eventId },
    });

    // Points map
    const pointsMap = event?.points || {};
    const rollbackPoints = pointsMap[String(winner.position)] || 0;

    // 🔹 Rollback department points
    if (winner.deptId && rollbackPoints > 0) {
      await prisma.department.update({
        where: { id: winner.deptId },
        data: { points: { decrement: rollbackPoints } },
      });
    }

    // 🔹 Delete winner
    await prisma.winner.delete({ where: { id } });

    return NextResponse.json({ message: "Winner deleted successfully" });
  } catch (error) {
    console.error("Error deleting winner:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
