import React from 'react';
import { CheckCircle2, Lock, Play, Star } from 'lucide-react';
import { LanguageCode, WorldDefinition } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { GameCard } from './GameCard';
import { GameButton } from './GameButton';

interface WorldCardProps {
  world: WorldDefinition;
  lang: LanguageCode;
  isUnlocked: boolean;
  isSelected: boolean;
  completedCount: number;
  totalStars: number;
  onSelect: () => void;
  onEnter: () => void;
}

export const WorldCard: React.FC<WorldCardProps> = ({
  world,
  lang,
  isUnlocked,
  isSelected,
  completedCount,
  totalStars,
  onSelect,
  onEnter,
}) => {
  const t = getTranslations(lang);
  const pct = Math.min(100, Math.round((completedCount / world.totalLevels) * 100));

  return (
    <GameCard
      glowColor={isSelected ? world.accentHex : undefined}
      onClick={onSelect}
      className={`p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all ${
        isSelected ? 'ring-2 ring-[#22D3EE]' : ''
      } ${!isUnlocked ? 'opacity-80' : ''}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-lg text-[#10152E] shrink-0 shadow"
              style={{
                background: `linear-gradient(135deg, ${world.accentHex}, ${world.secondaryHex})`,
              }}
            >
              {world.order}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-lg text-white truncate">
                {lang === 'hi' ? world.nameHi : world.nameEn}
              </h3>
              <p className="text-xs text-[#AEBBD9] line-clamp-2">
                {lang === 'hi' ? world.subtitleHi : world.subtitleEn}
              </p>
            </div>
          </div>

          {!isUnlocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#10152E] border border-[#AEBBD9]/20 text-xs font-bold text-[#AEBBD9] shrink-0">
              <Lock className="w-3.5 h-3.5 text-[#FFD43B]" />
              {t.worldLocked}
            </span>
          ) : completedCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#35D982]/15 border border-[#35D982]/40 text-xs font-bold text-[#35D982] shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedCount}/100
            </span>
          ) : null}
        </div>

        {/* Progress & Stars */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#AEBBD9]">
              {completedCount} / {world.totalLevels} {t.levelsCompleted}
            </span>
            <span className="inline-flex items-center gap-1 text-[#FFD43B] tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#FFD43B]" />
              {totalStars} / 300
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#10152E] overflow-hidden border border-[#AEBBD9]/15">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(isUnlocked && completedCount > 0 ? 4 : 0, pct)}%`,
                background: `linear-gradient(90deg, ${world.accentHex}, ${world.secondaryHex})`,
              }}
            />
          </div>
        </div>
      </div>

      {isUnlocked ? (
        <GameButton
          variant="primary"
          size="md"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onEnter();
          }}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{t.exploreWorld}</span>
        </GameButton>
      ) : (
        <div className="rounded-xl bg-[#10152E] border border-[#FFD43B]/25 px-3 py-2 text-xs font-semibold text-[#FFD43B] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>{lang === 'hi' ? world.unlockRequirementHi : world.unlockRequirementEn}</span>
        </div>
      )}
    </GameCard>
  );
};
