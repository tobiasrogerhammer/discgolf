"use client";
import { Player } from "@/types";

interface PlayerScoresSummaryProps {
  players: Player[];
  parByHole: number[];
}

export default function PlayerScoresSummary({
  players,
  parByHole
}: PlayerScoresSummaryProps) {
  const calculateTotals = (player: Player) => {
    const score = player.scores.reduce((sum, score, i) => {
      return sum + (score ?? parByHole[i] ?? 3);
    }, 0);
    
    const par = parByHole.reduce((sum, p) => sum + p, 0);
    const toPar = score - par;
    
    return { score, par, toPar };
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-[var(--header-color)] mb-3">Player Scores</h3>
      <div className="space-y-2">
        {players.map((player) => {
          const totals = calculateTotals(player);
          return (
            <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">{player.name}</span>
              <div className="text-right">
                <div className="font-semibold">
                  {totals.score} ({totals.toPar > 0 ? '+' : ''}{totals.toPar})
                </div>
                <div className="text-xs text-gray-500">
                  Par {totals.par}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
