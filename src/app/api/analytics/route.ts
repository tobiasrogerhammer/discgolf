import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // performance, weather, trends, distribution
  const courseId = searchParams.get('courseId');
  const timePeriod = searchParams.get('timePeriod') || 'year';

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

  const rounds = await prisma.round.findMany({
    where: {
      userId: me.id,
      completed: true,
      totalStrokes: { not: null },
      ...(courseId && { courseId }),
      ...dateFilter
    },
    include: {
      course: true,
      weather: true,
      scores: true
    },
    orderBy: { startedAt: 'asc' }
  });

  console.log('Analytics API - Found rounds:', rounds.length);
  console.log('Analytics API - Rounds data:', rounds.map(r => ({
    id: r.id,
    completed: r.completed,
    totalStrokes: r.totalStrokes,
    startedAt: r.startedAt,
    courseName: r.course?.name
  })));

  if (type === 'performance') {
    // Performance over time
    const performanceData = rounds.map(round => ({
      date: round.startedAt.toLocaleDateString('en-GB'),
      score: round.totalStrokes,
      course: round.course.name,
      roundType: round.roundType
    }));

    return NextResponse.json({ performanceData });
  }

  if (type === 'weather') {
    // Weather impact analysis
    const weatherData = rounds
      .filter(r => r.weather)
      .reduce((acc, round) => {
        const condition = round.weather?.conditions || 'Unknown';
        if (!acc[condition]) {
          acc[condition] = { scores: [], count: 0 };
        }
        acc[condition].scores.push(round.totalStrokes || 0);
        acc[condition].count++;
        return acc;
      }, {} as Record<string, { scores: number[], count: number }>);

    const weatherImpact = Object.entries(weatherData).map(([condition, data]) => ({
      condition,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      count: data.count,
      scores: data.scores
    }));

    return NextResponse.json({ weatherImpact });
  }

  if (type === 'trends') {
    // Monthly trends
    const monthlyData = rounds.reduce((acc, round) => {
      const month = round.startedAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { scores: [], count: 0 };
      }
      acc[month].scores.push(round.totalStrokes || 0);
      acc[month].count++;
      return acc;
    }, {} as Record<string, { scores: number[], count: number }>);

    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      rounds: data.count,
      bestScore: Math.min(...data.scores),
      worstScore: Math.max(...data.scores)
    }));

    return NextResponse.json({ trends });
  }

  if (type === 'distribution') {
    // Score distribution
    const scores = rounds.map(r => r.totalStrokes || 0);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min;
    const binSize = Math.ceil(range / 10);

    const distribution = [];
    for (let i = 0; i < 10; i++) {
      const binStart = min + (i * binSize);
      const binEnd = min + ((i + 1) * binSize);
      const count = scores.filter(s => s >= binStart && s < binEnd).length;
      distribution.push({
        range: `${binStart}-${binEnd}`,
        count,
        percentage: (count / scores.length) * 100
      });
    }

    return NextResponse.json({ distribution });
  }

  if (type === 'course-comparison') {
    // Course performance comparison
    const courseData = rounds.reduce((acc, round) => {
      const courseName = round.course.name;
      if (!acc[courseName]) {
        acc[courseName] = { scores: [], rounds: 0 };
      }
      acc[courseName].scores.push(round.totalStrokes || 0);
      acc[courseName].rounds++;
      return acc;
    }, {} as Record<string, { scores: number[], rounds: number }>);

    const comparison = Object.entries(courseData).map(([course, data]) => ({
      course,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      rounds: data.rounds,
      bestScore: Math.min(...data.scores),
      worstScore: Math.max(...data.scores)
    }));

    return NextResponse.json({ comparison });
  }

  if (type === 'count') {
    // Return the count of completed rounds
    return NextResponse.json({ count: rounds.length });
  }

  return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 });
}
