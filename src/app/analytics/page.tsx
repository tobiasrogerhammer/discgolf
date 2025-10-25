"use client";

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PerformanceChart } from '@/components/PerformanceChart';
import { CoursePerformanceChart } from '@/components/CoursePerformanceChart';

export default function AnalyticsPage() {
  const { user, currentUser } = useCurrentUser();
  const [timePeriod, setTimePeriod] = useState('all');
  
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
  //           Please sign in to view your analytics.
  //         </CardDescription>
  //       </Card>
  //     </div>
  //   );
  // }

  const filteredRounds = rounds?.filter(round => {
    if (timePeriod === 'all') return true;
    
    const roundDate = new Date(round.startedAt);
    const currentDate = new Date();
    
    switch (timePeriod) {
      case 'week':
        const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        return roundDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        return roundDate >= monthAgo;
      case 'year':
        const yearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        return roundDate >= yearAgo;
      default:
        return true;
    }
  }) || [];

  const totalRounds = filteredRounds.length;
  const totalStrokes = filteredRounds.reduce((sum, round) => sum + (round.totalStrokes || 0), 0);
  const averageScore = totalRounds > 0 ? (totalStrokes / totalRounds).toFixed(1) : '0';
  const bestScore = filteredRounds.length > 0 
    ? Math.min(...filteredRounds.map(round => round.totalStrokes || Infinity))
    : 0;
  const worstScore = filteredRounds.length > 0 
    ? Math.max(...filteredRounds.map(round => round.totalStrokes || 0))
    : 0;

  // Calculate improvement over time
  const recentRounds = filteredRounds.slice(0, 5);
  const olderRounds = filteredRounds.slice(-5);
  const recentAverage = recentRounds.length > 0 
    ? recentRounds.reduce((sum, round) => sum + (round.totalStrokes || 0), 0) / recentRounds.length
    : 0;
  const olderAverage = olderRounds.length > 0 
    ? olderRounds.reduce((sum, round) => sum + (round.totalStrokes || 0), 0) / olderRounds.length
    : 0;
  const improvement = olderAverage > 0 ? ((olderAverage - recentAverage) / olderAverage * 100) : 0;

  // Debug information
  console.log('Analytics Debug:', {
    user: user ? 'Authenticated' : 'Not authenticated',
    currentUser: currentUser ? 'Found in DB' : 'Not found in DB',
    rounds: rounds === undefined ? 'Loading...' : rounds === null ? 'Error' : `${rounds?.length || 0} rounds`,
    analytics: analytics === undefined ? 'Loading...' : analytics === null ? 'Error' : 'Loaded'
  });

  return (
    <div className="p-4 space-y-6 snap-start">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-[var(--muted-foreground)]">
          Deep dive into your disc golf performance
        </p>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gray-100 rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
        <p>CurrentUser: {currentUser === undefined ? 'Loading...' : currentUser === null ? 'Not found in DB' : 'Found in DB'}</p>
        <p>Rounds: {rounds === undefined ? 'Loading...' : rounds === null ? 'Error' : `${rounds?.length || 0} rounds loaded`}</p>
        <p>Analytics: {analytics === undefined ? 'Loading...' : analytics === null ? 'Error' : 'Loaded'}</p>
      </div>

      {/* Time Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Time Period</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Key Metrics */}
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
              Worst Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {worstScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <PerformanceChart rounds={filteredRounds as any} />

      {/* Course Performance Chart */}
      <CoursePerformanceChart rounds={filteredRounds as any} />

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            How you're improving over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Recent Performance</div>
                <div className="text-sm text-muted-foreground">
                  Last 5 rounds average
                </div>
              </div>
              <div className="text-lg font-bold">
                {recentAverage.toFixed(1)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Previous Performance</div>
                <div className="text-sm text-muted-foreground">
                  Previous 5 rounds average
                </div>
              </div>
              <div className="text-lg font-bold">
                {olderAverage.toFixed(1)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Improvement</div>
                <div className="text-sm text-muted-foreground">
                  Change in performance
                </div>
              </div>
              <div className={`text-lg font-bold ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Round Types Analysis */}
      {filteredRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Round Types Analysis</CardTitle>
            <CardDescription>
              Performance by round type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                filteredRounds.reduce((acc, round) => {
                  if (!acc[round.roundType]) {
                    acc[round.roundType] = { count: 0, totalStrokes: 0 };
                  }
                  acc[round.roundType].count += 1;
                  acc[round.roundType].totalStrokes += round.totalStrokes || 0;
                  return acc;
                }, {} as Record<string, { count: number; totalStrokes: number }>)
              ).map(([type, data]) => {
                const average = data.count > 0 ? (data.totalStrokes / data.count).toFixed(1) : '0';
                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge variant="secondary">{type}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {data.count} rounds
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{average}</div>
                      <div className="text-xs text-muted-foreground">avg score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>
            AI-powered insights about your game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalRounds === 0 ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-800">📈 Start Playing!</div>
                <div className="text-sm text-gray-700">
                  Play some rounds to see personalized insights about your disc golf performance.
                </div>
              </div>
            ) : (
              <>
                {improvement > 5 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">🎉 Great Improvement!</div>
                    <div className="text-sm text-green-700">
                      You've improved by {improvement.toFixed(1)}% in your recent rounds. Keep up the great work!
                    </div>
                  </div>
                )}
                
                {totalRounds >= 10 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">📊 Consistent Player</div>
                    <div className="text-sm text-blue-700">
                      You've played {totalRounds} rounds, showing great dedication to the sport!
                    </div>
                  </div>
                )}
                
                {bestScore < 50 && bestScore > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800">🏆 Excellent Performance</div>
                    <div className="text-sm text-yellow-700">
                      Your best score of {bestScore} is impressive! You're playing at a high level.
                    </div>
                  </div>
                )}

                {totalRounds > 0 && totalRounds < 5 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="font-medium text-purple-800">🌱 Getting Started</div>
                    <div className="text-sm text-purple-700">
                      You've played {totalRounds} rounds. Play a few more to unlock detailed insights!
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}