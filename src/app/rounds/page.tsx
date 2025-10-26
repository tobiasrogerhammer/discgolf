"use client";

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Clock, MapPin, Users, Trophy, Calendar, Target, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Star, BarChart3, Activity } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function RoundsPage() {
  const { user, currentUser } = useCurrentUser();
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  
  const rounds = useQuery(api.rounds.getByUser, 
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // Get detailed round data when a round is selected
  const selectedRoundData = useQuery(api.rounds.getRoundOrGroupRoundById, 
    selectedRound ? { id: selectedRound } : "skip"
  );

  // Scroll to details when a round is selected
  useEffect(() => {
    if (selectedRound && detailsRef.current) {
      detailsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [selectedRound]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return 'In progress';
    const duration = endTime - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getScoreToPar = (totalStrokes: number, coursePar: number) => {
    const diff = totalStrokes - coursePar;
    if (diff === 0) return 'Par';
    if (diff < 0) return `${Math.abs(diff)} under`;
    return `${diff} over`;
  };

  const getScoreColor = (totalStrokes: number, coursePar: number) => {
    const diff = totalStrokes - coursePar;
    if (diff < 0) return 'text-green-600';
    if (diff === 0) return 'text-blue-600';
    return 'text-red-600';
  };

  // Helper function to calculate course par for card display using actual data
  const getCourseParForCard = (round: any) => {
    // If we have courseHoles data, use it
    if (round.courseHoles && round.courseHoles.length > 0) {
      return round.courseHoles.reduce((sum: number, hole: any) => sum + hole.par, 0);
    }
    
    // If we have scores, calculate from actual hole pars
    if (round.scores && round.scores.length > 0) {
      return round.scores.reduce((sum: number, score: any) => {
        // Use actual hole par if available, otherwise default to 3
        const hole = round.courseHoles?.find((h: any) => h.hole === score.hole);
        return sum + (hole ? hole.par : 3);
      }, 0);
    }
    
    // Last resort: use course holes count * 3
    return (round.course?.holes || 18) * 3;
  };

  if (!user || !currentUser) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              Please sign in to view your rounds history.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
        <div className="p-4 space-y-6 snap-start">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Previous Rounds</h1>
        <p className="text-[var(--muted-foreground)]">
          View your disc golf round history and detailed statistics
        </p>
      </div>

      {rounds && rounds.length > 0 ? (
        <div className="space-y-4">
          {/* Rounds List */}
          <div className="space-y-3">
            {rounds.map((round) => (
              <Card 
                key={round._id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRound === round._id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedRound(selectedRound === round._id ? null : round._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{round.course?.name || 'Unknown Course'}</h3>
                        <Badge variant="secondary">{round.roundType}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(round.startedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {round.totalStrokes} strokes
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {round.course?.holes || 18} holes
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span className={getScoreColor(round.totalStrokes || 0, getCourseParForCard(round))}>
                            {getScoreToPar(round.totalStrokes || 0, getCourseParForCard(round))}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-2xl font-bold">
                          {round.totalStrokes}
                        </div>
                        <div className="text-xs text-muted-foreground">total</div>
                      </div>
                      {selectedRound === round._id ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Round Details */}
          {selectedRoundData && (() => {
            // Helper function to get hole par using actual courseHoles data - NO GUESSING
            const getHolePar = (holeNumber: number) => {
              if (selectedRoundData.courseHoles && selectedRoundData.courseHoles.length > 0) {
                const hole = selectedRoundData.courseHoles.find(h => h.hole === holeNumber);
                return hole ? hole.par : 3; // Default to par 3 if hole not found
              }
              
              // If no courseHoles data, we can't guess - return 3 as fallback
              return 3;
            };

            // Calculate comprehensive stats (same as round details page)
            const totalStrokes = ('totalStrokes' in selectedRoundData && typeof selectedRoundData.totalStrokes === 'number') ? selectedRoundData.totalStrokes : 0;
            
            // Calculate course par using actual courseHoles data - NO GUESSING
            let coursePar = 54; // Default fallback only if no data available
            
            if (selectedRoundData.courseHoles && selectedRoundData.courseHoles.length > 0) {
              // Use actual course holes data - sum of all hole pars
              coursePar = selectedRoundData.courseHoles.reduce((sum, hole) => sum + hole.par, 0);
            } else if (selectedRoundData.scores && selectedRoundData.scores.length > 0) {
              // Calculate course par using actual hole pars from scores
              coursePar = selectedRoundData.scores.reduce((sum, score) => sum + getHolePar(score.hole), 0);
            }
            
            const scoreToPar = totalStrokes - coursePar;
            
            // Calculate best and worst holes using actual hole pars
            const bestHole = selectedRoundData.scores && selectedRoundData.scores.length > 0 ? selectedRoundData.scores.reduce((best: any, current: any) => {
              const currentPar = getHolePar(current.hole);
              const bestPar = getHolePar(best.hole);
              const currentDiff = current.strokes - currentPar;
              const bestDiff = best.strokes - bestPar;
              return currentDiff < bestDiff ? current : best;
            }) : null;
            
            const worstHole = selectedRoundData.scores && selectedRoundData.scores.length > 0 ? selectedRoundData.scores.reduce((worst: any, current: any) => {
              const currentPar = getHolePar(current.hole);
              const worstPar = getHolePar(worst.hole);
              const currentDiff = current.strokes - currentPar;
              const worstDiff = worst.strokes - worstPar;
              return currentDiff > worstDiff ? current : worst;
            }) : null;

            // Calculate over/under par trend using actual hole pars
            const parTrend = selectedRoundData.scores && selectedRoundData.scores.length > 0 ? selectedRoundData.scores.map((score: any) => {
              const holePar = getHolePar(score.hole);
              return score.strokes - holePar;
            }) : [];
            const positiveTrend = parTrend.filter((diff: number) => diff < 0).length; // Under par holes
            const negativeTrend = parTrend.filter((diff: number) => diff > 0).length; // Over par holes
            const parHoles = parTrend.filter((diff: number) => diff === 0).length;

            // Calculate round duration
            const endTime = ('completed' in selectedRoundData && typeof selectedRoundData.completed === 'boolean' && selectedRoundData.completed) ? Date.now() : Date.now();
            const startedAt = ('startedAt' in selectedRoundData && typeof selectedRoundData.startedAt === 'number') ? selectedRoundData.startedAt : Date.now();
            const duration = endTime - startedAt;
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

            // Calculate average score per hole
            const averageScorePerHole = selectedRoundData.scores && selectedRoundData.scores.length > 0 
              ? (selectedRoundData.scores.reduce((sum: number, score: any) => sum + score.strokes, 0) / selectedRoundData.scores.length).toFixed(1)
              : "0.0";

            // Calculate standard deviation
            const standardDeviation = selectedRoundData.scores && selectedRoundData.scores.length > 0 
              ? Math.sqrt(selectedRoundData.scores.reduce((acc: number, score: any) => {
                  const diff = score.strokes - parseFloat(averageScorePerHole);
                  return acc + (diff * diff);
                }, 0) / selectedRoundData.scores.length).toFixed(1)
              : "0.0";

            // Calculate birdies, pars, bogeys
            const birdies = parTrend.filter((diff: number) => diff < 0).length;
            const pars = parTrend.filter((diff: number) => diff === 0).length;
            const bogeys = parTrend.filter((diff: number) => diff > 0).length;

            return (
              <div ref={detailsRef}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Round Analysis
                    </CardTitle>
                    <CardDescription>
                      {selectedRoundData.course && 'name' in selectedRoundData.course ? selectedRoundData.course.name : 'Unknown Course'} • {formatDate(('startedAt' in selectedRoundData && typeof selectedRoundData.startedAt === 'number') ? selectedRoundData.startedAt : Date.now())}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Round Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Total Strokes</div>
                        <div className="text-3xl font-bold">{totalStrokes}</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Score to Par</div>
                        <div className={`text-3xl font-bold ${getScoreColor(totalStrokes, coursePar)}`}>
                          {scoreToPar === 0 ? 'Par' : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Average/Hole</div>
                        <div className="text-3xl font-bold">{averageScorePerHole}</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Consistency</div>
                        <div className="text-3xl font-bold">{standardDeviation}</div>
                        <div className="text-xs text-muted-foreground">std dev</div>
                      </div>
                    </div>

                    {/* Performance Breakdown */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-sm text-green-600 mb-1">Under Par</div>
                        <div className="text-2xl font-bold text-green-700">{positiveTrend}</div>
                        <div className="text-xs text-green-600">holes</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <div className="text-sm text-blue-600 mb-1">Par</div>
                        <div className="text-2xl font-bold text-blue-700">{parHoles}</div>
                        <div className="text-xs text-blue-600">holes</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-sm text-red-600 mb-1">Over Par</div>
                        <div className="text-2xl font-bold text-red-700">{negativeTrend}</div>
                        <div className="text-xs text-red-600">holes</div>
                      </div>
                    </div>

                    {/* Best/Toughest Holes */}
                    {bestHole && worstHole && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">Best Hole</span>
                          </div>
                          <div className="text-2xl font-bold">Hole {bestHole.hole}</div>
                          <div className="text-sm text-muted-foreground">
                            {bestHole.strokes} strokes • Par {getHolePar(bestHole.hole)} • {bestHole.strokes - getHolePar(bestHole.hole) < 0 ? `${Math.abs(bestHole.strokes - getHolePar(bestHole.hole))} under` : bestHole.strokes - getHolePar(bestHole.hole) === 0 ? 'Par' : `${bestHole.strokes - getHolePar(bestHole.hole)} over`}
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-red-700">Toughest Hole</span>
                          </div>
                          <div className="text-2xl font-bold">Hole {worstHole.hole}</div>
                          <div className="text-sm text-muted-foreground">
                            {worstHole.strokes} strokes • Par {getHolePar(worstHole.hole)} • {worstHole.strokes - getHolePar(worstHole.hole) > 0 ? `${worstHole.strokes - getHolePar(worstHole.hole)} over` : worstHole.strokes - getHolePar(worstHole.hole) === 0 ? 'Par' : `${Math.abs(worstHole.strokes - getHolePar(worstHole.hole))} under`}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Over/Under Par Trend */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Performance Trend
                      </h4>
                      <div className="grid grid-cols-6 md:grid-cols-9 gap-1">
                        {parTrend.map((diff: number, index: number) => (
                          <div key={index} className="flex flex-col items-center p-1 rounded text-xs">
                            <div className="text-xs text-muted-foreground mb-1">H{index + 1}</div>
                            <div className="flex items-center gap-1 mb-1">
                              {Math.abs(diff) <= 3 ? (
                                // Show dots for small differences (1-3)
                                Array.from({ length: Math.abs(diff) }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      diff < 0 ? 'bg-green-500' : diff > 0 ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                  />
                                ))
                              ) : (
                                // Show just the number for large differences (4+)
                                <div className={`text-xs font-bold ${
                                  diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                  {Math.abs(diff)}
                                </div>
                              )}
                              {diff === 0 && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                            </div>
                            <div className="text-xs font-mono">
                              {diff < 0 ? `${diff}` : diff > 0 ? `+${diff}` : 'E'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hole-by-Hole Breakdown */}
                    {selectedRoundData.scores && selectedRoundData.scores.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Hole-by-Hole Breakdown
                        </h4>
                        <div className="grid grid-cols-6 md:grid-cols-9 gap-1">
                          {selectedRoundData.scores
                            .sort((a, b) => a.hole - b.hole)
                            .map((score) => {
                              const holePar = getHolePar(score.hole);
                              const scoreToPar = score.strokes - holePar;
                              const isUnderPar = scoreToPar < 0;
                              const isPar = scoreToPar === 0;
                              const isOverPar = scoreToPar > 0;
                              
                              return (
                                <div 
                                  key={score.hole}
                                  className={`p-2 rounded text-center text-xs ${
                                    isUnderPar ? 'bg-green-100 text-green-800 border border-green-200' :
                                    isPar ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                    'bg-red-100 text-red-800 border border-red-200'
                                  }`}
                                >
                                  <div className="text-xs text-muted-foreground">H{score.hole}</div>
                                  <div className="text-lg font-bold">{score.strokes}</div>
                                  <div className="text-xs">
                                    Par {holePar}
                                  </div>
                                  <div className="text-xs font-semibold">
                                    {isUnderPar ? `${Math.abs(scoreToPar)} under` :
                                     isPar ? 'Par' :
                                     `${scoreToPar} over`}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Round Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Round Type</div>
                        <div className="text-lg font-semibold">{('roundType' in selectedRoundData && typeof selectedRoundData.roundType === 'string') ? selectedRoundData.roundType : 'Casual'}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="text-lg font-semibold">{hours}h {minutes}m</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Course</div>
                        <div className="text-lg font-semibold">{selectedRoundData.course && 'name' in selectedRoundData.course ? selectedRoundData.course.name : 'Unknown Course'}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Holes</div>
                        <div className="text-lg font-semibold">{selectedRoundData.course && 'holes' in selectedRoundData.course ? selectedRoundData.course.holes : 18}</div>
                      </div>
                    </div>

                    {/* Weather Information */}
                    {selectedRoundData.weather && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Weather Conditions
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedRoundData.weather.temperature && (
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">Temperature</div>
                              <div className="text-lg font-semibold">{selectedRoundData.weather.temperature}°F</div>
                            </div>
                          )}
                          {selectedRoundData.weather.windSpeed && (
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">Wind Speed</div>
                              <div className="text-lg font-semibold">{selectedRoundData.weather.windSpeed} mph</div>
                            </div>
                          )}
                          {selectedRoundData.weather.conditions && (
                            <div className="p-3 bg-muted rounded-lg col-span-2">
                              <div className="text-sm text-muted-foreground">Conditions</div>
                              <div className="text-lg font-semibold">{selectedRoundData.weather.conditions}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {('notes' in selectedRoundData && typeof selectedRoundData.notes === 'string' && selectedRoundData.notes) && (
                      <div>
                        <h4 className="font-semibold mb-3">Notes</h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{selectedRoundData.notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Rounds Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start playing to see your round history and statistics here.
            </p>
            <Button asChild>
              <a href="/new">Start New Round</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
