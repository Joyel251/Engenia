import prisma from '../../../../lib/prisma';

export async function GET(req, { params }) {
  const { id } = params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { winners: true },
  });
  return new Response(JSON.stringify(event), { status: 200 });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { name, date, status } = body;

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: { name, date: date ? new Date(date) : undefined, status },
  });

  return new Response(JSON.stringify(updatedEvent), { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await prisma.event.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
