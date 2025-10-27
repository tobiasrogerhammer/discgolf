"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareButton } from './ShareButton';

interface RoundRecapProps {
  roundId: string;
  roundData: {
    courseName: string;
    totalStrokes: number;
    coursePar: number;
    roundType: string;
    startedAt: number;
    completedAt: number;
    scores: Array<{
      hole: number;
      strokes: number;
      par: number;
    }>;
    participants?: Array<{
      name: string;
      totalStrokes: number;
    }>;
  };
  onClose: () => void;
  onViewDetails?: () => void;
}

export function RoundRecap({ roundId, roundData, onClose, onViewDetails }: RoundRecapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Trigger animations in sequence
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setStatsVisible(true), 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Calculate over/under par trend
  const parTrend = roundData.scores.map(score => score.strokes - score.par);
  const positiveTrend = parTrend.filter(diff => diff < 0).length; // Under par holes
  const negativeTrend = parTrend.filter(diff => diff > 0).length; // Over par holes
  const parHoles = parTrend.filter(diff => diff === 0).length;

  // Handle continue action - navigate to home and close recap
  const handleContinue = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-16 sm:pt-8 pb-20 sm:pb-8">
      {/* Celebration Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-2xl animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}>🎉</div>
        <div className="absolute top-1/3 right-1/4 text-xl animate-bounce opacity-60" style={{ animationDelay: '1s' }}>🏆</div>
        <div className="absolute bottom-1/3 left-1/3 text-lg animate-bounce opacity-60" style={{ animationDelay: '1.5s' }}>🥏</div>
        <div className="absolute bottom-1/4 right-1/3 text-xl animate-bounce opacity-60" style={{ animationDelay: '2s' }}>⭐</div>
      </div>
      <div className={cn(
        "w-full max-w-md mx-auto my-2 sm:my-8 transform transition-all duration-700 ease-out",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
      )}>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-2xl max-h-[calc(100vh-10rem)] sm:max-h-[90vh] flex flex-col">
          <CardHeader className="text-center pb-2 sm:pb-3 flex-shrink-0">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-orange-500 rounded-full animate-pulse-slow">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-orange-800 mb-1">
              Round Complete! 🎉
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-orange-700">
              Great round at {roundData.courseName}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            {/* Main Score Display */}
            <div className={cn(
              "text-center transition-all duration-1000 delay-300",
              statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">
                    {roundData.totalStrokes}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                
                <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                  <div className={cn(
                    "text-xl sm:text-2xl font-bold text-center",
                    (roundData.totalStrokes - roundData.coursePar) < 0 ? "text-green-600" : 
                    (roundData.totalStrokes - roundData.coursePar) === 0 ? "text-blue-600" : "text-red-600"
                  )}>
                    {Math.abs(roundData.totalStrokes - roundData.coursePar)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {(roundData.totalStrokes - roundData.coursePar) < 0 ? "Under" : 
                     (roundData.totalStrokes - roundData.coursePar) === 0 ? "Par" : "Over"}
                  </div>
                </div>

                <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">
                    {roundData.coursePar}
                  </div>
                  <div className="text-xs text-gray-600">Par</div>
                </div>
              </div>

              {/* Round Type Badge */}
              <Badge 
                variant="secondary" 
                className="text-sm px-3 py-1 bg-orange-200 text-orange-800 border-orange-300"
              >
                {roundData.roundType}
              </Badge>
            </div>

            {/* Quick Stats Summary */}
            <div className={cn(
              "transition-all duration-1000 delay-500",
              statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="bg-white border border-orange-200 rounded-lg p-2 sm:p-3">
                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-green-600">{positiveTrend}</div>
                    <div className="text-xs text-green-600">Under Par</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-blue-600">{parHoles}</div>
                    <div className="text-xs text-blue-600">Par</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-red-600">{negativeTrend}</div>
                    <div className="text-xs text-red-600">Over Par</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-player Results - Top 3 Only */}
            {roundData.participants && roundData.participants.length > 1 && (
              <div className={cn(
                "transition-all duration-1000 delay-700",
                statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="bg-white border border-orange-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-orange-800 mb-2">Leaderboard</div>
                  <div className="space-y-1">
                    {roundData.participants
                      .sort((a, b) => a.totalStrokes - b.totalStrokes)
                      .slice(0, 3)
                      .map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium truncate">{participant.name}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-700">{participant.totalStrokes}</span>
                      </div>
                    ))}
                    {roundData.participants.length > 3 && (
                      <div className="text-xs text-orange-600 text-center py-1">
                        +{roundData.participants.length - 3} more players
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={cn(
              "flex flex-col gap-3 pt-2 pb-4 transition-all duration-1000 delay-900 flex-shrink-0",
              statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {/* Share Button */}
              <div className="flex justify-center">
                <ShareButton 
                  roundId={roundId}
                  roundData={{
                    course: { name: roundData.courseName },
                    totalStrokes: roundData.totalStrokes,
                    coursePar: roundData.coursePar,
                    scores: roundData.scores,
                    participants: roundData.participants || []
                  }}
                />
              </div>
              
              {/* Main Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleContinue}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-10 text-sm"
                >
                  Continue
                </Button>
                {onViewDetails && roundData.scores && roundData.scores.some(score => score.strokes > 0) && (
                  <Button 
                    onClick={onViewDetails}
                    variant="outline"
                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 h-10 text-sm"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
