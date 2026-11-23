import React, { useMemo, useState } from 'react';
import { ArrowLeft, Play, Star } from 'lucide-react';
import {
  ChildProfile,
  LanguageCode,
  WORLDS_CATALOG,
  WorldId,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import {
  getGameForWorldLevel,
  getWorldCompletedCount,
  getWorldTotalStars,
} from '../../services/progressionService';
import { audioService } from '../../services/audioService';
import { GameButton } from '../gaming/GameButton';
import { LevelNode } from '../gaming/LevelNode';

interface LevelSelectionScreenProps {
  worldId: WorldId;
  profile: ChildProfile;
  lang: LanguageCode;
  onBack: () => void;
  onStartLevel: (worldId: WorldId, levelNumber: number) => void;
}

type TierFilter = 'easy' | 'medium' | 'hard';

export const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({
  worldId,
  profile,
  lang,
  onBack,
  onStartLevel,
}) => {
  const t = getTranslations(lang);
  const world = WORLDS_CATALOG.find((w) => w.id === worldId) || WORLDS_CATALOG[0];
  const worldProg = profile.worldProgress?.[world.id] || {
    highestUnlockedLevel: 1,
    levelStars: {},
  };
  const currentLevel = Math.min(100, worldProg.highestUnlockedLevel || 1);

  const initialTier: TierFilter =
    currentLevel <= 33 ? 'easy' : currentLevel <= 66 ? 'medium' : 'hard';
  const [tier, setTier] = useState<TierFilter>(initialTier);

  const levelNumbers = useMemo(() => {
    const start = tier === 'easy' ? 1 : tier === 'medium' ? 34 : 67;
    const end = tier === 'easy' ? 33 : tier === 'medium' ? 66 : 100;
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [tier]);

  const completedCount = getWorldCompletedCount(profile, world.id);
  const totalStars = getWorldTotalStars(profile, world.id);
  const currentMode = getGameForWorldLevel(world.id, currentLevel);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Top World Banner */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold text-[#22D3EE] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.returnToMap}</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-lg text-[#10152E]"
              style={{
                background: `linear-gradient(135deg, ${world.accentHex}, ${world.secondaryHex})`,
              }}
            >
              {world.order}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {lang === 'hi' ? world.nameHi : world.nameEn}
              </h1>
              <p className="text-xs sm:text-sm text-[#AEBBD9]">
                {lang === 'hi' ? world.subtitleHi : world.subtitleEn}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#10152E] border border-[#AEBBD9]/20 rounded-2xl px-4 py-2.5 flex items-center gap-4 tabular-nums">
            <div>
              <p className="text-[11px] font-bold text-[#AEBBD9]">{t.levelsCompleted}</p>
              <p className="text-base font-display font-bold text-white">
                {completedCount} / 100
              </p>
            </div>
            <div className="w-px h-8 bg-[#AEBBD9]/20" />
            <div>
              <p className="text-[11px] font-bold text-[#AEBBD9]">{t.starsEarned}</p>
              <p className="text-base font-display font-bold text-[#FFD43B] inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#FFD43B]" />
                {totalStars} / 300
              </p>
            </div>
          </div>

          <GameButton
            variant="success"
            size="lg"
            onClick={() => onStartLevel(world.id, currentLevel)}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {t.startLevel} {currentLevel}
            </span>
          </GameButton>
        </div>
      </div>

      {/* Difficulty Tier Selector (100 Levels grouped into Easy 1-33, Medium 34-66, Hard 67-100) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'easy', label: t.tierEasy, color: '#35D982' },
              { id: 'medium', label: t.tierMedium, color: '#287BFF' },
              { id: 'hard', label: t.tierHard, color: '#A855F7' },
            ] as Array<{ id: TierFilter; label: string; color: string }>
          ).map((tab) => {
            const active = tier === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setTier(tab.id);
                }}
                style={
                  active
                    ? {
                        backgroundColor: tab.color,
                        color: tab.id === 'easy' ? '#08291A' : '#FFFFFF',
                      }
                    : undefined
                }
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold border transition-all cursor-pointer ${
                  active
                    ? 'border-transparent shadow-md'
                    : 'bg-[#222E52] border-[#AEBBD9]/20 text-[#AEBBD9] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-semibold text-[#AEBBD9]">
          {lang === 'hi' ? 'अगला खेल:' : 'Next Quest:'}{' '}
          <span className="text-[#22D3EE] font-bold">{t.gameTitles[currentMode]}</span>
        </p>
      </div>

      {/* Connected Level Path Grid */}
      <div className="gaming-card rounded-[var(--radius-panel)] p-4 sm:p-6">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 sm:gap-3">
          {levelNumbers.map((lvl) => {
            const stars = worldProg.levelStars[lvl] || 0;
            const isUnlocked = lvl <= currentLevel;
            const isCurrent = lvl === currentLevel;
            return (
              <LevelNode
                key={lvl}
                levelNumber={lvl}
                starsEarned={stars}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                accentHex={world.accentHex}
                onSelect={(selectedLvl) => onStartLevel(world.id, selectedLvl)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
