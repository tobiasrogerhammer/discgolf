"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ProgressPage() {
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
  //           Please sign in to view your progress.
  //         </CardDescription>
  //       </Card>
  //     </div>
  //   );
  // }

  const totalRounds = rounds?.length || 0;
  const totalStrokes = rounds?.reduce((sum, round) => sum + (round.totalStrokes || 0), 0) || 0;
  const averageScore = totalRounds > 0 ? (totalStrokes / totalRounds) : 0;
  const uniqueCourses = new Set(rounds?.map(round => round.courseId)).size || 0;

  // Calculate monthly progress
  const monthlyRounds = rounds?.filter(round => {
    const roundDate = new Date(round.startedAt);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return roundDate.getMonth() === currentMonth && roundDate.getFullYear() === currentYear;
  }).length || 0;

  const monthlyGoal = 10; // Example goal
  const monthlyProgress = Math.min((monthlyRounds / monthlyGoal) * 100, 100);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Progress & Goals</h1>
        <p className="text-[var(--muted-foreground)]">
          Track your disc golf journey and achievements
        </p>
      </div>

      {/* Monthly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Goal</CardTitle>
          <CardDescription>
            Rounds played this month: {monthlyRounds} / {monthlyGoal}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={monthlyProgress} className="w-full" />
          <div className="mt-2 text-sm text-muted-foreground">
            {monthlyProgress.toFixed(0)}% complete
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRounds}</div>
            <div className="text-xs text-muted-foreground">
              All time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              Per round
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
            <div className="text-xs text-muted-foreground">
              Unique courses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyRounds}</div>
            <div className="text-xs text-muted-foreground">
              Rounds played
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Round Types Breakdown */}
      {rounds && rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Round Types</CardTitle>
            <CardDescription>
              Breakdown of your rounds by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                rounds.reduce((acc, round) => {
                  acc[round.roundType] = (acc[round.roundType] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => {
                const percentage = (count / totalRounds) * 100;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{type}</Badge>
                      <span className="text-sm font-medium">{count} rounds</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total rounds
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {rounds && rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
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

      {/* Achievements Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Unlock achievements as you play
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🏆</div>
            <p>Achievements coming soon!</p>
            <p className="text-sm">Complete rounds and reach milestones to unlock badges.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}