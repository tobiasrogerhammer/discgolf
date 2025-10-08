import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await req.json();
  const other = await prisma.user.findUnique({ where: { email } });
  if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (other.id === me.id) return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 });
  const invite = await prisma.friendship.create({
    data: { requesterId: me.id, addresseeId: other.id, status: "PENDING" },
  });
  return NextResponse.json({ invite });
}


