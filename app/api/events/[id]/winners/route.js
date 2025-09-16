import prisma from '../../../../../lib/prisma';

// ✅ Get all winners for a specific event
export async function GET(req, { params }) {
  const { id } = params; // eventId

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      winners: {
        include: { department: true },
        orderBy: { position: 'asc' }, // 1st → 2nd → 3rd
      },
    },
  });

  if (!event) {
    return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(event.winners), { status: 200 });
}
