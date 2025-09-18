import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const winners = await prisma.winner.findMany({
    include: { event: true, department: true },
  });
  return new Response(JSON.stringify(winners), { status: 200 });
}

export async function POST(req) {
  // ✅ Authentication is now handled by middleware.js - no need for adminAuth here
  try {
    const body = await req.json();
    const { eventId, deptId, position, studentName } = body;

    if (!eventId || !deptId || !position) {
      return new Response(JSON.stringify({ error: 'eventId, deptId, and position are required' }), { status: 400 });
    }

    // Check if position already exists for this event
    const existingPositionWinner = await prisma.winner.findFirst({
      where: { eventId, position }
    });

    if (existingPositionWinner) {
      return new Response(JSON.stringify({ 
        error: `Position ${position} already has a winner for this event` 
      }), { status: 400 });
    }

    // Check if department already has a winner for this event
    const existingDeptWinner = await prisma.winner.findFirst({
      where: { eventId, deptId }
    });

    if (existingDeptWinner) {
      return new Response(JSON.stringify({ 
        error: 'This department already has a winner for this event' 
      }), { status: 400 });
    }

    // 1️⃣ Fetch event to get points mapping
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    // 2️⃣ Get points for the winner based on position
    let pointsForPosition = event.points[position] || 0;

    // 3️⃣ Create winner
    const newWinner = await prisma.winner.create({
      data: { eventId, deptId, position, studentName: studentName || null },
    });

    // 4️⃣ Update department points
    const dept = await prisma.department.findUnique({ where: { id: deptId } });
    const newPoints = Math.max((dept?.points || 0) + pointsForPosition, 0); // no negative points

    await prisma.department.update({
      where: { id: deptId },
      data: { points: newPoints },
    });

    // 5️⃣ Check if event now has all 3 winners (1st, 2nd, 3rd) and mark as completed
    const totalWinners = await prisma.winner.count({
      where: { eventId }
    });

    if (totalWinners >= 3) {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'COMPLETED' },
      });
    }

    return new Response(JSON.stringify(newWinner), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}