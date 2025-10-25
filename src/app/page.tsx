'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function Home() {
  const { user, currentUser, isLoaded } = useCurrentUser()

  if (!isLoaded) {
    return (
      <main className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="p-4 space-y-4">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">DiscGolf Tracker</h1>
        <p className="text-[var(--muted-foreground)]">
          Track your disc golf rounds and improve your game
        </p>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/login">
            <Button className="w-full">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full">Sign Up</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="p-4 space-y-6 snap-start">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Ready to play some disc golf?
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥏 New Round
              </CardTitle>
              <CardDescription>
                Start tracking a new disc golf round
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/rounds">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Previous Rounds
              </CardTitle>
              <CardDescription>
                View your round history and detailed statistics
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/stats">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 My Stats
              </CardTitle>
              <CardDescription>
                View your performance and statistics
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/friends">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Friends
              </CardTitle>
              <CardDescription>
                Connect with other players and compete
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👤 Profile
              </CardTitle>
              <CardDescription>
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </main>
  )
}