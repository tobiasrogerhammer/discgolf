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

  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  // Get date filter based on time period
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

  // Get user's rounds on this course
  const rounds = await prisma.round.findMany({
    where: {
      userId: me.id,
      courseId,
      completed: true,
      ...dateFilter
    },
    include: {
      scores: true,
      weather: true
    },
    orderBy: { startedAt: 'desc' }
  });

  if (rounds.length === 0) {
    return NextResponse.json({ 
      insights: {
        totalRounds: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        improvement: 0,
        bestHoles: [],
        worstHoles: [],
        weatherImpact: null
      }
    });
  }

  // Calculate basic stats
  const scores = rounds.map(r => r.totalStrokes || 0);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const bestScore = Math.min(...scores);
  const worstScore = Math.max(...scores);

  // Calculate improvement (comparing first half vs second half of rounds)
  const midPoint = Math.floor(rounds.length / 2);
  const firstHalf = rounds.slice(0, midPoint).map(r => r.totalStrokes || 0);
  const secondHalf = rounds.slice(midPoint).map(r => r.totalStrokes || 0);
  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const improvement = firstHalfAvg - secondHalfAvg;

  // Calculate per-hole statistics
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { holePars: true }
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const holeStats = [];
  for (let hole = 1; hole <= course.holes; hole++) {
    const holeScores = rounds.flatMap(r => 
      r.scores.filter(s => s.hole === hole).map(s => s.strokes)
    );
    
    if (holeScores.length > 0) {
      const avgScore = holeScores.reduce((a, b) => a + b, 0) / holeScores.length;
      const par = course.holePars.find(h => h.hole === hole)?.par || 3;
      const diff = avgScore - par;
      
      holeStats.push({
        hole,
        par,
        averageScore: avgScore,
        difference: diff,
        roundCount: holeScores.length
      });
    }
  }

  // Sort by performance (worst to best)
  const sortedHoles = holeStats.sort((a, b) => b.difference - a.difference);
  const worstHoles = sortedHoles.slice(0, 3);
  const bestHoles = sortedHoles.slice(-3).reverse();

  // Weather impact analysis
  const weatherRounds = rounds.filter(r => r.weather);
  let weatherImpact = null;
  
  if (weatherRounds.length > 0) {
    const sunnyRounds = weatherRounds.filter(r => r.weather?.conditions === 'Sunny');
    const rainyRounds = weatherRounds.filter(r => r.weather?.conditions === 'Rainy');
    const windyRounds = weatherRounds.filter(r => r.weather?.conditions === 'Windy');
    
    weatherImpact = {
      sunny: sunnyRounds.length > 0 ? {
        count: sunnyRounds.length,
        averageScore: sunnyRounds.reduce((a, b) => a + (b.totalStrokes || 0), 0) / sunnyRounds.length
      } : null,
      rainy: rainyRounds.length > 0 ? {
        count: rainyRounds.length,
        averageScore: rainyRounds.reduce((a, b) => a + (b.totalStrokes || 0), 0) / rainyRounds.length
      } : null,
      windy: windyRounds.length > 0 ? {
        count: windyRounds.length,
        averageScore: windyRounds.reduce((a, b) => a + (b.totalStrokes || 0), 0) / windyRounds.length
      } : null
    };
  }

  return NextResponse.json({
    insights: {
      totalRounds: rounds.length,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      worstScore,
      improvement: Math.round(improvement * 10) / 10,
      bestHoles: bestHoles.map(h => ({
        hole: h.hole,
        par: h.par,
        averageScore: Math.round(h.averageScore * 10) / 10,
        difference: Math.round(h.difference * 10) / 10
      })),
      worstHoles: worstHoles.map(h => ({
        hole: h.hole,
        par: h.par,
        averageScore: Math.round(h.averageScore * 10) / 10,
        difference: Math.round(h.difference * 10) / 10
      })),
      weatherImpact,
      recentTrend: rounds.slice(0, 5).map(r => ({
        date: r.startedAt,
        score: r.totalStrokes,
        roundType: r.roundType
      }))
    }
  });
}
