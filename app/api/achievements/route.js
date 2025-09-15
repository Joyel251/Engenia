import prisma from '../../../lib/prisma';

export async function GET(req) {
  const achievements = await prisma.achievement.findMany({
    include: { department: true },
  });
  return new Response(JSON.stringify(achievements), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const { deptId, badgeName } = body;

  if (!deptId || !badgeName) {
    return new Response(JSON.stringify({ error: 'deptId and badgeName required' }), { status: 400 });
  }

  const newAchievement = await prisma.achievement.create({
    data: { deptId, badgeName },
  });

  return new Response(JSON.stringify(newAchievement), { status: 201 });
}
