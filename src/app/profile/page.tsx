"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function ProfilePage() {
  const { user } = useUser();
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'friends'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  
  const currentUser = useQuery(api.users.getCurrentUser, 
    user ? { clerkId: user.id } : "skip"
  );
  const rounds = useQuery(api.rounds.getByUser, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const achievementProgress = useQuery(api.achievements.getUserAchievementProgress, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const leaderboard = useQuery(api.stats.getLeaderboard, {
    courseId: selectedCourse !== 'all' ? selectedCourse as any : undefined,
    friendsOnly: leaderboardFilter === 'friends',
    userId: currentUser?._id
  });
  const analytics = useQuery(api.stats.getAnalytics, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const courses = useQuery(api.courses.getAll);

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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">My Profile</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your account and view your stats
          </p>
        </div>
     
          <UserButton afterSignOutUrl="/"/>
       
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
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {user?.fullName || 'No name set'}
              </h3>
              <p className="text-muted-foreground break-all text-sm">
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
      <Card>
        <CardHeader>
          <CardTitle>Your Stats</CardTitle>
          <CardDescription>
            Overview of your disc golf performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalRounds}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Rounds</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{averageScore}</div>
              <div className="text-sm text-muted-foreground mt-1">Average Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {bestScore === Infinity ? 'N/A' : bestScore}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Best Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{uniqueCourses}</div>
              <div className="text-sm text-muted-foreground mt-1">Courses Played</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏅 Leaderboard
            {leaderboard && (
              <Badge variant="secondary" className="ml-auto">
                {leaderboardFilter === 'friends' ? 'Friends' : 'All'} • {Math.min(leaderboard.length, 5)}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            See how you rank against other players
          </CardDescription>
          
          {/* Filter Controls */}
          <div className="flex sm:flex-row gap-3 mt-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Players</label>
              <Select value={leaderboardFilter} onValueChange={(value: 'all' | 'friends') => setLeaderboardFilter(value)}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-9 w-40">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard ? (
            <div className="space-y-4">
              {leaderboard.length > 0 ? (
                <>
                  {/* Top 3 Podium */}
                  {leaderboard.slice(0, 3).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">🏆 Top Players</h4>
                      <div className="space-y-2">
                        {leaderboard.slice(0, 3).map((player, index) => {
                          if (!player) return null;
                          const isCurrentUser = currentUser && player.userId === currentUser._id;
                          const rank = index + 1;
                          const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
                          
                          return (
                            <div
                              key={player.userId || `player-${index}`}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                isCurrentUser 
                                  ? 'bg-primary/10 border-primary/20' 
                                  : 'bg-muted/30'
                              }`}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                                {rankEmoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium truncate ${
                                  isCurrentUser ? 'text-primary' : ''
                                }`}>
                                  {isCurrentUser ? 'You' : (player.name || player.username || 'Anonymous')}
                                  {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {player.totalRounds} rounds • Avg: {player.averageScore.toFixed(1)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">
                                  #{rank}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Avg: {player.averageScore.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Current User's Position (if not in top 3) */}
                  {currentUser && leaderboard.length > 3 && (
                    (() => {
                      const userIndex = leaderboard.findIndex(p => p && p.userId === currentUser._id);
                      if (userIndex >= 3) {
                        const userRank = userIndex + 1;
                        const userPlayer = leaderboard[userIndex];
                        if (!userPlayer) return null;
                        return (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">Your Position</h4>
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/10 border-primary/20">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                #{userRank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-primary truncate">
                                  You
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {userPlayer.totalRounds} rounds • Avg: {userPlayer.averageScore.toFixed(1)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-primary">
                                  #{userRank}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Avg: {userPlayer.averageScore.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {leaderboard.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {leaderboardFilter === 'friends' ? 'Friends' : 'Total Players'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {currentUser ? (() => {
                          const userIndex = leaderboard.findIndex(p => p && p.userId === currentUser._id);
                          return userIndex >= 0 ? `#${userIndex + 1}` : 'N/A';
                        })() : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Your Rank</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-4xl mb-2">🏅</div>
                  <p className="text-sm">
                    {leaderboardFilter === 'friends' 
                      ? 'No friends with rounds found' 
                      : 'No players found'
                    }
                  </p>
                  <p className="text-xs mt-1">
                    {leaderboardFilter === 'friends' 
                      ? 'Add friends or complete rounds to see rankings!' 
                      : 'Be the first to complete a round!'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-sm">Loading leaderboard...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Achievements
            {achievementProgress && (
              <Badge variant="secondary" className="ml-auto">
                {achievementProgress.earnedCount}/{achievementProgress.total}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Track your disc golf accomplishments and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievementProgress ? (
            <div className="space-y-4">
              {/* Progress Overview */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {achievementProgress.earnedPoints}
        </div>
                  <div className="text-sm text-muted-foreground">Points Earned</div>
        </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(achievementProgress.progress)}%
        </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{achievementProgress.earnedCount} of {achievementProgress.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievementProgress.progress}%` }}
                  />
      </div>
      </div>

              {/* Earned Achievements */}
              {achievementProgress.earned.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-green-600">✅ Earned Achievements</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {achievementProgress.earned.map((achievement) => (
                      <div
                        key={achievement._id}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-green-800">{achievement.name}</div>
                          <div className="text-sm text-green-600 truncate">{achievement.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-700">+{achievement.points}</div>
                          <div className="text-xs text-green-600">points</div>
                        </div>
              </div>
            ))}
          </div>
        </div>
      )}

              {/* Unearned Achievements */}
              {achievementProgress.unearned.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">🔒 Locked Achievements</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {achievementProgress.unearned.slice(0, 3).map((achievement) => (
                      <div
                        key={achievement._id}
                        className="flex items-center gap-3 p-3 bg-muted/30 border rounded-lg opacity-60"
                      >
                        <div className="text-2xl grayscale">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-muted-foreground">{achievement.name}</div>
                          <div className="text-sm text-muted-foreground truncate">{achievement.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-muted-foreground">+{achievement.points}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))}
                    {achievementProgress.unearned.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        +{achievementProgress.unearned.length - 3} more achievements to unlock
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-sm">Loading achievements...</p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Actions */}
      <div className="space-y-3">
        <Link href="/friends">
          <Button variant="outline" className="w-full">
            Manage Friends
          </Button>
        </Link>
      
    
      </div>

      {/* Account Settings */}
      
    </div>
  );
}