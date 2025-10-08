"use client";
import { Player } from "@/types";

interface ScoreInputProps {
  currentPlayer: Player | null;
  holeIdx: number;
  par: number;
  distance?: number | null;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function ScoreInput({
  currentPlayer,
  holeIdx,
  par,
  distance,
  onIncrement,
  onDecrement
}: ScoreInputProps) {
  const currentScore = currentPlayer?.scores[holeIdx] ?? par;

  return (
    <div className="space-y-4">
      {/* Hole info */}
      <div className="text-center">
        <div className="text-2xl font-bold text-[var(--header-color)]">
          Hole {holeIdx + 1}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Par {par} {distance && `• ${distance}m`}
        </div>
      </div>

      {/* Score display and controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          className="w-16 h-12 border rounded text-2xl bg-[var(--color-brand)] text-[#002F45] font-bold"
          onClick={onDecrement}
        >
          -
        </button>
        <div className="min-w-16 text-center text-3xl font-semibold text-[var(--foreground)] dark:text-white">
          {currentScore}
        </div>
        <button
          className="w-16 h-12 border rounded text-2xl bg-[var(--color-brand)] text-[#002F45] font-bold"
          onClick={onIncrement}
        >
          +
        </button>
      </div>
    </div>
  );
}
