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
      <main className="h-dvh flex flex-col items-center justify-center p-6 bg-background overflow-hidden">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-3xl">🥏</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">
              DiscGolf Tracker
            </h1>
            <p className="text-muted-foreground">
              Track your rounds and improve your game
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-lg">📊</span>
              <span>Smart analytics and insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-lg">🎯</span>
              <span>AI caddy assistant</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-lg">👥</span>
              <span>Compete with friends</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full h-11">
                Sign In
              </Button>
            </Link>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full h-11">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="text-xs text-muted-foreground">
            Free • Secure • Mobile-friendly
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-dvh flex flex-col p-4 bg-background">
      {/* Header */}
      <div className="text-center py-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">🥏</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to play some disc golf?
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
          <Link href="/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-24 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">🥏</div>
                <div className="text-sm font-medium text-foreground">New Round</div>
              </div>
            </Card>
          </Link>

          <Link href="/rounds">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-24 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-sm font-medium text-foreground">Previous Rounds</div>
              </div>
            </Card>
          </Link>

          <Link href="/stats">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-24 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium text-foreground">My Stats</div>
              </div>
            </Card>
          </Link>

          <Link href="/friends">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-24 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm font-medium text-foreground">Friends</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 max-w-lg mx-auto w-full">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">Rounds</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">Best</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">Aces</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">Birdies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}