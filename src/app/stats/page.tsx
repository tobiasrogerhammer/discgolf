"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function StatsPage() {
  const { user } = useUser();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  
  const currentUser = useQuery(api.users.getCurrentUser, 
    user ? { clerkId: user.id } : "skip"
  );
  
  const courses = useQuery(api.courses.getAll);
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
  //           Please sign in to view your statistics.
  //         </CardDescription>
  //       </Card>
  //     </div>
  //   );
  // }

  const filteredRounds = selectedCourse === 'all' 
    ? rounds 
    : rounds?.filter(round => round.courseId === selectedCourse);

  const totalRounds = filteredRounds?.length || 0;
  const totalStrokes = filteredRounds?.reduce((sum, round) => sum + (round.totalStrokes || 0), 0) || 0;
  const averageScore = totalRounds > 0 ? (totalStrokes / totalRounds).toFixed(1) : '0';
  const bestScore = filteredRounds && filteredRounds.length > 0 
    ? Math.min(...filteredRounds.map(round => round.totalStrokes || Infinity))
    : 0;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">My Stats</h1>
        <p className="text-[var(--muted-foreground)]">
          Track your disc golf performance
        </p>
      </div>

      {/* Course Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Overview Stats */}
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
            <div className="text-2xl font-bold">
              {new Set(filteredRounds?.map(round => round.courseId)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rounds */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rounds</CardTitle>
          <CardDescription>
            Your latest disc golf rounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRounds && filteredRounds.length > 0 ? (
            <div className="space-y-3">
              {filteredRounds.slice(0, 5).map((round) => (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No rounds found. Start playing to see your stats!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round Types Breakdown */}
      {filteredRounds && filteredRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Round Types</CardTitle>
            <CardDescription>
              Breakdown of your rounds by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(
                filteredRounds.reduce((acc, round) => {
                  acc[round.roundType] = (acc[round.roundType] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <Badge variant="secondary">{type}</Badge>
                  <span className="font-medium">{count} rounds</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}