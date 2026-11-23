import React, { useState } from 'react';
import {
  Award,
  Box,
  Check,
  Crown,
  Flower2,
  Heart,
  Lock,
  Medal,
  Rocket,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import {
  ACHIEVEMENT_CATALOG,
  ChildProfile,
  GARDEN_CATALOG,
  LanguageCode,
  MASCOTS,
  MEADOW_BG_IMAGE,
  MascotId,
  OUTFIT_CATALOG,
  OutfitId,
  STICKER_CATALOG,
  StickerItem,
  WORLDS_CATALOG,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import { audioService } from '../../services/audioService';
import { getAchievementProgress } from '../../services/storageService';
import { getWorldCompletedCount } from '../../services/progressionService';
import { MODEL_3D_CATALOG } from '../../three/modelBuilders';
import { GardenArtwork } from '../MathObjects';
import { SafeImage } from '../SafeImage';
import { GameButton } from '../gaming/GameButton';
import { GameCard } from '../gaming/GameCard';
import { MascotAvatar } from '../gaming/MascotAvatar';
import { TrophyCard } from '../rewards/TrophyCard';
import { BadgeCard } from '../rewards/BadgeCard';

export type TrophyRoomTab = 'trophies' | 'achievements' | 'stickers' | 'characters' | 'garden';

interface TrophyRoomScreenProps {
  profile: ChildProfile;
  lang: LanguageCode;
  initialTab?: TrophyRoomTab;
  onPlantGardenItem: (itemId: string, cost: number) => void;
  onEquipOutfit: (outfitId: OutfitId) => void;
  onOpenShop: () => void;
}

function renderStickerSymbol(symbol: StickerItem['symbol']) {
  const cls = 'w-7 h-7 text-white';
  switch (symbol) {
    case 'star':
      return <Star className={`${cls} fill-white`} />;
    case 'rocket':
      return <Rocket className={cls} />;
    case 'crown':
      return <Crown className={cls} />;
    case 'trophy':
      return <Trophy className={cls} />;
    case 'medal':
      return <Medal className={cls} />;
    case 'heart':
      return <Heart className={`${cls} fill-white`} />;
    default:
      return <Sparkles className={cls} />;
  }
}

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({
  profile,
  lang,
  initialTab = 'trophies',
  onPlantGardenItem,
  onEquipOutfit,
  onOpenShop,
}) => {
  const t = getTranslations(lang);
  const [activeTab, setActiveTab] = useState<TrophyRoomTab>(initialTab);
  const spendableStars = Math.max(0, profile.stars - profile.spentStars);

  const unlockedAchCount = ACHIEVEMENT_CATALOG.filter((a) => {
    const { current, target } = getAchievementProgress(profile, a.id);
    return profile.unlockedAchievements.includes(a.id) || current >= target;
  }).length;
  const unlockedStickerCount = STICKER_CATALOG.filter((s) => profile.stars >= s.unlockStars).length;
  const unlockedTrophyCount = WORLDS_CATALOG.filter(
    (w) => getWorldCompletedCount(profile, w.id) >= 5
  ).length;
  const totalItems =
    ACHIEVEMENT_CATALOG.length + STICKER_CATALOG.length + WORLDS_CATALOG.length;
  const collectedTotal = unlockedAchCount + unlockedStickerCount + unlockedTrophyCount;
  const collectionPct = Math.round((collectedTotal / Math.max(1, totalItems)) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Header + Collection Progress */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-display font-bold uppercase tracking-wider text-[#FFD43B]">
            {lang === 'hi' ? 'संग्रह और पुरस्कार' : 'Collection & Honors'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">
            {t.trophyRoomTitle}
          </h1>
          <p className="text-sm text-[#AEBBD9] mt-0.5">{t.trophyRoomSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#10152E] border border-[#FFD43B]/35 rounded-2xl px-4 py-2.5 flex items-center gap-3 tabular-nums">
            <Trophy className="w-6 h-6 text-[#FFD43B]" />
            <div>
              <p className="text-[11px] font-bold text-[#AEBBD9]">
                {lang === 'hi' ? 'कुल संग्रह' : 'Collection'}
              </p>
              <p className="text-base font-display font-bold text-white">
                {collectedTotal} / {totalItems} ({collectionPct}%)
              </p>
            </div>
          </div>

          <GameButton variant="cyan" size="md" onClick={onOpenShop}>
            <ShoppingBag className="w-4 h-4" />
            <span>{t.navShop}</span>
          </GameButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'trophies', label: t.trophiesTab, icon: Trophy, color: '#FFD43B' },
            { id: 'achievements', label: t.achievementsTab, icon: Award, color: '#A855F7' },
            { id: 'stickers', label: t.stickersTab, icon: Sparkles, color: '#22D3EE' },
            { id: 'characters', label: t.charactersTab, icon: Users, color: '#287BFF' },
            { id: 'garden', label: t.gardenTab, icon: Flower2, color: '#35D982' },
          ] as Array<{
            id: TrophyRoomTab;
            label: string;
            icon: React.ComponentType<{ className?: string }>;
            color: string;
          }>
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                audioService.playClick();
                setActiveTab(tab.id);
              }}
              style={
                active
                  ? { backgroundColor: tab.color, color: tab.id === 'trophies' || tab.id === 'stickers' || tab.id === 'garden' ? '#10152E' : '#FFFFFF' }
                  : undefined
              }
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold border whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                active
                  ? 'border-transparent shadow-md'
                  : 'bg-[#222E52] border-[#AEBBD9]/20 text-[#AEBBD9] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. WORLD & MILESTONE TROPHIES */}
      {activeTab === 'trophies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORLDS_CATALOG.map((w) => {
            const done = getWorldCompletedCount(profile, w.id);
            return (
              <TrophyCard
                key={w.id}
                title={
                  lang === 'hi'
                    ? `${w.nameHi} ट्रॉफी`
                    : `${w.nameEn} Explorer Cup`
                }
                subtitle={
                  lang === 'hi'
                    ? `${w.nameHi} में 5 स्तर पूरे करें`
                    : `Complete 5 levels in ${w.nameEn}`
                }
                unlocked={done >= 5}
                progressCurrent={Math.min(done, 5)}
                progressTarget={5}
                accentHex={w.accentHex}
              />
            );
          })}
        </div>
      )}

      {/* 2. ACHIEVEMENTS & HISTORY */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENT_CATALOG.map((ach) => {
              const { current, target } = getAchievementProgress(profile, ach.id);
              const unlocked = profile.unlockedAchievements.includes(ach.id) || current >= target;
              const histEntry = profile.achievementHistory?.find((h) => h.id === ach.id);
              return (
                <BadgeCard
                  key={ach.id}
                  achievement={ach}
                  current={current}
                  target={target}
                  unlocked={unlocked}
                  unlockedAt={histEntry?.unlockedAt}
                  lang={lang}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STICKER BOOK */}
      {activeTab === 'stickers' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STICKER_CATALOG.map((sticker) => {
            const unlocked = profile.stars >= sticker.unlockStars;
            return (
              <GameCard
                key={sticker.id}
                glowColor={unlocked ? sticker.color : undefined}
                className={`p-5 flex flex-col items-center text-center ${
                  !unlocked ? 'opacity-70' : ''
                }`}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow"
                  style={{
                    backgroundColor: unlocked ? sticker.color : '#10152E',
                  }}
                >
                  {unlocked ? (
                    renderStickerSymbol(sticker.symbol)
                  ) : (
                    <Lock className="w-6 h-6 text-[#AEBBD9]" />
                  )}
                </div>
                <p className="font-display font-bold text-sm sm:text-base text-white">
                  {lang === 'hi' ? sticker.nameHi : sticker.nameEn}
                </p>
                <p className="text-xs font-bold mt-1 text-[#FFD43B] tabular-nums">
                  {unlocked ? '✓ Unlocked' : `${t.lockedUntil} ${sticker.unlockStars} ★`}
                </p>
              </GameCard>
            );
          })}
        </div>
      )}

      {/* 4. UNLOCKED CHARACTERS, OUTFITS & 3D MODELS */}
      {activeTab === 'characters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['leo', 'bella', 'coco'] as MascotId[]).map((mId) => {
              const m = MASCOTS[mId];
              const isCurrent = profile.mascot === mId;
              return (
                <GameCard
                  key={mId}
                  glowColor={isCurrent ? m.accentColor : undefined}
                  className="p-5 flex items-center gap-4"
                >
                  <MascotAvatar mascotId={mId} outfit={profile.equippedOutfit} size="lg" />
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      {t[m.nameKey]}
                    </h3>
                    <p className="text-xs text-[#AEBBD9]">{t[m.roleKey]}</p>
                    <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-[#35D982]/20 text-[#35D982]">
                      {isCurrent ? t.equippedItem : t.achievementUnlocked}
                    </span>
                  </div>
                </GameCard>
              );
            })}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white">{t.outfitsTab}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {OUTFIT_CATALOG.map((outfit) => {
                const unlocked =
                  profile.stars >= outfit.unlockStars ||
                  profile.unlockedOutfits.includes(outfit.id);
                const equipped = profile.equippedOutfit === outfit.id;
                return (
                  <GameCard key={outfit.id} className="p-4 flex flex-col justify-between gap-3 text-center">
                    <div className="mx-auto">
                      <MascotAvatar mascotId={profile.mascot} outfit={outfit.id} size="md" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-white">
                        {lang === 'hi' ? outfit.nameHi : outfit.nameEn}
                      </p>
                      <p className="text-[11px] text-[#FFD43B] mt-0.5">
                        {unlocked ? '✓' : `${outfit.unlockStars} ★`}
                      </p>
                    </div>
                    {unlocked ? (
                      <GameButton
                        variant={equipped ? 'success' : 'primary'}
                        size="sm"
                        fullWidth
                        onClick={() => onEquipOutfit(outfit.id)}
                      >
                        {equipped ? t.equipped : t.equipOutfit}
                      </GameButton>
                    ) : (
                      <div className="text-xs font-bold text-[#AEBBD9] py-1.5">
                        <Lock className="w-3.5 h-3.5 inline mr-1" />
                        {outfit.unlockStars} ★
                      </div>
                    )}
                  </GameCard>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-[#22D3EE]" />
              <span>{t.navToybox3D}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MODEL_3D_CATALOG.map((m) => {
                const unlocked =
                  m.unlockStars === 0 ||
                  profile.stars >= m.unlockStars ||
                  profile.unlocked3DModels.includes(m.id);
                return (
                  <GameCard key={m.id} className="p-3.5 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: unlocked ? m.accentColor : '#10152E' }}
                    >
                      {unlocked ? <Box className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-xs sm:text-sm text-white truncate">
                        {lang === 'hi' ? m.nameHi : m.nameEn}
                      </p>
                      <p className="text-[11px] text-[#AEBBD9]">
                        {unlocked ? t.achievementUnlocked : `${m.unlockStars} ★`}
                      </p>
                    </div>
                  </GameCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. REWARD GARDEN */}
      {activeTab === 'garden' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#192344] border border-[#FFD43B]/35 rounded-2xl px-4 py-3">
            <span className="text-sm font-display font-bold text-white">{t.availableStars}</span>
            <span className="inline-flex items-center gap-1.5 text-lg font-display font-bold text-[#FFD43B] tabular-nums">
              <Star className="w-5 h-5 fill-[#FFD43B]" />
              {spendableStars} ★
            </span>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-[#35D982]/35 min-h-[240px] flex items-end">
            <SafeImage
              src={MEADOW_BG_IMAGE}
              alt="Virtual Reward Garden"
              fallbackLabel="Sunny Meadow Garden"
              fallbackBg="#DCFCE7"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10152E]/75 via-transparent to-transparent" />
            <div className="relative z-10 w-full p-5 flex flex-wrap items-end justify-center gap-3 min-h-[220px]">
              {profile.plantedGardenIds.length === 0 ? (
                <div className="bg-[#10152E]/90 border border-[#AEBBD9]/25 rounded-2xl px-5 py-3 text-center">
                  <p className="font-display font-bold text-sm text-white">
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
                      className="bg-white/95 rounded-2xl p-2 shadow-md animate-star-burst"
                      title={lang === 'hi' ? item.nameHi : item.nameEn}
                    >
                      <GardenArtwork kind={item.kind} size={68} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {GARDEN_CATALOG.map((item) => {
              const isPlanted = profile.plantedGardenIds.includes(item.id);
              const canAfford = spendableStars >= item.costStars;
              return (
                <GameCard key={item.id} className="p-4 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                    <GardenArtwork kind={item.kind} size={52} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-white">
                      {lang === 'hi' ? item.nameHi : item.nameEn}
                    </p>
                    <p className="text-xs font-bold text-[#FFD43B] mt-0.5 tabular-nums">
                      {item.costStars} ★
                    </p>
                  </div>

                  {isPlanted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#35D982] bg-[#35D982]/15 px-3 py-2 rounded-xl w-full justify-center">
                      <Check className="w-4 h-4" />
                      {t.planted}
                    </span>
                  ) : (
                    <GameButton
                      variant={canAfford ? 'success' : 'secondary'}
                      size="sm"
                      fullWidth
                      disabled={!canAfford}
                      onClick={() => {
                        audioService.playCelebration();
                        onPlantGardenItem(item.id, item.costStars);
                      }}
                    >
                      {canAfford ? t.plantItem : t.needMoreStars}
                    </GameButton>
                  )}
                </GameCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
