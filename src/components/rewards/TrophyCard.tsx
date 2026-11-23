import React from 'react';
import { Lock, Trophy } from 'lucide-react';
import { GameCard } from '../gaming/GameCard';

interface TrophyCardProps {
  title: string;
  subtitle: string;
  unlocked: boolean;
  progressCurrent: number;
  progressTarget: number;
  accentHex: string;
}

export const TrophyCard: React.FC<TrophyCardProps> = ({
  title,
  subtitle,
  unlocked,
  progressCurrent,
  progressTarget,
  accentHex,
}) => {
  const pct = Math.min(100, Math.round((progressCurrent / Math.max(1, progressTarget)) * 100));

  return (
    <GameCard
      glowColor={unlocked ? accentHex : undefined}
      className={`p-5 flex flex-col justify-between gap-4 ${
        unlocked ? 'border-[#FFD43B]/45' : 'opacity-80'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
            unlocked ? 'border-white/25 text-[#10152E]' : 'bg-[#10152E] border-[#AEBBD9]/20 text-[#AEBBD9]'
          }`}
          style={
            unlocked
              ? { background: `linear-gradient(135deg, ${accentHex}, #FFD43B)` }
              : undefined
          }
        >
          {unlocked ? <Trophy className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
            {title}
          </h3>
          <p className="text-xs text-[#AEBBD9] mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold tabular-nums">
          <span className={unlocked ? 'text-[#35D982]' : 'text-[#AEBBD9]'}>
            {progressCurrent} / {progressTarget}
          </span>
          <span className="text-[#FFD43B]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#10152E] overflow-hidden border border-[#AEBBD9]/15">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(unlocked ? 100 : 4, pct)}%`,
              backgroundColor: unlocked ? '#35D982' : accentHex,
            }}
          />
        </div>
      </div>
    </GameCard>
  );
};
