import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { holePars: true } });
  if (!course) return NextResponse.json({ error: "course not found" }, { status: 404 });

  const rounds = await prisma.round.findMany({ where: { courseId }, include: { scores: true } });
  const perHole: { total: number; count: number; par: number }[] = Array.from(
    { length: course.holes },
    (_, i) => ({ total: 0, count: 0, par: course.holePars.find((h) => h.hole === i + 1)?.par ?? 3 })
  );
  for (const r of rounds) {
    for (const s of r.scores) {
      const idx = s.hole - 1;
      if (idx >= 0 && idx < perHole.length) {
        perHole[idx].total += s.strokes;
        perHole[idx].count += 1;
      }
    }
  }
  const rows = perHole.map((h, i) => ({ hole: i + 1, par: h.par, avg: h.count ? h.total / h.count : 0 }));
  return NextResponse.json({ course: { id: course.id, name: course.name, holes: course.holes }, rows });
}


