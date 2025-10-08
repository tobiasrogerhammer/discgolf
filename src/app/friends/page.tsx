import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import FriendInviteForm from "@/components/FriendInviteForm";
import AcceptFriendForm from "@/components/AcceptFriendForm";

export default async function FriendsPage() {
  const session = await getServerSession();
  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;
  const friends = me
    ? await prisma.friendship.findMany({
        where: { OR: [{ requesterId: me.id }, { addresseeId: me.id }], status: "ACCEPTED" },
        include: { requester: true, addressee: true },
      })
    : [];
  const invites = me
    ? await prisma.friendship.findMany({ where: { addresseeId: me.id, status: "PENDING" }, include: { requester: true } })
    : [];
  const leaderboard = me
    ? await prisma.round.groupBy({ by: ["userId"], _avg: { rating: true }, where: { rating: { not: null } } })
    : [];
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-[#002F45]">Friends</h1>
      <FriendInviteForm />
      {invites.length > 0 && (
        <div className="mb-4 card">
          <h2 className="font-semibold">Invites</h2>
          <ul className="space-y-2 mt-2">
            {invites.map((i) => (
              <li key={i.id} className="flex justify-between items-center border p-2 rounded">
                <span>{i.requester.name ?? i.requester.email}</span>
                <AcceptFriendForm friendshipId={i.id} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="space-y-2">
        {friends.map((f) => {
          const other = f.requesterId === me?.id ? f.addressee : f.requester;
          return <li key={f.id} className="border p-2 rounded bg-white">{other.name ?? other.email}</li>;
        })}
      </ul>
      <div className="mt-6 card">
        <h2 className="font-semibold">Friend Leaderboard (avg rating)</h2>
        <a href="/api/leaderboard" className="underline text-sm">Open JSON</a>
      </div>
    </main>
  );
}


