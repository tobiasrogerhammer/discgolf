import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const courses = await prisma.course.findMany({ include: { holePars: true } });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, holes, pars, description, addressUrl, distances } = body as {
    name: string; holes: number; pars: number[]; description?: string; addressUrl?: string; distances?: number[]
  };
  const course = await prisma.course.create({
    data: {
      name,
      holes,
      description,
      addressUrl,
      holePars: { create: pars.map((par: number, i: number) => ({ hole: i + 1, par, distanceMeters: distances?.[i] })) },
    },
  });
  return NextResponse.json({ course });
}


