import React, { useCallback, useState } from 'react';
import { Pause, Star } from 'lucide-react';
import {
  AppSettings,
  ChildProfile,
  GAME_CATALOG,
  GameModeId,
  WORLDS_CATALOG,
  WorldId,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import { getLevelDifficulty } from '../../services/progressionService';
import { audioService } from '../../services/audioService';
import { GameStage } from '../GameStage';
import { GameProgress } from '../gameplay/GameProgress';
import { QuestionPanel } from '../gameplay/QuestionPanel';
import { PauseDialog } from '../gameplay/PauseDialog';

interface GameplayScreenProps {
  gameId: GameModeId;
  worldId?: WorldId;
  levelNumber?: number;
  isDailyChallenge?: boolean;
  profile: ChildProfile;
  settings: AppSettings;
  onExit: () => void;
  onComplete: (result: {
    gameId: GameModeId;
    correctCount: number;
    wrongCount: number;
    starsEarned: number;
    durationSeconds: number;
  }) => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  gameId,
  worldId,
  levelNumber,
  isDailyChallenge = false,
  profile,
  settings,
  onExit,
  onComplete,
}) => {
  const t = getTranslations(settings.language);
  const [paused, setPaused] = useState(false);
  const [restartSeed, setRestartSeed] = useState(0);
  const [hintSignal, setHintSignal] = useState(0);
  const [hudState, setHudState] = useState({
    current: 1,
    total: isDailyChallenge ? 10 : GAME_CATALOG.find((g) => g.id === gameId)?.questionsPerRound || 6,
    correctCount: 0,
    promptText: t.gameTitles[gameId],
  });

  const world = worldId ? WORLDS_CATALOG.find((w) => w.id === worldId) : undefined;
  const effectiveDifficulty = levelNumber
    ? getLevelDifficulty(levelNumber)
    : profile.difficulty;

  const badgeLabel = isDailyChallenge
    ? t.dailyChallengeTitle
    : world && levelNumber
    ? `${settings.language === 'hi' ? world.nameHi : world.nameEn} · Lv ${levelNumber}`
    : t.gameTitles[gameId];

  const handleProgress = useCallback(
    (info: { current: number; total: number; correctCount: number; promptText: string }) => {
      setHudState(info);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#10152E] text-white px-3 sm:px-6 py-4 sm:py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Gaming Gameplay HUD */}
        <div className="gaming-panel rounded-2xl px-3.5 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              aria-label="Pause"
              onClick={() => {
                audioService.playClick();
                setPaused(true);
              }}
              className="w-10 h-10 rounded-xl bg-[#222E52] hover:bg-[#2A3966] border border-[#AEBBD9]/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[#22D3EE] truncate max-w-[140px] sm:max-w-none">
                {badgeLabel}
              </p>
              <p className="text-xs sm:text-sm font-display font-bold text-white truncate">
                {t.gameTitles[gameId]}
              </p>
            </div>
          </div>

          <GameProgress
            label={`${t.questionProgress} ${hudState.current}`}
            current={hudState.current}
            total={hudState.total}
            accentHex={world?.accentHex || '#22D3EE'}
          />

          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#192344] border border-[#FFD43B]/45 text-[#FFD43B] font-display font-bold tabular-nums shrink-0">
            <Star className="w-4 h-4 fill-[#FFD43B]" />
            <span>{hudState.correctCount}</span>
          </div>
        </div>

        {/* Question Prompt & Hint Bar */}
        <QuestionPanel
          title={badgeLabel}
          promptText={hudState.promptText}
          lang={settings.language}
          onHint={() => setHintSignal((s) => s + 1)}
        />

        {/* Bright Kid-Friendly Interactive Playfield */}
        <GameStage
          key={`${gameId}_${restartSeed}`}
          gameId={gameId}
          profile={profile}
          settings={settings}
          hideHeader
          difficultyOverride={effectiveDifficulty}
          questionsOverride={isDailyChallenge ? 10 : undefined}
          hintSignal={hintSignal}
          onProgressChange={handleProgress}
          onExit={onExit}
          onComplete={onComplete}
        />
      </div>

      <PauseDialog
        open={paused}
        lang={settings.language}
        onResume={() => setPaused(false)}
        onRestart={() => {
          setPaused(false);
          setRestartSeed((s) => s + 1);
        }}
        onExit={() => {
          setPaused(false);
          onExit();
        }}
      />
    </div>
  );
};
