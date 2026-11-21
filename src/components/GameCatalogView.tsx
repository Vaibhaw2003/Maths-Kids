import React, { useState } from 'react';
import {
  Blocks,
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

interface GameCatalogViewProps {
  profile: ChildProfile;
  lang: LanguageCode;
  onStartGame: (gameId: GameModeId) => void;
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
  title,
}) => {
  const t = getTranslations(lang);
  const [category, setCategory] = useState<GameCategory | 'all'>('all');

  const filteredGames =
    category === 'all'
      ? GAME_CATALOG
      : GAME_CATALOG.filter((g) => g.category === category);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold text-slate-900">
          {title ?? t.allGamesTitle}
        </h2>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                audioService.playClick();
                setCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getCategoryLabel(cat, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const playedCount = profile.completedGames[game.id] || 0;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                audioService.playClick();
                onStartGame(game.id);
              }}
              className="group bg-white border border-slate-200 hover:border-[#287BFF] rounded-3xl p-5 text-left transition-all duration-150 hover:-translate-y-0.5 shadow-xs flex flex-col justify-between gap-4 focus-visible:outline-2 focus-visible:outline-[#287BFF]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: game.color }}
                >
                  {getGameIcon(game.id)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-[#287BFF] transition-colors">
                    {t.gameTitles[game.id]}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {t.agesPrefix} {game.recommendedAge} · {game.isCore ? t.coreBadge : t.bonusBadge}
                    {playedCount > 0 ? ` · ${t.completedTimes} ${playedCount}×` : ''}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {t.gameDescriptions[game.id]}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-[#287BFF]">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{game.questionsPerRound} {t.questionProgress}s</span>
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.playNow}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
