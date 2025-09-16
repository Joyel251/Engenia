import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const events = await prisma.event.findMany({
    include: { winners: true },
  });
  return new Response(JSON.stringify(events), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const { name, date, status, division, type, guidelines, points } = body;

  if (!name || !date || !division || !type || !points) {
    return new Response(JSON.stringify({ error: 'name, date, division, type, and points are required' }), { status: 400 });
  }

  const newEvent = await prisma.event.create({
    data: {
      name,
      date: new Date(date),
      status: status || 'UPCOMING',
      division,
      type,
      guidelines,
      points,
    },
  });

  return new Response(JSON.stringify(newEvent), { status: 201 });
}
