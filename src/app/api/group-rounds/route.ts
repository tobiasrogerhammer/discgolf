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

  const groupRounds = await prisma.groupRound.findMany({
    where: groupId ? { id: groupId } : {},
    include: {
      rounds: {
        include: {
          user: { select: { name: true, email: true } },
          course: true,
          scores: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ groupRounds });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, courseId, participants } = body;

  // Create group round
  const groupRound = await prisma.groupRound.create({
    data: {
      name,
      createdBy: me.id
    }
  });

  // Create individual rounds for each participant
  const rounds = [];
  for (const participant of participants) {
    const round = await prisma.round.create({
      data: {
        userId: participant.userId,
        courseId,
        groupRoundId: groupRound.id,
        roundType: 'COMPETITIVE',
        completed: false
      }
    });
    rounds.push(round);
  }

  return NextResponse.json({ groupRound, rounds });
}
