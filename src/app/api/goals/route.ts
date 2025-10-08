import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, type, target, deadline } = body;

  const goal = await prisma.goal.create({
    data: {
      userId: me.id,
      title,
      description,
      type: type as any,
      target: parseFloat(target),
      deadline: deadline ? new Date(deadline) : null
    }
  });

  return NextResponse.json({ goal });
}

export async function PUT(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, current, completed } = body;

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      current: current !== undefined ? parseFloat(current) : undefined,
      completed: completed !== undefined ? completed : undefined
    }
  });

  return NextResponse.json({ goal });
}
