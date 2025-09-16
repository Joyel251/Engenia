import prisma from '../../../lib/prisma';

// Force dynamic execution and Node.js runtime for Prisma-backed API
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const settings = await prisma.settings.findMany();
  return new Response(JSON.stringify(settings), { status: 200 });
}

export async function PUT(req) {
  const body = await req.json();
  const { leaderboardVisible, lockdown, id } = body;

  if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });

  const updatedSettings = await prisma.settings.update({
    where: { id },
    data: { leaderboardVisible, lockdown },
  });

  return new Response(JSON.stringify(updatedSettings), { status: 200 });
}
