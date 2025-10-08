"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClasses = (active: boolean) =>
  `flex-1 text-center py-3 rounded ${active ? "bg-[var(--color-brand)] text-[#002F45]" : "bg-white text-[#002F45] border"}`;

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t bg-[var(--background)] p-2">
      <div className="flex gap-1">
        <Link href="/new" className={linkClasses(pathname === "/new")}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🥏</span>
            <div className="text-xs">New</div>
          </div>
        </Link>
        <Link href="/stats" className={linkClasses(pathname === "/stats")}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">📊</span>
            <div className="text-xs">Stats</div>
          </div>
        </Link>
        <Link href="/analytics" className={linkClasses(pathname === "/analytics")}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">📈</span>
            <div className="text-xs">Analytics</div>
          </div>
        </Link>
        <Link href="/progress" className={linkClasses(pathname === "/progress")}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🏆</span>
            <div className="text-xs">Goals</div>
          </div>
        </Link>
        <Link href="/profile" className={linkClasses(pathname === "/profile")}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">👤</span>
            <div className="text-xs">Profile</div>
          </div>
        </Link>
      </div>
    </nav>
  );
}


