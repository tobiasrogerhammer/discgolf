import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's earned achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: me.id },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' }
  });

  // Get all available achievements
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { points: 'desc' }
  });

  // Check for new achievements
  const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);
  const availableAchievements = allAchievements.filter(a => !earnedAchievementIds.includes(a.id));

  return NextResponse.json({ 
    earned: userAchievements,
    available: availableAchievements
  });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { achievementId } = body;

  // Check if user already has this achievement
  const existing = await prisma.userAchievement.findFirst({
    where: { userId: me.id, achievementId }
  });

  if (existing) {
    return NextResponse.json({ error: "Achievement already earned" }, { status: 400 });
  }

  const userAchievement = await prisma.userAchievement.create({
    data: {
      userId: me.id,
      achievementId
    },
    include: { achievement: true }
  });

  // Create activity
  await prisma.activity.create({
    data: {
      userId: me.id,
      type: 'ACHIEVEMENT_EARNED',
      title: `Achievement Unlocked: ${userAchievement.achievement.name}`,
      description: userAchievement.achievement.description,
      data: JSON.stringify({ achievementId })
    }
  });

  return NextResponse.json({ userAchievement });
}
