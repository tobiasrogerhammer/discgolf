import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const friends = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: me.id }, { addresseeId: me.id }], status: "ACCEPTED" },
    select: { requesterId: true, addresseeId: true },
  });
  const friendIds = new Set<string>();
  for (const f of friends) { friendIds.add(f.requesterId); friendIds.add(f.addresseeId); }
  friendIds.add(me.id);
  const users = await prisma.user.findMany({ where: { id: { in: Array.from(friendIds) } } });
  const stats = await prisma.round.groupBy({ by: ["userId"], _avg: { rating: true }, where: { userId: { in: Array.from(friendIds) }, rating: { not: null } } });
  const map = new Map(stats.map(s => [s.userId, s._avg.rating ?? 0]));
  const board = users.map(u => ({ id: u.id, name: u.name ?? u.email, avgRating: Math.round((map.get(u.id) ?? 0)) })).sort((a,b)=> (b.avgRating - a.avgRating));
  return NextResponse.json({ leaderboard: board });
}


