import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'csv';
  const courseId = searchParams.get('courseId');

  // Get user's rounds
  const rounds = await prisma.round.findMany({
    where: {
      userId: me.id,
      completed: true,
      ...(courseId && { courseId })
    },
    include: {
      course: true,
      scores: true,
      weather: true
    },
    orderBy: { startedAt: 'desc' }
  });

  if (format === 'csv') {
    // Generate CSV
    const headers = [
      'Date',
      'Course',
      'Round Type',
      'Total Score',
      'Rating',
      'Temperature',
      'Wind Speed',
      'Wind Direction',
      'Conditions',
      'Hole 1', 'Hole 2', 'Hole 3', 'Hole 4', 'Hole 5', 'Hole 6', 'Hole 7', 'Hole 8', 'Hole 9',
      'Hole 10', 'Hole 11', 'Hole 12', 'Hole 13', 'Hole 14', 'Hole 15', 'Hole 16', 'Hole 17', 'Hole 18'
    ];

    const rows = rounds.map(round => {
      const scores = round.scores.reduce((acc, score) => {
        acc[`Hole ${score.hole}`] = score.strokes;
        return acc;
      }, {} as Record<string, number>);

      return [
        round.startedAt.toLocaleDateString('en-GB'),
        round.course.name,
        round.roundType,
        round.totalStrokes || '',
        round.rating || '',
        round.weather?.temperature || '',
        round.weather?.windSpeed || '',
        round.weather?.windDirection || '',
        round.weather?.conditions || '',
        scores['Hole 1'] || '',
        scores['Hole 2'] || '',
        scores['Hole 3'] || '',
        scores['Hole 4'] || '',
        scores['Hole 5'] || '',
        scores['Hole 6'] || '',
        scores['Hole 7'] || '',
        scores['Hole 8'] || '',
        scores['Hole 9'] || '',
        scores['Hole 10'] || '',
        scores['Hole 11'] || '',
        scores['Hole 12'] || '',
        scores['Hole 13'] || '',
        scores['Hole 14'] || '',
        scores['Hole 15'] || '',
        scores['Hole 16'] || '',
        scores['Hole 17'] || '',
        scores['Hole 18'] || ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="discgolf-rounds.csv"'
      }
    });
  }

  // JSON format
  return NextResponse.json({ rounds });
}
