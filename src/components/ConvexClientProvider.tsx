'use client'

import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexProvider } from 'convex/react'
import { ConvexReactClient } from 'convex/react'
import { useAuth } from '@clerk/nextjs'
import BottomNav from '@/components/BottomNav'
import { Toaster } from '@/components/ui/toaster'

// Create Convex client with proper error handling
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable")
}

const convex = new ConvexReactClient(convexUrl)

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  // For testing without authentication, use regular ConvexProvider
  // In production, you'd want to use ConvexProviderWithClerk
  return (
    <ConvexProvider client={convex}>
      <div className={`mx-auto max-w-md min-h-dvh bg-[var(--background)] text-[var(--foreground)] ${isSignedIn ? 'pb-16' : 'overflow-hidden'}`}>
        {children}
        <BottomNav user={isSignedIn} />
        <Toaster />
      </div>
    </ConvexProvider>
  )
}