import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { formatDateEuropean } from "@/lib/dateUtils";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const session = await getServerSession();
  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;
  
  const [avg, totalRounds, totalCourses, recentRounds] = me ? await Promise.all([
    prisma.round.aggregate({ _avg: { rating: true }, where: { userId: me.id, rating: { not: null } } }),
    prisma.round.count({ where: { userId: me.id, completed: true } }),
    prisma.round.groupBy({ by: ['courseId'], where: { userId: me.id, completed: true } }).then(groups => groups.length),
    prisma.round.findMany({
      where: { userId: me.id, completed: true },
      include: { course: true },
      orderBy: { startedAt: 'desc' },
      take: 3
    })
  ]) : [null, 0, 0, []];

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">👤</span>
        <h1 className="text-2xl font-bold text-[var(--header-color)]">My Profile</h1>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center p-4">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-[var(--color-brand)]">{totalRounds}</div>
          <div className="text-sm text-gray-600 dark:text-white">Total Rounds</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl mb-2">🥏</div>
          <div className="text-2xl font-bold text-[var(--color-brand)]">{totalCourses}</div>
          <div className="text-sm text-gray-600 dark:text-white">Courses Played</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-[var(--color-brand)]">{avg?._avg.rating ? Math.round(avg._avg.rating) : "-"}</div>
          <div className="text-sm text-gray-600 dark:text-white">Avg Rating</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-[var(--color-brand)]">0</div>
          <div className="text-sm text-gray-600 dark:text-white">Achievements</div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card space-y-2">
        <p><strong>Name:</strong> {me?.name ?? "-"}</p>
        <p><strong>Email:</strong> {me?.email}</p>
        <p><strong>Member since:</strong> {me?.createdAt ? formatDateEuropean(me.createdAt) : "-"}</p>
      </div>

      {/* Recent Rounds */}
      {recentRounds.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-2">Recent Rounds</h3>
          <div className="space-y-1">
            {recentRounds.map((round) => (
              <div key={round.id} className="flex justify-between text-sm">
                <span>{round.course.name}</span>
                <span className="font-semibold">{round.totalStrokes} ({round.roundType})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <Link className="btn btn-outline w-full bg-white dark:bg-white dark:text-black" href="/friends">
          Manage friends
        </Link>
        <a 
          className="btn btn-outline w-full bg-white dark:bg-white dark:text-black" 
          href="/api/export?format=csv"
          download
        >
          Export Data (CSV)
        </a>
        <Link className="btn btn-primary w-full" href="/progress">
          View Progress
        </Link>
        <LogoutButton />
      </div>
    </main>
  );
}


