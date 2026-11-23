import React from 'react';
import { Globe2, Lock, Play, Sparkles } from 'lucide-react';
import {
  ChildProfile,
  LanguageCode,
  WORLDS_CATALOG,
  WorldId,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import {
  computeUnlockedWorlds,
  getWorldCompletedCount,
  getWorldTotalStars,
} from '../../services/progressionService';
import { WorldMap3DCanvas } from '../../three/WorldMap3DCanvas';
import { GameButton } from '../gaming/GameButton';
import { WorldCard } from '../gaming/WorldCard';

interface WorldMapScreenProps {
  profile: ChildProfile;
  lang: LanguageCode;
  selectedWorldId: WorldId;
  onSelectWorld: (worldId: WorldId) => void;
  onEnterWorld: (worldId: WorldId) => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  profile,
  lang,
  selectedWorldId,
  onSelectWorld,
  onEnterWorld,
}) => {
  const t = getTranslations(lang);
  const unlockedWorlds = computeUnlockedWorlds(profile);
  const activeWorld =
    WORLDS_CATALOG.find((w) => w.id === selectedWorldId) || WORLDS_CATALOG[0];
  const isSelectedUnlocked = unlockedWorlds.includes(activeWorld.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#22D3EE]">
            <Globe2 className="w-4 h-4" />
            <span>{t.worldsTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">
            {t.worldsTitle}
          </h1>
          <p className="text-sm text-[#AEBBD9] mt-0.5">{t.worldsSubtitle}</p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#222E52] border border-[#AEBBD9]/20 text-xs sm:text-sm font-display font-bold text-[#FFD43B] tabular-nums">
          <Sparkles className="w-4 h-4" />
          <span>
            {unlockedWorlds.length} / {WORLDS_CATALOG.length}{' '}
            {lang === 'hi' ? 'द्वीप खुले' : 'Worlds Unlocked'}
          </span>
        </div>
      </div>

      {/* Bright Colorful 3D Adventure Map */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-3 sm:p-4 space-y-3">
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#22D3EE]/35 bg-[#52C4FF]">
          <WorldMap3DCanvas
            selectedWorldId={selectedWorldId}
            unlockedWorlds={unlockedWorlds}
            onSelectWorld={onSelectWorld}
          />
        </div>

        {/* Selected Island Quick Launch Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#10152E]/85 border border-[#AEBBD9]/15 rounded-2xl p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: activeWorld.accentHex }}
              />
              <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                {lang === 'hi' ? activeWorld.nameHi : activeWorld.nameEn}
              </h2>
              <span className="text-xs font-bold text-[#22D3EE] tabular-nums">
                ({getWorldCompletedCount(profile, activeWorld.id)}/100)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#AEBBD9]">
              {lang === 'hi' ? activeWorld.subtitleHi : activeWorld.subtitleEn}
            </p>
          </div>

          {isSelectedUnlocked ? (
            <GameButton
              variant="success"
              size="md"
              onClick={() => onEnterWorld(activeWorld.id)}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.exploreWorld}</span>
            </GameButton>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#222E52] border border-[#FFD43B]/30 text-xs font-bold text-[#FFD43B]">
              <Lock className="w-4 h-4" />
              <span>
                {lang === 'hi'
                  ? activeWorld.unlockRequirementHi
                  : activeWorld.unlockRequirementEn}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 6 Adventure Worlds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORLDS_CATALOG.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            lang={lang}
            isUnlocked={unlockedWorlds.includes(world.id)}
            isSelected={world.id === selectedWorldId}
            completedCount={getWorldCompletedCount(profile, world.id)}
            totalStars={getWorldTotalStars(profile, world.id)}
            onSelect={() => onSelectWorld(world.id)}
            onEnter={() => onEnterWorld(world.id)}
          />
        ))}
      </div>
    </div>
  );
};
