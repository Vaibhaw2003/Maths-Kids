import React, { useState } from 'react';
import {
  Blocks,
  Box,
  Calculator,
  Car,
  Compass,
  Grid3X3,
  Hash,
  Layers,
  MinusCircle,
  Play,
  PlusCircle,
  Puzzle,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  ChildProfile,
  GAME_CATALOG,
  GameCategory,
  GameModeId,
  LanguageCode,
} from '../types/game';
import { getCategoryLabel, getTranslations } from '../core/localization';
import { audioService } from '../services/audioService';
import { GameButton } from './gaming/GameButton';
import { GameCard } from './gaming/GameCard';

interface GameCatalogViewProps {
  profile: ChildProfile;
  lang: LanguageCode;
  onStartGame: (gameId: GameModeId) => void;
  onLaunch3DToybox?: () => void;
  title?: string;
}

const CATEGORIES: Array<GameCategory | 'all'> = [
  'all',
  'counting',
  'addition',
  'subtraction',
  'puzzles',
  'adventure',
];

function getGameIcon(id: GameModeId) {
  switch (id) {
    case 'count_objects':
      return <Hash className="w-6 h-6 text-white" />;
    case 'compare_numbers':
      return <Scale className="w-6 h-6 text-white" />;
    case 'addition_puzzle':
      return <Blocks className="w-6 h-6 text-white" />;
    case 'addition_fun':
    case 'addition_quiz':
    case 'three_number_addition':
      return <PlusCircle className="w-6 h-6 text-white" />;
    case 'subtraction_puzzle':
    case 'subtraction_fun':
    case 'subtraction_quiz':
      return <MinusCircle className="w-6 h-6 text-white" />;
    case 'math_pyramid':
      return <Layers className="w-6 h-6 text-white" />;
    case 'missing_numbers':
      return <Puzzle className="w-6 h-6 text-white" />;
    case 'math_practice':
      return <Calculator className="w-6 h-6 text-white" />;
    case 'logic_puzzles':
    case 'ten_frame':
    case 'counting_100':
      return <Grid3X3 className="w-6 h-6 text-white" />;
    case 'math_racing':
      return <Car className="w-6 h-6 text-white" />;
    case 'word_problems':
      return <Compass className="w-6 h-6 text-white" />;
  }
}

export const GameCatalogView: React.FC<GameCatalogViewProps> = ({
  profile,
  lang,
  onStartGame,
  onLaunch3DToybox,
  title,
}) => {
  const t = getTranslations(lang);
  const [category, setCategory] = useState<GameCategory | 'all'>('all');

  const filteredGames =
    category === 'all'
      ? GAME_CATALOG
      : GAME_CATALOG.filter((g) => g.category === category);

  return (
    <section className="space-y-6">
      {/* Featured 3D Toybox Banner inside Games Hub */}
      {onLaunch3DToybox && (
        <div className="gaming-panel rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#A855F7]/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#287BFF] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Box className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-wider text-[#22D3EE]">
                {lang === 'hi' ? 'इंटरैक्टिव 3D खिलौने' : 'Interactive 3D Studio'}
              </p>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                {lang === 'hi' ? 'VS 3D गणित खिलौना बॉक्स' : 'VS Math 3D Toybox Studio'}
              </h3>
              <p className="text-xs sm:text-sm text-[#AEBBD9]">
                {lang === 'hi'
                  ? 'सेब का पेड़, ट्रेन, रोबो-दोस्त और 3D गणित पहेलियाँ!'
                  : 'Tap Apple Tree, Choo-Choo Train, Robo-Buddy & solve 3D math!'}
              </p>
            </div>
          </div>
          <GameButton variant="purple" size="lg" onClick={onLaunch3DToybox}>
            <Box className="w-5 h-5" />
            <span>{t.launchToybox3D}</span>
          </GameButton>
        </div>
      )}

      {/* Title & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold text-white">
          {title ?? t.allGamesTitle}
        </h2>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#192344] border border-[#AEBBD9]/15 rounded-2xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                audioService.playClick();
                setCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat
                  ? 'bg-[#287BFF] text-white shadow'
                  : 'text-[#AEBBD9] hover:text-white'
              }`}
            >
              {getCategoryLabel(cat, t)}
            </button>
          ))}
        </div>
      </div>

      {/* 17 Game Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const playedCount = profile.completedGames[game.id] || 0;
          return (
            <GameCard
              key={game.id}
              glowColor={game.color}
              onClick={() => {
                audioService.playClick();
                onStartGame(game.id);
              }}
              className="group p-5 text-left flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow"
                  style={{ backgroundColor: game.color }}
                >
                  {getGameIcon(game.id)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-[#22D3EE] transition-colors">
                    {t.gameTitles[game.id]}
                  </h3>
                  <p className="text-xs font-semibold text-[#AEBBD9] mt-0.5">
                    {t.agesPrefix} {game.recommendedAge} · {game.isCore ? t.coreBadge : t.bonusBadge}
                    {playedCount > 0 ? ` · ${t.completedTimes} ${playedCount}×` : ''}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#AEBBD9] leading-relaxed">
                {t.gameDescriptions[game.id]}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[#AEBBD9]/15 text-xs font-display font-bold text-[#22D3EE]">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{game.questionsPerRound} {t.questionProgress}s</span>
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[#35D982]">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.playNow}</span>
                </span>
              </div>
            </GameCard>
          );
        })}
      </div>
    </section>
  );
};
