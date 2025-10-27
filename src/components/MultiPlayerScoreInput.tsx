"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, UserPlus, Plus, Minus } from 'lucide-react';

interface Participant {
  id: string;
  type: 'user' | 'guest';
  name: string;
  email?: string;
  userId?: any; // Convex ID type
}

interface ScoreData {
  [participantId: string]: {
    [hole: number]: number;
  };
}

interface MultiPlayerScoreInputProps {
  participants: Participant[];
  courseHoles: any[];
  onScoresChange: (scores: ScoreData) => void;
  onRoundComplete?: (isComplete: boolean) => void;
  onCurrentHoleChange?: (currentHole: number) => void;
}

export function MultiPlayerScoreInput({ 
  participants, 
  courseHoles, 
  onScoresChange,
  onRoundComplete,
  onCurrentHoleChange
}: MultiPlayerScoreInputProps) {
  const [currentHole, setCurrentHole] = useState(0);
  const [scores, setScores] = useState<ScoreData>(() => {
    const initialScores: ScoreData = {};
    // Initialize scores for 'you'
    initialScores['you'] = Array(courseHoles?.length || 18).fill(0).reduce((acc, _, i) => {
      acc[i] = courseHoles?.[i]?.par || 3;
      return acc;
    }, {} as { [hole: number]: number });
    // Initialize scores for other participants
    participants.forEach(p => {
      initialScores[p.id] = Array(courseHoles?.length || 18).fill(0).reduce((acc, _, i) => {
        acc[i] = courseHoles?.[i]?.par || 3;
        return acc;
      }, {} as { [hole: number]: number });
    });
    return initialScores;
  });


  const currentPar = courseHoles?.find(h => h.hole === currentHole + 1)?.par || 3;
  const totalHoles = courseHoles?.length || 18;

  // Notify parent of current hole changes
  useEffect(() => {
    onCurrentHoleChange?.(currentHole + 1); // Convert to 1-based for parent
  }, [currentHole, onCurrentHoleChange]);

  const handleScoreChange = (participantId: string, hole: number, newScore: number) => {
    const newScores = {
      ...scores,
      [participantId]: {
        ...scores[participantId],
        [hole]: newScore,
      },
    };
    setScores(newScores);
    onScoresChange(newScores);
  };

  const incrementScore = (participantId: string, hole: number) => {
    const currentScore = getCurrentScore(participantId, hole);
    const newScore = Math.min(currentScore + 1, 20); // Max 20 strokes
    handleScoreChange(participantId, hole, newScore);
  };

  const decrementScore = (participantId: string, hole: number) => {
    const currentScore = getCurrentScore(participantId, hole);
    const newScore = Math.max(currentScore - 1, 1); // Min 1 stroke
    handleScoreChange(participantId, hole, newScore);
  };

  const getCurrentScore = (participantId: string, hole: number) => {
    return scores[participantId]?.[hole] || currentPar;
  };

  const getTotalScore = (participantId: string) => {
    const participantScores = scores[participantId] || {};
    return Object.values(participantScores).reduce((sum, score) => sum + score, 0);
  };

  const isRoundComplete = () => {
    return currentHole === totalHoles - 1;
  };

  const canFinishRound = () => {
    // Simply check if we're on the last hole
    // The user can always save their round once they've reached the end
    return isRoundComplete();
  };

  // For solo play, we still show the scoring interface
  const isSoloPlay = participants.length === 0;

  // Notify parent when round completion status changes
  useEffect(() => {
    if (onRoundComplete) {
      const isComplete = canFinishRound();
      onRoundComplete(isComplete);
    }
  }, [currentHole, onRoundComplete]);

  // Score input component with plus/minus buttons
  const ScoreInput = ({ participantId, hole, label }: { participantId: string; hole: number; label: string }) => {
    const currentScore = getCurrentScore(participantId, hole);
    const isPar = currentScore === currentPar;
    const isUnderPar = currentScore < currentPar;
    const isOverPar = currentScore > currentPar;

    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => decrementScore(participantId, hole)}
          disabled={currentScore <= 1}
          className="h-12 w-12 p-0 border-2 hover:bg-red-50"
        >
          <Minus className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Strokes"
            value={currentScore}
            onChange={(e) => handleScoreChange(participantId, hole, parseInt(e.target.value) || 1)}
            className={`text-center text-2xl font-bold py-3 border-2 ${
              isPar ? 'border-blue-400 bg-blue-50 text-blue-700' :
              isUnderPar ? 'border-green-400 bg-green-50 text-green-700' :
              isOverPar ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300'
            }`}
            min="1"
            max="20"
          />
          <div className="text-sm text-center mt-2 font-medium">
            {isPar ? '🎯 Par' : isUnderPar ? `🦅 ${currentPar - currentScore} under` : `📈 ${currentScore - currentPar} over`}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => incrementScore(participantId, hole)}
          disabled={currentScore >= 20}
          className="h-12 w-12 p-0 border-2 hover:bg-green-50"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const currentHoleData = courseHoles?.find(h => h.hole === currentHole + 1);
  const currentDistance = currentHoleData?.distanceMeters || 0;

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl">Score Input</CardTitle>
        <CardDescription className="text-base">
          Hole {currentHole + 1} of {totalHoles}
          {isSoloPlay && " • Solo Round"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hole Details - Enhanced */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border-2">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-4xl font-bold text-primary">Hole {currentHole + 1}</div>
              <div className="text-sm text-muted-foreground mt-1">Current Hole</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-green-600">Par {currentPar}</div>
              <div className="text-sm text-muted-foreground mt-1">Target Score</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-blue-600">
                {currentDistance > 0 ? `${currentDistance}m` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Distance</div>
            </div>
          </div>
        </div>

        {/* Hole Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentHole(prev => Math.max(0, prev - 1))}
            disabled={currentHole === 0}
            variant="outline"
            size="sm"
            className="h-10"
          >
            Previous
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Navigate Holes</div>
          </div>
          <Button
            onClick={() => setCurrentHole(prev => Math.min(totalHoles - 1, prev + 1))}
            disabled={currentHole === totalHoles - 1}
            size="sm"
            className="h-10"
          >
            Next
          </Button>
        </div>

        {/* Score Inputs */}
        <div className="space-y-4">
          {/* Main player (you) */}
          <div className="p-4 border-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">You</span>
                <Badge variant="secondary">
                  {isSoloPlay ? 'Solo' : 'Host'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {getTotalScore('you')}
              </div>
            </div>
            <ScoreInput participantId="you" hole={currentHole} label="You" />
          </div>

          {/* Other participants (only show if not solo play) */}
          {!isSoloPlay && participants.map((participant) => (
            <div key={participant.id} className="p-4 border-2 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {participant.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  <span className="font-medium">{participant.name}</span>
                  <Badge variant={participant.type === 'user' ? 'default' : 'outline'}>
                    {participant.type === 'user' ? 'Friend' : 'Guest'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {getTotalScore(participant.id)}
                </div>
              </div>
              <ScoreInput participantId={participant.id} hole={currentHole} label={participant.name} />
            </div>
          ))}
        </div>

        {/* Round Progress */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span>Progress: {currentHole + 1} / {totalHoles}</span>
            <span className="text-muted-foreground">
              {isRoundComplete() ? 'Round Complete!' : `${totalHoles - currentHole - 1} holes remaining`}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentHole + 1) / totalHoles) * 100}%` }}
            />
          </div>
        </div>

        {/* Round Status */}
        {isRoundComplete() && (
          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {canFinishRound() 
                  ? '🎉 Round Complete! All scores entered.' 
                  : isSoloPlay 
                    ? 'Please enter your score for all holes to complete the round.'
                    : 'Please enter scores for all participants on all holes to complete the round.'
                }
              </p>
              {!canFinishRound() && (
                <div className="text-xs text-muted-foreground">
                  {isSoloPlay 
                    ? 'Navigate through all holes to enter your scores.'
                    : 'Navigate through all holes to enter scores for all players.'
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
