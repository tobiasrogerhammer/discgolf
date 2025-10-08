import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const group = await prisma.group.findFirst({
    where: {
      id,
      members: {
        some: { userId: me.id }
      }
    },
    include: {
      members: {
        include: { user: true }
      },
      challenges: {
        include: {
          participants: {
            include: { user: true }
          }
        }
      }
    }
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json({ group });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, userId } = body;

  if (action === 'join') {
    // Check if user is already a member
    const existingMember = await prisma.userGroup.findFirst({
      where: { groupId: id, userId: me.id }
    });

    if (existingMember) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    const membership = await prisma.userGroup.create({
      data: {
        groupId: id,
        userId: me.id,
        role: 'MEMBER'
      },
      include: { user: true }
    });

    return NextResponse.json({ membership });
  }

  if (action === 'invite') {
    // Check if inviter is admin
    const inviterMembership = await prisma.userGroup.findFirst({
      where: { groupId: id, userId: me.id, role: 'ADMIN' }
    });

    if (!inviterMembership) {
      return NextResponse.json({ error: "Not authorized to invite" }, { status: 403 });
    }

    // Check if user is already a member
    const existingMember = await prisma.userGroup.findFirst({
      where: { groupId: id, userId }
    });

    if (existingMember) {
      return NextResponse.json({ error: "User already a member" }, { status: 400 });
    }

    const membership = await prisma.userGroup.create({
      data: {
        groupId: id,
        userId,
        role: 'MEMBER'
      },
      include: { user: true }
    });

    return NextResponse.json({ membership });
  }

  if (action === 'leave') {
    await prisma.userGroup.deleteMany({
      where: { groupId: id, userId: me.id }
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
