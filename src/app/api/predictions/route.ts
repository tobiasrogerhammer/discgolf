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
  const weatherCondition = searchParams.get('weather');

  if (!courseId) {
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });
  }

  try {
    // Get user's historical performance on this course
    const rounds = await prisma.round.findMany({
      where: {
        userId: me.id,
        courseId,
        completed: true,
        totalStrokes: { not: null }
      },
      include: {
        weather: true
      },
      orderBy: { startedAt: 'desc' },
      take: 20 // Last 20 rounds for analysis
    });

    if (rounds.length === 0) {
      return NextResponse.json({ 
        prediction: null,
        message: "Not enough data for predictions. Play more rounds to get predictions!"
      });
    }

    // Calculate performance metrics
    const scores = rounds.map(r => r.totalStrokes || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const recentAverage = scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, scores.length);
    const bestScore = Math.min(...scores);
    const worstScore = Math.max(...scores);

    // Trend analysis (improving vs declining)
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg; // Negative = improving

    // Weather impact analysis
    let weatherAdjustment = 0;
    if (weatherCondition && rounds.length > 0) {
      const weatherRounds = rounds.filter(r => r.weather?.conditions === weatherCondition);
      if (weatherRounds.length > 0) {
        const weatherAvg = weatherRounds.reduce((a, b) => a + (b.totalStrokes || 0), 0) / weatherRounds.length;
        const allWeatherAvg = rounds.reduce((a, b) => a + (b.totalStrokes || 0), 0) / rounds.length;
        weatherAdjustment = weatherAvg - allWeatherAvg;
      }
    }

    // Performance prediction algorithm
    let predictedScore = averageScore;
    
    // Apply trend factor (20% weight to recent performance)
    predictedScore = (recentAverage * 0.2) + (averageScore * 0.8);
    
    // Apply weather adjustment
    predictedScore += weatherAdjustment;
    
    // Apply trend adjustment (if improving, predict slightly better)
    if (trend < -2) { // Improving significantly
      predictedScore -= 1;
    } else if (trend > 2) { // Declining
      predictedScore += 1;
    }
    
    // Confidence calculation based on data consistency
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(100, 100 - (standardDeviation * 2)));

    // Performance category
    let performanceCategory = "Average";
    if (predictedScore < averageScore - 2) performanceCategory = "Excellent";
    else if (predictedScore < averageScore) performanceCategory = "Good";
    else if (predictedScore > averageScore + 2) performanceCategory = "Challenging";

    // Improvement suggestions
    const suggestions = [];
    if (trend > 1) {
      suggestions.push("Focus on consistency - your recent scores are higher than usual");
    }
    if (standardDeviation > 5) {
      suggestions.push("Work on reducing score variance - aim for more consistent rounds");
    }
    if (weatherAdjustment > 2) {
      suggestions.push(`Consider weather conditions - ${weatherCondition} weather affects your performance`);
    }
    if (recentAverage > averageScore + 1) {
      suggestions.push("Recent performance is below average - consider practice or course strategy");
    }

    return NextResponse.json({
      prediction: {
        predictedScore: Math.round(predictedScore),
        confidence: Math.round(confidence),
        performanceCategory,
        trend: trend > 0 ? "declining" : trend < 0 ? "improving" : "stable",
        weatherImpact: weatherAdjustment,
        suggestions,
        dataPoints: rounds.length,
        recentAverage: Math.round(recentAverage),
        overallAverage: Math.round(averageScore),
        bestScore,
        worstScore
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 });
  }
}
