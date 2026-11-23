import React from 'react';
import {
  Box,
  CalendarCheck,
  Car,
  Flame,
  Globe2,
  Play,
  ShoppingBag,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  ChildProfile,
  GameModeId,
  LanguageCode,
  MASCOTS,
  ScreenRoute,
  WORLDS_CATALOG,
  WorldId,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import {
  getLocalDateString,
  getPlayerLevelInfo,
  getWorldCompletedCount,
} from '../../services/progressionService';
import { HeroMascot3DCanvas } from '../../three/HeroMascot3DCanvas';
import { GameButton } from '../gaming/GameButton';
import { GameCard } from '../gaming/GameCard';
import { MascotAvatar } from '../gaming/MascotAvatar';
import { XPProgressBar } from '../gaming/XPProgressBar';

interface HomeScreenProps {
  profile: ChildProfile;
  lang: LanguageCode;
  selectedWorldId: WorldId;
  onNavigate: (route: ScreenRoute) => void;
  onContinueAdventure: (worldId: WorldId, levelNumber: number) => void;
  onStartQuickGame: (gameId: GameModeId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  lang,
  selectedWorldId,
  onNavigate,
  onContinueAdventure,
  onStartQuickGame,
}) => {
  const t = getTranslations(lang);
  const mascot = MASCOTS[profile.mascot] || MASCOTS.leo;
  const levelInfo = getPlayerLevelInfo(profile.xp || 0);
  const activeWorld =
    WORLDS_CATALOG.find((w) => w.id === selectedWorldId) || WORLDS_CATALOG[0];
  const worldProgress = profile.worldProgress?.[activeWorld.id] || {
    highestUnlockedLevel: 1,
    levelStars: {},
  };
  const nextLevelNum = Math.min(100, worldProgress.highestUnlockedLevel || 1);
  const completedInWorld = getWorldCompletedCount(profile, activeWorld.id);
  const today = getLocalDateString();
  const dailyChallengeDone = profile.dailyChallengeState?.lastCompletedDate === today;
  const dailyPct = Math.min(
    100,
    Math.round(((profile.dailyCompleted || 0) / (profile.dailyGoal || 3)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Hero Adventure Stage: Dark Gaming Shell + Bright Colorful 3D Cartoon World */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5 items-stretch">
        {/* Left: Welcome Hero & Play Actions */}
        <div className="flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#287BFF]/20 border border-[#22D3EE]/35 text-[#22D3EE] text-xs font-display font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                {t.editionBadge}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FF963C]/20 border border-[#FF963C]/40 text-[#FFD43B] text-xs font-display font-bold tabular-nums">
                <Flame className="w-3.5 h-3.5 fill-[#FF963C] text-[#FF963C]" />
                {profile.currentStreak} {t.streakLabel}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <MascotAvatar
                mascotId={profile.mascot}
                outfit={profile.equippedOutfit}
                accessory={profile.equippedCosmetics?.accessory}
                size="lg"
              />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight truncate">
                  {lang === 'hi'
                    ? `नमस्ते, ${profile.nickname}!`
                    : `Hey, ${profile.nickname}!`}
                </h1>
                <p className="text-sm sm:text-base text-[#AEBBD9] mt-1">
                  {lang === 'hi'
                    ? `${t[mascot.nameKey]} के साथ ${activeWorld.nameHi} की सैर करें!`
                    : `Ready for your next 3D math quest with ${t[mascot.nameKey]}?`}
                </p>
              </div>
            </div>

            {/* XP & Daily Goal Bar */}
            <div className="bg-[#10152E]/85 border border-[#AEBBD9]/15 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-display font-bold text-[#AEBBD9]">
                  {t.playerLevelLabel} {levelInfo.level} · {t.xpLabel}
                </span>
                <span className="text-xs font-display font-bold text-[#22D3EE] tabular-nums">
                  {profile.xp || 0} XP
                </span>
              </div>
              <XPProgressBar totalXp={profile.xp || 0} showNumbers />

              <div className="pt-2 border-t border-[#AEBBD9]/10 flex items-center justify-between text-xs">
                <span className="font-bold text-[#AEBBD9]">{t.dailyGoalTitle}</span>
                <span className="font-display font-bold text-[#35D982] tabular-nums">
                  {profile.dailyCompleted} / {profile.dailyGoal}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#192344] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#35D982] to-[#22D3EE] transition-all duration-300"
                  style={{ width: `${dailyPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GameButton
              variant="success"
              size="lg"
              onClick={() => onContinueAdventure(activeWorld.id, nextLevelNum)}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.playNow}</span>
            </GameButton>

            <GameButton
              variant="primary"
              size="lg"
              onClick={() => onNavigate('worlds')}
            >
              <Globe2 className="w-5 h-5" />
              <span>{t.navWorlds}</span>
            </GameButton>

            <GameButton
              variant="purple"
              size="md"
              onClick={() => onNavigate('toybox3d')}
            >
              <Box className="w-4 h-4" />
              <span>{t.launchToybox3D}</span>
            </GameButton>
          </div>
        </div>

        {/* Right: Bright Colorful Interactive 3D Adventure Showcase */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#22D3EE]/35 bg-[#56B9FF] shadow-[0_14px_32px_rgba(6,10,28,0.5)] min-h-[250px] sm:min-h-[300px] flex flex-col">
          <HeroMascot3DCanvas
            mascotId={profile.mascot}
            carSkin={profile.equippedCosmetics?.carSkin}
            robotSkin={profile.equippedCosmetics?.robotSkin}
            envTheme={profile.equippedCosmetics?.envTheme}
          />
          <div className="bg-[#10152E]/90 px-4 py-2.5 flex items-center justify-between gap-2 border-t border-[#AEBBD9]/20">
            <div className="min-w-0">
              <p className="text-xs font-display font-bold text-[#22D3EE] truncate">
                {lang === 'hi' ? activeWorld.nameHi : activeWorld.nameEn}
              </p>
              <p className="text-[11px] text-[#AEBBD9] tabular-nums">
                {lang === 'hi'
                  ? `स्तर ${nextLevelNum} · ${completedInWorld}/100 पूरे`
                  : `Level ${nextLevelNum} · ${completedInWorld}/100 Cleared`}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#FFD43B] shrink-0">
              {lang === 'hi' ? '3D घुमाएँ' : 'Drag 3D'}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Gaming Action Cards (6 Key Modes + Shop Shortcut) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            {t.featuredTitle}
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#222E52] hover:bg-[#2A3966] border border-[#22D3EE]/35 text-[#22D3EE] text-xs sm:text-sm font-display font-bold cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.navShop}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Continue Learning */}
          <GameCard
            glowColor="#35D982"
            onClick={() => onContinueAdventure(activeWorld.id, nextLevelNum)}
            className="p-4 sm:p-5 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#35D982]/20 border border-[#35D982]/40 flex items-center justify-center shrink-0 text-[#35D982]">
              <Play className="w-7 h-7 fill-current" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#35D982]">
                {lang === 'hi' ? activeWorld.nameHi : activeWorld.nameEn}
              </p>
              <h3 className="text-lg font-display font-bold text-white truncate">
                {t.continueLearning}
              </h3>
              <p className="text-xs text-[#AEBBD9] mt-0.5 tabular-nums">
                {lang === 'hi' ? `स्तर ${nextLevelNum} शुरू करें` : `Resume at Level ${nextLevelNum}`}
              </p>
            </div>
          </GameCard>

          {/* 2. Daily Challenge */}
          <GameCard
            glowColor="#FFD43B"
            onClick={() => onNavigate('daily')}
            className="p-4 sm:p-5 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FFD43B]/20 border border-[#FFD43B]/45 flex items-center justify-center shrink-0 text-[#FFD43B]">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FFD43B]">
                {dailyChallengeDone ? t.dailyCompletedToday : '+35 Coins · +40 XP'}
              </p>
              <h3 className="text-lg font-display font-bold text-white truncate">
                {lang === 'hi' ? 'दैनिक चुनौती' : 'Daily Challenge'}
              </h3>
              <p className="text-xs text-[#AEBBD9] mt-0.5">
                {lang === 'hi' ? 'आज के 10 सवाल व मिशन' : '10 daily questions & missions'}
              </p>
            </div>
          </GameCard>

          {/* 3. Adventure Worlds */}
          <GameCard
            glowColor="#22D3EE"
            onClick={() => onNavigate('worlds')}
            className="p-4 sm:p-5 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#22D3EE]/20 border border-[#22D3EE]/45 flex items-center justify-center shrink-0 text-[#22D3EE]">
              <Globe2 className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
                {profile.unlockedWorlds.length} / {WORLDS_CATALOG.length}{' '}
                {lang === 'hi' ? 'द्वीप खुले' : 'Unlocked'}
              </p>
              <h3 className="text-lg font-display font-bold text-white truncate">
                {t.worldsTitle}
              </h3>
              <p className="text-xs text-[#AEBBD9] mt-0.5">
                {lang === 'hi' ? '6 रंगीन 3D द्वीप और 600 स्तर' : '6 cartoon 3D islands · 600 levels'}
              </p>
            </div>
          </GameCard>

          {/* 4. Math Racing */}
          <GameCard
            glowColor="#FF5B6E"
            onClick={() => onStartQuickGame('math_racing')}
            className="p-4 sm:p-5 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF5B6E]/20 border border-[#FF5B6E]/45 flex items-center justify-center shrink-0 text-[#FF5B6E]">
              <Car className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF5B6E]">
                {lang === 'hi' ? 'स्पीड आर्केड' : 'Speed Arcade'}
              </p>
              <h3 className="text-lg font-display font-bold text-white truncate">
                {t.gameTitles.math_racing}
              </h3>
              <p className="text-xs text-[#AEBBD9] mt-0.5">
                {lang === 'hi' ? 'कार दौड़ाएँ और जवाब दें!' : 'Answer fast to zoom to the finish!'}
              </p>
            </div>
          </GameCard>

          {/* 5. Trophy Room */}
          <GameCard
            glowColor="#A855F7"
            onClick={() => onNavigate('rewards')}
            className="p-4 sm:p-5 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#A855F7]/20 border border-[#A855F7]/45 flex items-center justify-center shrink-0 text-[#A855F7]">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#A855F7] tabular-nums">
                {profile.unlockedAchievements.length} {t.achievementsTab}
              </p>
              <h3 className="text-lg font-display font-bold text-white truncate">
                {lang === 'hi' ? 'ट्रॉफी रूम' : 'Trophy Room'}
              </h3>
              <p className="text-xs text-[#AEBBD9] mt-0.5">
                {lang === 'hi' ? 'बैज, स्टिकर, ट्रॉफी व बगीचा' : 'Trophies, badges, stickers & garden'}
              </p>
            </div>
          </GameCard>

          {/* 6. 3D Toybox */}
          <GameCard
            glowColor="#287BFF"
            onClick={() => onNavigate('toybox3d')}
            className="p-4 sm:p-5 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#287BFF]/20 border border-[#287BFF]/45 flex items-center justify-center shrink-0 text-[#287BFF]">
              <Box className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
                {profile.unlocked3DModels.length} {lang === 'hi' ? '3D मॉडल' : '3D Models'}
              </p>
              <h3 className="text-lg font-display font-bold text-white truncate">
                {t.navToybox3D}
              </h3>
              <p className="text-xs text-[#AEBBD9] mt-0.5">
                {lang === 'hi' ? 'सेब का पेड़, ट्रेन, रोबो-दोस्त' : 'Tap 3D toys to count & solve!'}
              </p>
            </div>
          </GameCard>
        </div>
      </section>
    </div>
  );
};
