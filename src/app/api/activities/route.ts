import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');

  // Get user's friends
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: me.id, status: 'ACCEPTED' },
        { addresseeId: me.id, status: 'ACCEPTED' }
      ]
    }
  });

  const friendIds = friendships.map(f => 
    f.requesterId === me.id ? f.addresseeId : f.requesterId
  );

  // Get activities from user and friends
  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: [me.id, ...friendIds] },
      ...(type && { type: type as any })
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, title, description, data } = body;

  const activity = await prisma.activity.create({
    data: {
      userId: me.id,
      type: type as any,
      title,
      description,
      data: data ? JSON.stringify(data) : null
    }
  });

  return NextResponse.json({ activity });
}
