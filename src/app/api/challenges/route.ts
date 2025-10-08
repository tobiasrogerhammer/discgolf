import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  const status = searchParams.get('status'); // active, completed, upcoming

  let whereClause: any = {};
  
  if (groupId) {
    whereClause.groupId = groupId;
  }

  if (status === 'active') {
    whereClause.startDate = { lte: new Date() };
    whereClause.endDate = { gte: new Date() };
  } else if (status === 'completed') {
    whereClause.endDate = { lt: new Date() };
  } else if (status === 'upcoming') {
    whereClause.startDate = { gt: new Date() };
  }

  const challenges = await prisma.challenge.findMany({
    where: whereClause,
    include: {
      group: true,
      participants: {
        include: { user: true }
      },
      _count: { select: { participants: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ challenges });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { groupId, name, description, type, startDate, endDate, target } = body;

  // Check if user is admin of the group
  const membership = await prisma.userGroup.findFirst({
    where: { groupId, userId: me.id, role: 'ADMIN' }
  });

  if (!membership) {
    return NextResponse.json({ error: "Not authorized to create challenges" }, { status: 403 });
  }

  const challenge = await prisma.challenge.create({
    data: {
      groupId,
      name,
      description,
      type: type as any,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      target
    }
  });

  return NextResponse.json({ challenge });
}
