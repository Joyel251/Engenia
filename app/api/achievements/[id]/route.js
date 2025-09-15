import prisma from '../../../../lib/prisma';

export async function GET(req, { params }) {
  const { id } = params;
  const achievement = await prisma.achievement.findUnique({
    where: { id },
    include: { department: true },
  });
  return new Response(JSON.stringify(achievement), { status: 200 });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { deptId, badgeName } = body;

  const updatedAchievement = await prisma.achievement.update({
    where: { id },
    data: { deptId, badgeName },
  });

  return new Response(JSON.stringify(updatedAchievement), { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await prisma.achievement.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
