import prisma from '../../../lib/prisma';

export async function GET(req) {
  const departments = await prisma.department.findMany({
    include: { achievements: true, winners: true },
  });
  return new Response(JSON.stringify(departments), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const { name, points } = body;
  if (!name) return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });

  const newDept = await prisma.department.create({
    data: { name, points: points || 0 },
  });
  return new Response(JSON.stringify(newDept), { status: 201 });
}
