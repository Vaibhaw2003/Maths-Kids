import React from 'react';
import { Lock, Play, Star } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface LevelNodeProps {
  levelNumber: number;
  starsEarned: number; // 0 if not completed yet, 1-3 if completed
  isUnlocked: boolean;
  isCurrent: boolean;
  accentHex: string;
  onSelect: (level: number) => void;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  levelNumber,
  starsEarned,
  isUnlocked,
  isCurrent,
  accentHex,
  onSelect,
}) => {
  const isCompleted = starsEarned > 0;

  return (
    <button
      type="button"
      disabled={!isUnlocked}
      onClick={() => {
        if (isUnlocked) {
          audioService.playClick();
          onSelect(levelNumber);
        }
      }}
      style={
        isCurrent
          ? {
              borderColor: '#22D3EE',
              boxShadow: '0 0 18px rgba(34, 211, 238, 0.45)',
            }
          : isCompleted
          ? { borderColor: `${accentHex}88` }
          : undefined
      }
      className={`relative flex flex-col items-center justify-center rounded-2xl p-2.5 sm:p-3 border-2 transition-all select-none ${
        !isUnlocked
          ? 'bg-[#151D3B] border-[#AEBBD9]/12 text-[#AEBBD9]/50 cursor-not-allowed'
          : isCurrent
          ? 'bg-gradient-to-b from-[#287BFF] to-[#1A4DB8] text-white cursor-pointer hover:scale-105'
          : isCompleted
          ? 'bg-[#222E52] text-white cursor-pointer hover:border-[#22D3EE] hover:scale-105'
          : 'bg-[#192344] border-[#AEBBD9]/25 text-white cursor-pointer hover:border-[#22D3EE]'
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-2.5 px-1.5 py-0.5 rounded-md bg-[#22D3EE] text-[#06242C] text-[9px] font-display font-bold uppercase tracking-wider shadow">
          <Play className="w-2.5 h-2.5 inline fill-current" />
        </span>
      )}

      <span className="text-base sm:text-lg font-display font-bold tabular-nums leading-none">
        {levelNumber}
      </span>

      {/* Stars shown strictly for completed levels; lock for locked levels */}
      <div className="mt-1.5 h-3.5 flex items-center justify-center gap-0.5">
        {!isUnlocked ? (
          <Lock className="w-3 h-3 text-[#AEBBD9]/55" />
        ) : isCompleted ? (
          [1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-3 h-3 ${
                s <= starsEarned
                  ? 'fill-[#FFD43B] text-[#FFD43B]'
                  : 'text-[#AEBBD9]/30'
              }`}
            />
          ))
        ) : (
          <span className="text-[10px] font-bold text-[#22D3EE]">GO</span>
        )}
      </div>
    </button>
  );
};
