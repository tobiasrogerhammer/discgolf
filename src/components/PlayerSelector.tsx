"use client";
import { Player } from "@/types";

interface PlayerSelectorProps {
  players: Player[];
  currentPlayerIdx: number;
  onPlayerChange: (index: number) => void;
}

export default function PlayerSelector({
  players,
  currentPlayerIdx,
  onPlayerChange
}: PlayerSelectorProps) {
  if (players.length <= 1) return null;

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {players.map((player, index) => (
          <button
            key={player.id}
            onClick={() => onPlayerChange(index)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              index === currentPlayerIdx
                ? 'bg-[var(--color-brand)] text-[#002F45]'
                : 'bg-gray-200 dark:bg-gray-700 text-[var(--foreground)] hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {player.name}
          </button>
        ))}
      </div>
    </div>
  );
}
