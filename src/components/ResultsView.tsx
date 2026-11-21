import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Calculator,
  Compass,
  Flame,
  Flower2,
  Home,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ACHIEVEMENT_CATALOG,
  AchievementDefinition,
  AchievementId,
  ChildProfile,
  GAME_CATALOG,
  GameModeId,
  LanguageCode,
} from '../types/game';
import { getTranslations } from '../core/localization';
import { MascotCompanion } from './MascotCompanion';
import { audioService } from '../services/audioService';

interface ResultsViewProps {
  gameId: GameModeId;
  correctCount: number;
  wrongCount: number;
  starsEarned: number;
  newlyUnlockedAchievements?: AchievementId[];
  profile: ChildProfile;
  lang: LanguageCode;
  onPlayAgain: () => void;
  onNextGame: (nextId: GameModeId) => void;
  onHome: () => void;
  onViewAchievements?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  gameId,
  correctCount,
  wrongCount,
  starsEarned,
  newlyUnlockedAchievements = [],
  profile,
  lang,
  onPlayAgain,
  onNextGame,
  onHome,
  onViewAchievements,
}) => {
  const t = getTranslations(lang);
  const shouldReduceMotion = useReducedMotion();
  const currentIdx = GAME_CATALOG.findIndex((g) => g.id === gameId);
  const nextGame = GAME_CATALOG[(currentIdx + 1) % GAME_CATALOG.length];

  const [showBadgePopup, setShowBadgePopup] = useState<boolean>(
    newlyUnlockedAchievements.length > 0
  );

  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      setShowBadgePopup(true);
      const timer = window.setTimeout(() => {
        audioService.playCelebration();
      }, 180);
      return () => clearTimeout(timer);
    }
    setShowBadgePopup(false);
    return undefined;
  }, [newlyUnlockedAchievements]);

  const unlockedDefs = newlyUnlockedAchievements
    .map((id) => ACHIEVEMENT_CATALOG.find((a) => a.id === id))
    .filter((d): d is AchievementDefinition => Boolean(d));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Animated Badge Unlocked Pop-up */}
      <AnimatePresence>
        {showBadgePopup && unlockedDefs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-unlocked-title"
          >
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.72, y: 24 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, y: 12 }
              }
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              className="relative w-full max-w-md bg-white border-2 border-[#FFD83D] rounded-3xl p-6 sm:p-8 shadow-xl text-center overflow-hidden"
            >
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setShowBadgePopup(false);
                }}
                aria-label="Close"
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#287BFF]"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated Emblem Burst */}
              <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                {!shouldReduceMotion && (
                  <>
                    <motion.span
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0], x: -42, y: -28 }}
                      transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.8 }}
                      className="absolute text-[#FFD83D]"
                      aria-hidden="true"
                    >
                      <Star className="w-5 h-5 fill-[#FFD83D]" />
                    </motion.span>
                    <motion.span
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0], x: 44, y: -24 }}
                      transition={{ duration: 1.1, delay: 0.15, repeat: Infinity, repeatDelay: 0.8 }}
                      className="absolute text-[#FF55AE]"
                      aria-hidden="true"
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.span>
                    <motion.span
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0], x: 38, y: 32 }}
                      transition={{ duration: 1.1, delay: 0.3, repeat: Infinity, repeatDelay: 0.8 }}
                      className="absolute text-[#35D66F]"
                      aria-hidden="true"
                    >
                      <Star className="w-4 h-4 fill-[#35D66F]" />
                    </motion.span>
                  </>
                )}

                <motion.div
                  initial={shouldReduceMotion ? {} : { scale: 0.4, rotate: -18 }}
                  animate={shouldReduceMotion ? {} : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.08 }}
                  className="w-22 h-22 rounded-3xl bg-[#FFF8DB] border-2 border-[#FFD83D] flex items-center justify-center shadow-sm"
                >
                  <PopupBadgeIcon
                    icon={unlockedDefs[0].icon}
                    color={unlockedDefs[0].color}
                  />
                </motion.div>
              </div>

              <h2
                id="badge-unlocked-title"
                className="text-2xl sm:text-3xl font-display font-bold text-slate-900"
              >
                {t.badgePopupHeading}
              </h2>

              <div className="mt-4 space-y-2.5 text-left">
                {unlockedDefs.map((def, idx) => (
                  <motion.div
                    key={def.id}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6FAFF] border border-slate-200"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${def.color}22` }}
                    >
                      <PopupBadgeIcon icon={def.icon} color={def.color} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-slate-900 text-base">
                        {lang === 'hi' ? def.titleHi : def.titleEn}
                      </p>
                      <p className="text-xs font-medium text-slate-600">
                        {lang === 'hi' ? def.descriptionHi : def.descriptionEn}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setShowBadgePopup(false);
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#35D66F] hover:bg-emerald-600 text-white font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#287BFF]"
                >
                  {t.badgePopupDismiss}
                </button>
                {onViewAchievements && (
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setShowBadgePopup(false);
                      onViewAchievements();
                    }}
                    className="px-5 py-3 rounded-2xl bg-[#EEF5FF] hover:bg-blue-100 text-[#287BFF] font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#287BFF]"
                  >
                    {t.viewAchievementsBtn}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#FFF8DB] border-2 border-[#FFD83D] mx-auto flex items-center justify-center mb-5 animate-star-burst">
          <Trophy className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-2">
          {t.resultsTitle}
        </h1>
        <p className="text-slate-600 font-medium mb-6">
          {t.gameTitles[gameId]} · {t.resultsSubtitle}
        </p>

        <div className="max-w-lg mx-auto mb-8 text-left">
          <MascotCompanion
            mascotId={profile.mascot}
            outfit={profile.equippedOutfit}
            message={t.encouragements[0]}
            lang={lang}
            size="md"
            mood="celebrating"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-[#ECFFF2] border border-emerald-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-emerald-800 mb-1">{t.correctLabel}</p>
            <p className="text-3xl font-display font-bold text-emerald-700 tabular-nums">
              {correctCount}
            </p>
          </div>
          <div className="bg-[#EEF5FF] border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-800 mb-1">{t.wrongLabel}</p>
            <p className="text-3xl font-display font-bold text-[#287BFF] tabular-nums">
              {wrongCount}
            </p>
          </div>
          <div className="bg-[#FFF8DB] border border-[#FFD83D] rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-900 mb-1">{t.starsLabel}</p>
            <p className="text-3xl font-display font-bold text-amber-700 tabular-nums inline-flex items-center gap-1 justify-center">
              +{starsEarned}
              <Star className="w-6 h-6 fill-[#FFD83D] text-amber-500" />
            </p>
          </div>
        </div>

        {unlockedDefs.length > 0 && (
          <div className="mb-8 bg-[#F4EEFF] border border-purple-200 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#9755F5] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>{t.newBadgeUnlocked}</span>
              </p>
              {onViewAchievements && (
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    onViewAchievements();
                  }}
                  className="text-xs font-bold text-[#287BFF] hover:underline"
                >
                  {t.viewAchievementsBtn}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {unlockedDefs.map((def) => (
                <div
                  key={def.id}
                  className="bg-white border border-purple-200 rounded-xl px-3.5 py-2 flex items-center gap-2"
                >
                  <PopupBadgeIcon icon={def.icon} color={def.color} size="sm" />
                  <span className="font-display font-bold text-sm text-slate-900">
                    {lang === 'hi' ? def.titleHi : def.titleEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onPlayAgain();
            }}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#287BFF] hover:bg-blue-600 text-white font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t.playAgain}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNextGame(nextGame.id);
            }}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#35D66F] hover:bg-emerald-600 text-white font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <span>{t.nextGame}: {t.gameTitles[nextGame.id]}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onHome();
            }}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <Home className="w-5 h-5" />
            <span>{t.backHome}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PopupBadgeIcon: React.FC<{
  icon: AchievementDefinition['icon'];
  color: string;
  size?: 'sm' | 'lg';
}> = ({ icon, color, size = 'lg' }) => {
  const props = {
    className: size === 'sm' ? 'w-5 h-5' : 'w-11 h-11',
    style: { color },
  };
  switch (icon) {
    case 'award':
      return <Award {...props} />;
    case 'target':
      return <Target {...props} />;
    case 'flame':
      return <Flame {...props} />;
    case 'calculator':
      return <Calculator {...props} />;
    case 'trophy':
      return <Trophy {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'flower':
      return <Flower2 {...props} />;
    default:
      return <Sparkles {...props} />;
  }
};
