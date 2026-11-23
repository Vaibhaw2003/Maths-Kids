import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Coins,
  Globe2,
  Home,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react';
import {
  ACHIEVEMENT_CATALOG,
  AchievementId,
  ChildProfile,
  GAME_CATALOG,
  GameModeId,
  LanguageCode,
  WORLDS_CATALOG,
  WorldId,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import { audioService } from '../../services/audioService';
import { GameButton } from '../gaming/GameButton';
import { MascotAvatar } from '../gaming/MascotAvatar';

interface VictoryScreenProps {
  gameId: GameModeId;
  worldId?: WorldId;
  levelNumber?: number;
  isDailyChallenge?: boolean;
  correctCount: number;
  wrongCount: number;
  starsEarned: number;
  xpEarned: number;
  coinsEarned: number;
  alreadyClaimedDaily?: boolean;
  newlyUnlockedAchievements: AchievementId[];
  profile: ChildProfile;
  lang: LanguageCode;
  onPlayAgain: () => void;
  onNextLevel?: (worldId: WorldId, nextLevel: number) => void;
  onNextGame: (nextGameId: GameModeId) => void;
  onReturnToMap?: () => void;
  onHome: () => void;
  onViewRewards: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  gameId,
  worldId,
  levelNumber,
  isDailyChallenge,
  correctCount,
  wrongCount,
  starsEarned,
  xpEarned,
  coinsEarned,
  alreadyClaimedDaily,
  newlyUnlockedAchievements,
  profile,
  lang,
  onPlayAgain,
  onNextLevel,
  onNextGame,
  onReturnToMap,
  onHome,
  onViewRewards,
}) => {
  const t = getTranslations(lang);
  const [badgePopupDismissed, setBadgePopupDismissed] = useState(false);

  const totalAttempts = Math.max(1, correctCount + wrongCount);
  const accuracy = Math.round((correctCount / totalAttempts) * 100);
  const earnedThreeStarScale = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  const world = worldId ? WORLDS_CATALOG.find((w) => w.id === worldId) : undefined;
  const currentIdx = GAME_CATALOG.findIndex((g) => g.id === gameId);
  const nextGame = GAME_CATALOG[(currentIdx + 1) % GAME_CATALOG.length];
  const unlockedBadges = ACHIEVEMENT_CATALOG.filter((a) =>
    newlyUnlockedAchievements.includes(a.id)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative">
      {/* Animated Badge Unlocked Pop-up */}
      {unlockedBadges.length > 0 && !badgePopupDismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mb-6 gaming-panel rounded-3xl p-5 border-2 border-[#FFD43B] shadow-[0_0_28px_rgba(255,212,59,0.28)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD43B] text-[#2A1C00] flex items-center justify-center shadow">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-[#FFD43B]">
                  {t.badgePopupHeading}
                </p>
                <p className="text-lg font-display font-bold text-white">
                  {unlockedBadges
                    .map((b) => (lang === 'hi' ? b.titleHi : b.titleEn))
                    .join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GameButton variant="yellow" size="sm" onClick={onViewRewards}>
                {t.viewAchievementsBtn}
              </GameButton>
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setBadgePopupDismissed(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#222E52] text-xs font-bold text-[#AEBBD9] hover:text-white cursor-pointer"
              >
                {t.badgePopupDismiss}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Victory Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-panel rounded-[var(--radius-panel)] p-6 sm:p-9 text-center space-y-6 border-2 border-[#22D3EE]/35"
      >
        {/* Mascot + Animated 3-Star Showcase */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.12, type: 'spring', stiffness: 260 }}
              >
                <Star
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${
                    idx <= earnedThreeStarScale
                      ? 'fill-[#FFD43B] text-[#FFD43B] drop-shadow-[0_0_12px_rgba(255,212,59,0.55)]'
                      : 'text-[#AEBBD9]/25'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          <MascotAvatar
            mascotId={profile.mascot}
            outfit={profile.equippedOutfit}
            accessory={profile.equippedCosmetics?.accessory}
            size="xl"
          />
        </div>

        <div>
          <p className="text-xs font-display font-bold uppercase tracking-widest text-[#22D3EE]">
            {isDailyChallenge
              ? t.dailyChallengeTitle
              : world && levelNumber
              ? `${lang === 'hi' ? world.nameHi : world.nameEn} · Level ${levelNumber}`
              : t.gameTitles[gameId]}
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mt-1">
            {t.resultsTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#AEBBD9] mt-1">
            {alreadyClaimedDaily
              ? lang === 'hi'
                ? 'आज का दैनिक इनाम पहले ही मिल चुका है — शानदार अभ्यास!'
                : 'Daily Challenge bonus already claimed today — great practice run!'
              : t.resultsSubtitle}
          </p>
        </div>

        {/* Reward Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#10152E] border border-[#35D982]/35 rounded-2xl p-3.5">
            <Target className="w-5 h-5 text-[#35D982] mx-auto mb-1" />
            <p className="text-2xl font-display font-bold text-[#35D982] tabular-nums">
              {accuracy}%
            </p>
            <p className="text-xs font-bold text-[#AEBBD9]">{t.accuracyLabel}</p>
          </div>

          <div className="bg-[#10152E] border border-[#22D3EE]/35 rounded-2xl p-3.5">
            <Zap className="w-5 h-5 text-[#22D3EE] mx-auto mb-1" />
            <p className="text-2xl font-display font-bold text-[#22D3EE] tabular-nums">
              +{xpEarned}
            </p>
            <p className="text-xs font-bold text-[#AEBBD9]">{t.xpLabel}</p>
          </div>

          <div className="bg-[#10152E] border border-[#FFD43B]/40 rounded-2xl p-3.5">
            <Star className="w-5 h-5 fill-[#FFD43B] text-[#FFD43B] mx-auto mb-1" />
            <p className="text-2xl font-display font-bold text-[#FFD43B] tabular-nums">
              +{starsEarned}
            </p>
            <p className="text-xs font-bold text-[#AEBBD9]">{t.starsLabel}</p>
          </div>

          <div className="bg-[#10152E] border border-[#A855F7]/40 rounded-2xl p-3.5">
            <Coins className="w-5 h-5 text-[#A855F7] mx-auto mb-1" />
            <p className="text-2xl font-display font-bold text-white tabular-nums">
              +{coinsEarned}
            </p>
            <p className="text-xs font-bold text-[#AEBBD9]">{t.coinsLabel}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {worldId && levelNumber && levelNumber < 100 && onNextLevel ? (
            <GameButton
              variant="success"
              size="lg"
              onClick={() => onNextLevel(worldId, levelNumber + 1)}
            >
              <span>{t.nextLevel} ({levelNumber + 1})</span>
              <ArrowRight className="w-5 h-5" />
            </GameButton>
          ) : (
            <GameButton
              variant="success"
              size="lg"
              onClick={() => onNextGame(nextGame.id)}
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.nextGame}: {t.gameTitles[nextGame.id]}</span>
            </GameButton>
          )}

          <GameButton variant="primary" size="lg" onClick={onPlayAgain}>
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </GameButton>

          {worldId && onReturnToMap && (
            <GameButton variant="purple" size="lg" onClick={onReturnToMap}>
              <Globe2 className="w-4 h-4" />
              <span>{t.returnToMap}</span>
            </GameButton>
          )}

          <GameButton variant="secondary" size="lg" onClick={onHome}>
            <Home className="w-4 h-4" />
            <span>{t.backHome}</span>
          </GameButton>
        </div>
      </motion.div>
    </div>
  );
};
