"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user } = useUser();
  
  const currentUser = useQuery(api.users.getCurrentUser, 
    user ? { clerkId: user.id } : "skip"
  );
  const rounds = useQuery(api.rounds.getByUser, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const analytics = useQuery(api.stats.getAnalytics, 
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // Temporarily disabled for testing
  // if (!user || !currentUser) {
  //   return (
  //     <div className="p-4">
  //       <Card>
  //         <CardTitle>Sign in required</CardTitle>
  //         <CardDescription>
  //           Please sign in to view your profile.
  //         </CardDescription>
  //       </Card>
  //     </div>
  //   );
  // }

  const totalRounds = rounds?.length || 0;
  const totalStrokes = rounds?.reduce((sum, round) => sum + (round.totalStrokes || 0), 0) || 0;
  const averageScore = totalRounds > 0 ? (totalStrokes / totalRounds).toFixed(1) : '0';
  const uniqueCourses = new Set(rounds?.map(round => round.courseId)).size || 0;
  const bestScore = rounds && rounds.length > 0 
    ? Math.min(...rounds.map(round => round.totalStrokes || Infinity))
    : 0;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">My Profile</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your account and view your stats
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>
                {user?.fullName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {user?.fullName || 'No name set'}
              </h3>
              <p className="text-muted-foreground">
                {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
              </p>
              <Badge variant="secondary" className="mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRounds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bestScore === Infinity ? 'N/A' : bestScore}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCourses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rounds */}
      {rounds && rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Rounds</CardTitle>
            <CardDescription>
              Your latest disc golf rounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rounds.slice(0, 5).map((round) => (
                <div
                  key={round._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🥏</div>
                    <div>
                      <div className="font-medium">
                        {round.course?.name || 'Unknown Course'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(round.startedAt).toLocaleDateString()} • {round.roundType}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {round.totalStrokes || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">strokes</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/friends">
          <Button variant="outline" className="w-full">
            Manage Friends
          </Button>
        </Link>
        
        <Link href="/stats">
          <Button variant="outline" className="w-full">
            View Detailed Stats
          </Button>
        </Link>
        
        <Link href="/progress">
          <Button className="w-full">
            View Progress & Goals
          </Button>
        </Link>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">
                  {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                </div>
              </div>
              <Badge variant="outline">Verified</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Account Status</div>
                <div className="text-sm text-muted-foreground">
                  Active account
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}