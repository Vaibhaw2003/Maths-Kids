import React from 'react';
import {
  Award,
  Calculator,
  CheckCircle2,
  Compass,
  Flame,
  Flower2,
  Lock,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { AchievementDefinition, LanguageCode } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { GameCard } from '../gaming/GameCard';

interface BadgeCardProps {
  achievement: AchievementDefinition;
  current: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: number;
  lang: LanguageCode;
}

function renderBadgeIcon(icon: AchievementDefinition['icon'], unlocked: boolean) {
  const cls = `w-6 h-6 ${unlocked ? 'text-white' : 'text-[#AEBBD9]'}`;
  switch (icon) {
    case 'award':
      return <Award className={cls} />;
    case 'target':
      return <Target className={cls} />;
    case 'flame':
      return <Flame className={cls} />;
    case 'calculator':
      return <Calculator className={cls} />;
    case 'trophy':
      return <Trophy className={cls} />;
    case 'compass':
      return <Compass className={cls} />;
    case 'sparkles':
      return <Sparkles className={cls} />;
    case 'flower':
      return <Flower2 className={cls} />;
  }
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  achievement,
  current,
  target,
  unlocked,
  unlockedAt,
  lang,
}) => {
  const t = getTranslations(lang);
  const pct = Math.min(100, Math.round((current / Math.max(1, target)) * 100));

  return (
    <GameCard
      glowColor={unlocked ? achievement.color : undefined}
      className={`p-4 sm:p-5 flex flex-col justify-between gap-3.5 ${
        !unlocked ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/15"
            style={{
              backgroundColor: unlocked ? achievement.color : '#10152E',
            }}
          >
            {renderBadgeIcon(achievement.icon, unlocked)}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base text-white truncate">
              {lang === 'hi' ? achievement.titleHi : achievement.titleEn}
            </h3>
            <p className="text-xs text-[#AEBBD9] mt-0.5">
              {lang === 'hi' ? achievement.descriptionHi : achievement.descriptionEn}
            </p>
          </div>
        </div>

        {unlocked ? (
          <CheckCircle2 className="w-5 h-5 text-[#35D982] shrink-0" />
        ) : (
          <Lock className="w-4 h-4 text-[#AEBBD9]/60 shrink-0" />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className={unlocked ? 'text-[#35D982]' : 'text-[#AEBBD9]'}>
            {unlocked ? t.achievementUnlocked : t.achievementInProgress}
          </span>
          <span className="text-white tabular-nums">
            {current} / {target}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#10152E] overflow-hidden border border-[#AEBBD9]/15">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(unlocked ? 100 : 4, pct)}%`,
              backgroundColor: unlocked ? '#35D982' : achievement.color,
            }}
          />
        </div>
        {unlocked && unlockedAt && (
          <p className="text-[10px] text-[#AEBBD9]/80">
            {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </GameCard>
  );
};
