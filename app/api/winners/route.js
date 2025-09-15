import prisma from '../../../lib/prisma';

export async function GET(req) {
  const winners = await prisma.winner.findMany({
    include: { event: true, department: true },
  });
  return new Response(JSON.stringify(winners), { status: 200 });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventId, deptId, position, studentName } = body;

    if (!eventId || !deptId || !position) {
      return new Response(JSON.stringify({ error: 'eventId, deptId, and position required' }), { status: 400 });
    }

    // 1️⃣ Fetch event to get points mapping
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    // 2️⃣ Get points for the winner based on position
    const pointsForPosition = event.points[position] || 0;

    // 3️⃣ Create winner
    const newWinner = await prisma.winner.create({
      data: { eventId, deptId, position, studentName },
    });

    // 4️⃣ Update department points
    await prisma.department.update({
      where: { id: deptId },
      data: { points: { increment: pointsForPosition } },
    });

    return new Response(JSON.stringify(newWinner), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}
