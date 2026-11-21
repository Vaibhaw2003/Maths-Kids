import React from 'react';
import { ArrowRight, Home, RotateCcw, Star, Trophy } from 'lucide-react';
import {
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
  profile: ChildProfile;
  lang: LanguageCode;
  onPlayAgain: () => void;
  onNextGame: (nextId: GameModeId) => void;
  onHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  gameId,
  correctCount,
  wrongCount,
  starsEarned,
  profile,
  lang,
  onPlayAgain,
  onNextGame,
  onHome,
}) => {
  const t = getTranslations(lang);
  const currentIdx = GAME_CATALOG.findIndex((g) => g.id === gameId);
  const nextGame = GAME_CATALOG[(currentIdx + 1) % GAME_CATALOG.length];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
