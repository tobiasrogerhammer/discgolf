import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const location = searchParams.get('location');
  const difficulty = searchParams.get('difficulty');
  const holes = searchParams.get('holes');

  if (!query && !location && !difficulty && !holes) {
    return NextResponse.json({ error: "Search parameters required" }, { status: 400 });
  }

  let whereClause: any = {};

  // Text search
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { location: { contains: query, mode: 'insensitive' } }
    ];
  }

  // Location filter
  if (location) {
    whereClause.location = { contains: location, mode: 'insensitive' };
  }

  // Difficulty filter
  if (difficulty) {
    whereClause.difficulty = difficulty;
  }

  // Holes filter
  if (holes) {
    whereClause.holes = parseInt(holes);
  }

  const courses = await prisma.course.findMany({
    where: whereClause,
    include: {
      holePars: true,
      _count: { select: { rounds: true } }
    },
    orderBy: [
      { name: 'asc' }
    ],
    take: 20
  });

  // Add distance calculation if coordinates are available
  const userLat = parseFloat(searchParams.get('userLat') || '0');
  const userLon = parseFloat(searchParams.get('userLon') || '0');

  const coursesWithDistance = courses.map(course => {
    let distance = null;
    if (course.latitude && course.longitude && userLat && userLon) {
      distance = calculateDistance(userLat, userLon, course.latitude, course.longitude);
    }
    return { ...course, distance };
  });

  // Sort by distance if coordinates provided
  if (userLat && userLon) {
    coursesWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  return NextResponse.json({ courses: coursesWithDistance });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
