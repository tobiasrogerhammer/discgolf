import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const distances = [60,66,111,80,74,70,44,67,53,40,68,57,63,63,113,54,45,90];
  const pars = [3,3,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];
  const course = await prisma.course.upsert({
    where: { name: "Ekeberg" },
    update: {
      estimatedLengthMeters: 2700,
      holes: 18,
      holePars: {
        deleteMany: {},
        create: distances.map((d, i) => ({ hole: i + 1, par: pars[i], distanceMeters: d })),
      },
    },
    create: {
      name: "Ekeberg",
      holes: 18,
      estimatedLengthMeters: 2700,
      holePars: { create: distances.map((d, i) => ({ hole: i + 1, par: pars[i], distanceMeters: d })) },
    },
    include: { holePars: true },
  });
  return NextResponse.json({ ok: true, course });
}


