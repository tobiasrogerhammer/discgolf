"use client";

import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Image } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { ScorecardImageGenerator } from "./ScorecardImageGenerator";

interface ShareButtonProps {
  roundId: string;
  roundData: {
    course: { name: string };
    totalStrokes: number;
    coursePar: number;
    scores: Array<{ hole: number; strokes: number; par: number }>;
    participants: Array<{ name: string; totalStrokes: number }>;
    roundType?: string;
    date?: string;
  };
  className?: string;
}

export function ShareButton({ roundId, roundData, className }: ShareButtonProps) {
  const [isShared, setIsShared] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareRound = useMutation(api.rounds.share);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      const result = await shareRound({ id: roundId as any });
      setIsShared(true);
      
      // Copy the share URL to clipboard
      const shareUrl = `${window.location.origin}${result.shareUrl}`;
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      toast({
        title: "Round shared!",
        description: "Share link copied to clipboard",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error sharing round:", error);
      toast({
        title: "Error",
        description: "Failed to share round",
        variant: "destructive",
      });
    }
  };

  const generateScoreCardText = () => {
    const scoreToPar = roundData.totalStrokes - roundData.coursePar;
    const scoreToParText = scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
    
    let scoreCard = `🥏 Disc Golf Round Results\n`;
    scoreCard += `📍 ${roundData.course.name}\n`;
    scoreCard += `📊 Score: ${roundData.totalStrokes} (${scoreToParText})\n\n`;
    
    scoreCard += `🏆 Leaderboard:\n`;
    roundData.participants
      .sort((a, b) => a.totalStrokes - b.totalStrokes)
      .forEach((participant, index) => {
        const position = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        scoreCard += `${position} ${participant.name}: ${participant.totalStrokes}\n`;
      });
    
    scoreCard += `\n📈 Hole-by-Hole:\n`;
    roundData.scores.forEach(score => {
      const diff = score.strokes - score.par;
      const diffText = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `${diff}`;
      scoreCard += `Hole ${score.hole}: ${score.strokes} (${diffText})\n`;
    });
    
    return scoreCard;
  };

  const handleShareWithScoreCard = async () => {
    try {
      const result = await shareRound({ id: roundId as any });
      setIsShared(true);
      
      const shareUrl = `${window.location.origin}${result.shareUrl}`;
      const scoreCard = generateScoreCardText();
      const shareText = `${scoreCard}\n\n🔗 View full results: ${shareUrl}`;
      
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      
      toast({
        title: "Score card shared!",
        description: "Score card and link copied to clipboard",
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error sharing score card:", error);
      toast({
        title: "Error",
        description: "Failed to share score card",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Text-based sharing */}
      <div className="flex gap-2">
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          disabled={isShared}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              {isShared ? "Shared" : "Share Link"}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleShareWithScoreCard}
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          disabled={isShared}
        >
          <Copy className="h-4 w-4" />
          Score Card
        </Button>
      </div>
      
      {/* Image-based sharing */}
      <div className="flex justify-center">
        <ScorecardImageGenerator 
          roundData={{
            ...roundData,
            roundType: roundData.roundType || 'Casual',
            date: new Date().toLocaleDateString()
          }}
          onImageGenerated={(imageDataUrl) => {
            console.log('Image generated:', imageDataUrl);
          }}
        />
      </div>
    </div>
  );
}
