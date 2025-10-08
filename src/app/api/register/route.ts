import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function POST(req: Request) {
  const data = await req.json();
  const parsed = z
    .object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) })
    .safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({ data: { email: parsed.data.email, name: parsed.data.name, passwordHash } });
  return NextResponse.json({ ok: true });
}


