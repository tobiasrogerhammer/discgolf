"use client";

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Clock, MapPin, Users, Trophy, Calendar, Target } from 'lucide-react';
import { useState } from 'react';

export default function RoundsPage() {
  const { user, currentUser } = useCurrentUser();
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  
  const rounds = useQuery(api.rounds.getByUser, 
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const selectedRoundData = rounds?.find(round => round._id === selectedRound);

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
      <div>
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
                          <span className={getScoreColor(round.totalStrokes || 0, (round.course?.holes || 18) * 3)}>
                            {getScoreToPar(round.totalStrokes || 0, (round.course?.holes || 18) * 3)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {round.totalStrokes}
                      </div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Round Details */}
          {selectedRoundData && (
            <Card className="snap-start">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Round Details
                </CardTitle>
                <CardDescription>
                  {selectedRoundData.course?.name} • {formatDate(selectedRoundData.startedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Round Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Strokes</div>
                    <div className="text-2xl font-bold">{selectedRoundData.totalStrokes}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Score to Par</div>
                    <div className={`text-2xl font-bold ${getScoreColor(selectedRoundData.totalStrokes || 0, (selectedRoundData.course?.holes || 18) * 3)}`}>
                      {getScoreToPar(selectedRoundData.totalStrokes || 0, (selectedRoundData.course?.holes || 18) * 3)}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Round Type</div>
                    <div className="text-lg font-semibold">{selectedRoundData.roundType}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Course</div>
                    <div className="text-lg font-semibold">{selectedRoundData.course?.name}</div>
                  </div>
                </div>

                {/* Hole-by-Hole Scores */}
                {selectedRoundData.scores && selectedRoundData.scores.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Hole-by-Hole Scores
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedRoundData.scores
                        .sort((a, b) => a.hole - b.hole)
                        .map((score) => {
                          const holePar = 3; // Default par, could be enhanced with course hole data
                          const scoreToPar = score.strokes - holePar;
                          const isUnderPar = scoreToPar < 0;
                          const isPar = scoreToPar === 0;
                          const isOverPar = scoreToPar > 0;
                          
                          return (
                            <div 
                              key={score.hole}
                              className={`p-2 rounded-lg text-center ${
                                isUnderPar ? 'bg-green-100 text-green-800' :
                                isPar ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              <div className="text-xs text-muted-foreground">Hole {score.hole}</div>
                              <div className="font-bold">{score.strokes}</div>
                              <div className="text-xs">
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
                {selectedRoundData.notes && (
                  <div>
                    <h4 className="font-semibold mb-3">Notes</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedRoundData.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
