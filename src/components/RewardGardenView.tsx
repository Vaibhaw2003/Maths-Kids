import React, { useState } from 'react';
import {
  Award,
  Calculator,
  Check,
  Compass,
  Flame,
  Flower2,
  Lock,
  Shirt,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import {
  ACHIEVEMENT_CATALOG,
  AchievementDefinition,
  ChildProfile,
  GARDEN_CATALOG,
  LanguageCode,
  MEADOW_BG_IMAGE,
  OUTFIT_CATALOG,
  OutfitId,
  STICKER_CATALOG,
} from '../types/game';
import { getTranslations } from '../core/localization';
import { GardenArtwork } from './MathObjects';
import { MascotCompanion } from './MascotCompanion';
import { SafeImage } from './SafeImage';
import { audioService } from '../services/audioService';
import { getAchievementProgress } from '../services/storageService';

interface RewardGardenViewProps {
  profile: ChildProfile;
  lang: LanguageCode;
  initialTab?: 'garden' | 'achievements' | 'stickers' | 'outfits';
  onPlantGardenItem: (itemId: string, cost: number) => void;
  onEquipOutfit: (outfitId: OutfitId) => void;
}

export const RewardGardenView: React.FC<RewardGardenViewProps> = ({
  profile,
  lang,
  initialTab = 'garden',
  onPlantGardenItem,
  onEquipOutfit,
}) => {
  const t = getTranslations(lang);
  const [activeTab, setActiveTab] = useState<'garden' | 'achievements' | 'stickers' | 'outfits'>(initialTab);
  const spendableStars = Math.max(0, profile.stars - profile.spentStars);
  const unlockedAchievementCount = ACHIEVEMENT_CATALOG.filter((a) => {
    const { current, target } = getAchievementProgress(profile, a.id);
    return profile.unlockedAchievements.includes(a.id) || current >= target;
  }).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            {t.rewardsTitle}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t.rewardsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#FFF8DB] border border-[#FFD83D] rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <Star className="w-5 h-5 fill-[#FFD83D] text-amber-500" />
            <div>
              <p className="text-[11px] font-bold text-amber-900 leading-none">{t.availableStars}</p>
              <p className="text-xl font-display font-bold text-amber-800 tabular-nums">
                {spendableStars}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            setActiveTab('garden');
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'garden'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flower2 className="w-4 h-4 text-[#35D66F]" />
          <span>{t.gardenTab}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            setActiveTab('stickers');
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'stickers'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-[#FF55AE]" />
          <span>{t.stickersTab}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            setActiveTab('achievements');
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'achievements'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#FF963C]" />
          <span>{t.achievementsTab}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            setActiveTab('outfits');
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'outfits'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shirt className="w-4 h-4 text-[#9755F5]" />
          <span>{t.outfitsTab}</span>
        </button>
      </div>

      {/* GARDEN TAB */}
      {activeTab === 'garden' && (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[260px] flex items-end">
            <SafeImage
              src={MEADOW_BG_IMAGE}
              alt="Virtual Reward Garden"
              fallbackLabel="Sunny Meadow Garden"
              fallbackBg="#DCFCE7"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            <div className="relative z-10 w-full p-6 flex flex-wrap items-end justify-center gap-4 min-h-[240px]">
              {profile.plantedGardenIds.length === 0 ? (
                <div className="bg-white/95 rounded-2xl px-6 py-4 text-center shadow-sm">
                  <p className="font-bold text-slate-800">
                    {lang === 'hi'
                      ? 'नीचे से अपना पहला पौधा चुनें और बगीचे में लगाएँ!'
                      : 'Pick your first flower or tree below to plant in your meadow!'}
                  </p>
                </div>
              ) : (
                profile.plantedGardenIds.map((id, idx) => {
                  const item = GARDEN_CATALOG.find((g) => g.id === id);
                  if (!item) return null;
                  return (
                    <div
                      key={`${id}-${idx}`}
                      className="bg-white/90 rounded-2xl p-2 shadow-sm animate-star-burst"
                      title={lang === 'hi' ? item.nameHi : item.nameEn}
                    >
                      <GardenArtwork kind={item.kind} size={74} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GARDEN_CATALOG.map((item) => {
              const isPlanted = profile.plantedGardenIds.includes(item.id);
              const canAfford = spendableStars >= item.costStars;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs"
                >
                  <div className="w-20 h-20 rounded-2xl bg-[#F5FAFF] flex items-center justify-center mb-3">
                    <GardenArtwork kind={item.kind} size={60} />
                  </div>
                  <h3 className="font-display font-bold text-slate-900">
                    {lang === 'hi' ? item.nameHi : item.nameEn}
                  </h3>
                  <p className="text-xs font-bold text-amber-700 mt-1 mb-3 tabular-nums">
                    {item.costStars} ★
                  </p>

                  {isPlanted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-[#ECFFF2] px-3 py-2 rounded-xl w-full justify-center">
                      <Check className="w-4 h-4" />
                      {t.planted}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        audioService.playCelebration();
                        onPlantGardenItem(item.id, item.costStars);
                      }}
                      className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-colors ${
                        canAfford
                          ? 'bg-[#35D66F] hover:bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? t.plantItem : t.needMoreStars}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STICKER BOOK TAB */}
      {activeTab === 'stickers' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STICKER_CATALOG.map((sticker) => {
            const unlocked = profile.stars >= sticker.unlockStars;
            return (
              <div
                key={sticker.id}
                className={`border rounded-3xl p-5 flex flex-col items-center text-center transition-all ${
                  unlocked
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                  style={{
                    backgroundColor: unlocked ? `${sticker.color}22` : '#E2E8F0',
                  }}
                >
                  {unlocked ? (
                    <Sparkles className="w-8 h-8" style={{ color: sticker.color }} />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base">
                  {lang === 'hi' ? sticker.nameHi : sticker.nameEn}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 tabular-nums">
                  {unlocked ? t.planted.replace('!', '') : `${t.lockedUntil} ${sticker.unlockStars} ★`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFF8DB] border border-[#FFD83D] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">{t.achievementsSummary}</p>
                <p className="text-xl font-display font-bold text-slate-900 tabular-nums">
                  {unlockedAchievementCount} / {ACHIEVEMENT_CATALOG.length}
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 tabular-nums">
              {profile.equationsSolved} {lang === 'hi' ? 'सवाल हल' : 'Equations Solved'} ·{' '}
              {profile.perfectScores} {lang === 'hi' ? 'परफेक्ट राउंड' : 'Perfect Rounds'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACHIEVEMENT_CATALOG.map((achievement) => {
              const { current, target } = getAchievementProgress(profile, achievement.id);
              const isUnlocked =
                profile.unlockedAchievements.includes(achievement.id) || current >= target;
              const pct = Math.min(100, Math.round((current / target) * 100));

              return (
                <div
                  key={achievement.id}
                  className={`rounded-3xl p-5 border flex flex-col justify-between gap-4 transition-all ${
                    isUnlocked
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isUnlocked ? `${achievement.color}22` : '#E2E8F0',
                      }}
                    >
                      {isUnlocked ? (
                        <AchievementBadgeIcon
                          icon={achievement.icon}
                          color={achievement.color}
                        />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-slate-900 text-base leading-snug">
                        {lang === 'hi' ? achievement.titleHi : achievement.titleEn}
                      </h3>
                      <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                        {lang === 'hi'
                          ? achievement.descriptionHi
                          : achievement.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span
                        className={
                          isUnlocked ? 'text-emerald-700' : 'text-slate-500'
                        }
                      >
                        {isUnlocked ? t.achievementUnlocked : t.achievementInProgress}
                      </span>
                      <span className="text-slate-700 tabular-nums">
                        {current} / {target}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isUnlocked ? '#35D66F' : achievement.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OUTFITS TAB */}
      {activeTab === 'outfits' && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center">
            <MascotCompanion
              mascotId={profile.mascot}
              outfit={profile.equippedOutfit}
              lang={lang}
              size="lg"
              showVoiceButton={false}
            />
            <p className="mt-4 font-display font-bold text-lg text-slate-900">
              {profile.nickname}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1 tabular-nums">
              {t.starsEarned}: {profile.stars} ★
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OUTFIT_CATALOG.map((outfit) => {
              const unlocked =
                profile.unlockedOutfits.includes(outfit.id) ||
                profile.stars >= outfit.unlockStars;
              const isEquipped = profile.equippedOutfit === outfit.id;

              return (
                <div
                  key={outfit.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-display font-bold text-slate-900">
                      {lang === 'hi' ? outfit.nameHi : outfit.nameEn}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 tabular-nums">
                      {unlocked
                        ? `${outfit.unlockStars} ★`
                        : `${t.lockedUntil} ${outfit.unlockStars} ★`}
                    </p>
                  </div>

                  {isEquipped ? (
                    <span className="px-4 py-2 rounded-xl bg-[#EEF5FF] text-[#287BFF] text-xs font-bold whitespace-nowrap shrink-0">
                      {t.equipped}
                    </span>
                  ) : unlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playCorrect();
                        onEquipOutfit(outfit.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#9755F5] hover:bg-purple-600 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      {t.equipOutfit}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold whitespace-nowrap shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      {outfit.unlockStars} ★
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const AchievementBadgeIcon: React.FC<{
  icon: AchievementDefinition['icon'];
  color: string;
}> = ({ icon, color }) => {
  const props = { className: 'w-6 h-6', style: { color } };
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
