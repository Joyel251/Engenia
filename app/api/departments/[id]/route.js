import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const { id } = params;
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { achievements: true, winners: true },
  });
  return new Response(JSON.stringify(dept), { status: 200 });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { name, points } = body;

  const updatedDept = await prisma.department.update({
    where: { id },
    data: { name, points },
  });
  return new Response(JSON.stringify(updatedDept), { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await prisma.department.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
