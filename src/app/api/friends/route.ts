import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's friends
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: me.id, status: 'ACCEPTED' },
        { addresseeId: me.id, status: 'ACCEPTED' }
      ]
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      addressee: { select: { id: true, name: true, email: true } }
    }
  });

  // Extract friends (excluding the current user)
  const friends = friendships.map(friendship => {
    const friend = friendship.requesterId === me.id ? friendship.addressee : friendship.requester;
    return {
      id: friend.id,
      name: friend.name,
      email: friend.email
    };
  });

  return NextResponse.json({ friends });
}
