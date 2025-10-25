"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/new", icon: "🥏", label: "New" },
  { href: "/rounds", icon: "📋", label: "Rounds" },
  { href: "/stats", icon: "📊", label: "Stats" },
  { href: "/analytics", icon: "📈", label: "Analytics" },
  { href: "/friends", icon: "👥", label: "Friends" },
  { href: "/profile", icon: "👤", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 text-center py-3 transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{item.icon}</span>
                <div className="text-xs font-medium">{item.label}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


