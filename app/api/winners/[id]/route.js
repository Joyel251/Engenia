import prisma from '../../../../lib/prisma';

export async function GET(req, { params }) {
  const { id } = params;
  const winner = await prisma.winner.findUnique({
    where: { id },
    include: { event: true, department: true },
  });
  return new Response(JSON.stringify(winner), { status: 200 });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { position, studentName, eventId, deptId } = body;

  const updatedWinner = await prisma.winner.update({
    where: { id },
    data: { position, studentName, eventId, deptId },
  });

  return new Response(JSON.stringify(updatedWinner), { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await prisma.winner.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
