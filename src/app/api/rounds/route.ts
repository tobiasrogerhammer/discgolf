import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const timePeriod = searchParams.get('timePeriod') || 'all';

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
        weather: true
      },
      orderBy: { startedAt: 'desc' }
    });

    return NextResponse.json({ rounds });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    console.log('Received round data:', body);
    const { courseId, strokesByHole, roundType = 'CASUAL', weather, startedAt } = body as { 
      courseId: string; 
      strokesByHole: number[]; 
      roundType?: string;
      weather?: any;
      startedAt?: string;
    };
  const totalStrokes = (strokesByHole as number[]).reduce((a, b) => a + (b || 0), 0);
  // Ekeberg rating table: map score -> rating (partial list from image)
  const scoreToRating: Record<number, number> = {
    95:402,94:414,93:426,92:438,91:450,90:462,89:474,88:486,87:498,86:510,
    85:522,84:534,83:546,82:558,81:570,80:582,79:594,78:606,77:618,76:630,
    75:642,74:654,73:666,72:678,71:690,70:702,69:714,68:726,67:738,66:750,
    65:762,64:774,63:786,62:798,61:810,60:822,59:834,58:846,57:858,56:870,
    55:882,54:894,53:906,52:918,51:930,50:942,49:834,48:846,47:858,46:870,
    45:1002,44:1014,43:1026,42:1038,41:1050,40:1062,39:1074,38:1086,37:1098,36:1110,
  };
  const rating = scoreToRating[totalStrokes] ?? null;
  
  const now = new Date();
  const round = await prisma.round.create({
    data: {
      courseId,
      userId: me.id,
      completed: true,
      totalStrokes,
      rating: rating as any,
      roundType: roundType as any,
      startedAt: startedAt ? new Date(startedAt) : now, // Use provided date or current time
      weather: weather ? {
        create: {
          temperature: weather.temperature ? parseFloat(weather.temperature) : null,
          windSpeed: weather.windSpeed ? parseFloat(weather.windSpeed) : null,
          windDirection: weather.windDirection || null,
          conditions: weather.conditions || null,
          humidity: weather.humidity ? parseFloat(weather.humidity) : null,
          pressure: weather.pressure ? parseFloat(weather.pressure) : null,
        }
      } : undefined,
      scores: {
        create: (strokesByHole as number[]).map((strokes, i) => ({ hole: i + 1, strokes })),
      },
    },
  });
  return NextResponse.json({ round });
  } catch (error) {
    console.error('Error saving round:', error);
    return NextResponse.json({ error: "Failed to save round" }, { status: 500 });
  }
}


