import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const timePeriod = searchParams.get('timePeriod') || 'all'; // all, month, year

  // Get date filter
  let dateFilter = {};
  if (timePeriod === 'month') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter = { startedAt: { gte: oneMonthAgo } };
  } else if (timePeriod === 'year') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    dateFilter = { startedAt: { gte: oneYearAgo } };
  }

  // Get user's friends
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: me.id, status: 'ACCEPTED' },
        { addresseeId: me.id, status: 'ACCEPTED' }
      ]
    }
  });

  const friendIds = friendships.map(f => 
    f.requesterId === me.id ? f.addresseeId : f.requesterId
  );

  // Get rounds for leaderboard
  const rounds = await prisma.round.findMany({
    where: {
      courseId: courseId || undefined,
      completed: true,
      totalStrokes: { not: null },
      userId: { in: [me.id, ...friendIds] },
      ...dateFilter
    },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { name: true } }
    },
    orderBy: { totalStrokes: 'asc' }
  });

  // Calculate leaderboard positions
  const leaderboard = rounds.map((round, index) => ({
    position: index + 1,
    user: round.user,
    score: round.totalStrokes,
    course: round.course.name,
    date: round.startedAt,
    isCurrentUser: round.userId === me.id
  }));

  // Get course-specific stats
  const courseStats = courseId ? await prisma.round.groupBy({
    by: ['userId'],
    where: {
      courseId,
      completed: true,
      totalStrokes: { not: null },
      userId: { in: [me.id, ...friendIds] },
      ...dateFilter
    },
    _avg: { totalStrokes: true },
    _min: { totalStrokes: true },
    _count: { totalStrokes: true }
  }) : [];

  return NextResponse.json({ 
    leaderboard: leaderboard.slice(0, 50), // Top 50
    courseStats,
    totalRounds: rounds.length
  });
}
