import React from 'react';
import { CalendarCheck, CheckCircle2, Coins, Flame, Play, Sparkles, Trophy, Zap } from 'lucide-react';
import { ChildProfile, LanguageCode } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { getLocalDateString } from '../../services/progressionService';
import { DAILY_MISSIONS_CATALOG } from '../../services/storageService';
import { GameButton } from '../gaming/GameButton';
import { GameCard } from '../gaming/GameCard';
import { MascotAvatar } from '../gaming/MascotAvatar';

interface DailyChallengeScreenProps {
  profile: ChildProfile;
  lang: LanguageCode;
  onStartDailyChallenge: () => void;
  onClaimMission: (missionId: string) => void;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  profile,
  lang,
  onStartDailyChallenge,
  onClaimMission,
}) => {
  const t = getTranslations(lang);
  const today = getLocalDateString();
  const completedToday = profile.dailyChallengeState?.lastCompletedDate === today;
  const bestScoreToday = completedToday
    ? profile.dailyChallengeState?.bestScoreToday || 0
    : 0;
  const claimedIds =
    profile.dailyChallengeState?.claimedMissionsDate === today
      ? profile.dailyChallengeState.claimedMissionIds || []
      : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Hero Daily 10-Question Challenge Card */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-5 sm:p-8 grid grid-cols-1 md:grid-cols-[1.2fr_auto] gap-6 items-center border-2 border-[#FFD43B]/35">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFD43B]/20 border border-[#FFD43B]/45 text-[#FFD43B] text-xs font-display font-bold">
              <CalendarCheck className="w-4 h-4" />
              {today}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FF963C]/20 border border-[#FF963C]/45 text-[#FFD43B] text-xs font-display font-bold tabular-nums">
              <Flame className="w-4 h-4 fill-[#FF963C] text-[#FF963C]" />
              {profile.currentStreak} {t.streakLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
            {t.dailyChallengeTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#AEBBD9] max-w-xl">
            {t.dailyChallengeSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <GameButton
              variant={completedToday ? 'primary' : 'yellow'}
              size="lg"
              onClick={onStartDailyChallenge}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {completedToday
                  ? `${t.playAgain} (${bestScoreToday}/10)`
                  : t.startDailyChallenge}
              </span>
            </GameButton>

            {completedToday && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#35D982]/20 border border-[#35D982]/45 text-[#35D982] text-sm font-display font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {t.dailyCompletedToday}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 bg-[#10152E] border border-[#AEBBD9]/20 rounded-3xl p-5 min-w-[200px]">
          <MascotAvatar
            mascotId={profile.mascot}
            outfit={profile.equippedOutfit}
            accessory={profile.equippedCosmetics?.accessory}
            size="lg"
          />
          <div className="text-center">
            <p className="text-xs font-bold text-[#AEBBD9]">
              {lang === 'hi' ? 'आज का बोनस इनाम' : 'Daily Bonus Pool'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-1.5 font-display font-bold text-sm">
              <span className="inline-flex items-center gap-1 text-[#22D3EE]">
                <Coins className="w-4 h-4" /> +35
              </span>
              <span className="inline-flex items-center gap-1 text-[#A855F7]">
                <Zap className="w-4 h-4" /> +40 XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Missions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#22D3EE]" />
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            {t.dailyMissionsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DAILY_MISSIONS_CATALOG.map((mission) => {
            const currentVal =
              mission.metric === 'dailyCompleted'
                ? profile.lastActiveDate === today
                  ? profile.dailyCompleted
                  : 0
                : completedToday
                ? 1
                : 0;
            const capped = Math.min(mission.target, currentVal);
            const pct = Math.round((capped / mission.target) * 100);
            const isComplete = capped >= mission.target;
            const isClaimed = claimedIds.includes(mission.id);

            return (
              <GameCard
                key={mission.id}
                glowColor={isComplete && !isClaimed ? '#35D982' : undefined}
                className="p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFD43B]" />
                    <span className="text-xs font-display font-bold text-[#22D3EE] tabular-nums">
                      +{mission.rewardCoins} {t.coinsLabel} · +{mission.rewardXp} XP
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-white">
                    {lang === 'hi' ? mission.titleHi : mission.titleEn}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                    <span className="text-[#AEBBD9]">
                      {capped} / {mission.target}
                    </span>
                    <span className="text-[#35D982]">{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#10152E] overflow-hidden border border-[#AEBBD9]/15">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] to-[#35D982] transition-all duration-300"
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </div>
                </div>

                {isClaimed ? (
                  <div className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#35D982]/15 text-[#35D982] text-xs font-display font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.claimedLabel}</span>
                  </div>
                ) : (
                  <GameButton
                    variant={isComplete ? 'success' : 'secondary'}
                    size="sm"
                    fullWidth
                    disabled={!isComplete}
                    onClick={() => onClaimMission(mission.id)}
                  >
                    {t.claimReward}
                  </GameButton>
                )}
              </GameCard>
            );
          })}
        </div>
      </section>
    </div>
  );
};
