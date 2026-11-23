import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  RotateCcw,
  Star,
} from 'lucide-react';
import {
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  GAME_CATALOG,
  GameModeId,
} from '../types/game';
import { getTranslations } from '../core/localization';
import {
  GeneratedQuestion,
  generateQuestion,
  getPromptText,
} from '../services/questionGenerator';
import { audioService } from '../services/audioService';
import { MascotCompanion } from './MascotCompanion';
import { MathObjectIcon } from './MathObjects';

interface GameStageProps {
  gameId: GameModeId;
  profile: ChildProfile;
  settings: AppSettings;
  hideHeader?: boolean;
  difficultyOverride?: DifficultyLevel;
  questionsOverride?: number;
  hintSignal?: number;
  onProgressChange?: (info: {
    current: number;
    total: number;
    correctCount: number;
    promptText: string;
  }) => void;
  onExit: () => void;
  onComplete: (result: {
    gameId: GameModeId;
    correctCount: number;
    wrongCount: number;
    starsEarned: number;
    durationSeconds: number;
  }) => void;
}

export const GameStage: React.FC<GameStageProps> = ({
  gameId,
  profile,
  settings,
  hideHeader = false,
  difficultyOverride,
  questionsOverride,
  hintSignal = 0,
  onProgressChange,
  onExit,
  onComplete,
}) => {
  const t = getTranslations(settings.language);
  const effectiveDifficulty = difficultyOverride ?? profile.difficulty;
  const gameMeta = useMemo(
    () => GAME_CATALOG.find((g) => g.id === gameId) || GAME_CATALOG[0],
    [gameId]
  );

  const totalQuestions = questionsOverride ?? gameMeta.questionsPerRound;
  const usedSignaturesRef = useRef<Set<string>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  const [quizRange, setQuizRange] = useState<number | undefined>(
    gameId === 'addition_quiz'
      ? effectiveDifficulty === 'easy'
        ? 5
        : effectiveDifficulty === 'medium'
        ? 20
        : 100
      : undefined
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<GeneratedQuestion>(() =>
    generateQuestion(
      gameId,
      effectiveDifficulty,
      profile.customMaxNumber,
      usedSignaturesRef.current,
      quizRange
    )
  );

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongAttemptsOnCurrent, setWrongAttemptsOnCurrent] = useState<Set<string>>(new Set());
  const [tappedObjects, setTappedObjects] = useState<Set<number>>(new Set());
  const [droppedValue, setDroppedValue] = useState<string | number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'retry';
    text: string;
  } | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isDragDropMode =
    question.kind === 'compare_numbers' ||
    question.kind === 'addition_puzzle' ||
    question.kind === 'subtraction_puzzle' ||
    question.kind === 'math_pyramid' ||
    question.kind === 'missing_numbers' ||
    question.kind === 'logic_puzzles' ||
    question.kind === 'counting_100';

  // Timer for Math Practice or session tracking
  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Speak question automatically if voice enabled
  useEffect(() => {
    const prompt = getPromptText(question, settings.language);
    audioService.speak(prompt, settings.language);
    return () => {
      audioService.stopSpeech();
    };
  }, [question, settings.language]);

  useEffect(() => {
    if (!hintSignal) return;
    const wrongChoices = question.choices.filter(
      (c) => String(c) !== String(question.answer) && !wrongAttemptsOnCurrent.has(String(c))
    );
    if (wrongChoices.length > 0) {
      setWrongAttemptsOnCurrent((prev) => new Set(prev).add(String(wrongChoices[0])));
    }
    const hintMsg =
      settings.language === 'hi'
        ? 'ध्यान से गिनें! एक गलत विकल्प हटा दिया गया है।'
        : 'Hint used! One wrong choice was removed—count closely!';
    setFeedback({ type: 'retry', text: hintMsg });
    audioService.speak(getPromptText(question, settings.language), settings.language, true);
  }, [hintSignal]);

  const loadNextQuestion = (nextIdx: number, customQuizRange = quizRange) => {
    setQuestionIndex(nextIdx);
    setQuestion(
      generateQuestion(
        gameId,
        effectiveDifficulty,
        profile.customMaxNumber,
        usedSignaturesRef.current,
        customQuizRange
      )
    );
    setWrongAttemptsOnCurrent(new Set());
    setTappedObjects(new Set());
    setDroppedValue(null);
    setFeedback(null);
    setIsAdvancing(false);
  };

  const handleRangeChange = (range: number) => {
    audioService.playClick();
    setQuizRange(range);
    usedSignaturesRef.current.clear();
    loadNextQuestion(0, range);
  };

  const handleAnswerSubmission = (choice: number | string) => {
    if (isAdvancing) return;

    if (isDragDropMode) {
      setDroppedValue(choice);
    }

    const isRight = String(choice) === String(question.answer);

    if (isRight) {
      audioService.playCorrect();
      const firstTryBonus = wrongAttemptsOnCurrent.size === 0 ? 1 : 0;
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      setIsAdvancing(true);

      const praise =
        t.encouragements[Math.floor(Math.random() * t.encouragements.length)];
      setFeedback({ type: 'correct', text: praise });

      window.setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          audioService.playCelebration();
          const duration = Math.max(
            5,
            Math.floor((Date.now() - startTimeRef.current) / 1000)
          );
          const starsEarned = Math.max(2, nextCorrect + firstTryBonus);
          onComplete({
            gameId,
            correctCount: nextCorrect,
            wrongCount,
            starsEarned,
            durationSeconds: duration,
          });
        } else {
          loadNextQuestion(questionIndex + 1);
        }
      }, 900);
    } else {
      audioService.playGentleTryAgain();
      setWrongCount((prev) => prev + 1);
      setWrongAttemptsOnCurrent((prev) => new Set(prev).add(String(choice)));
      const msg =
        t.tryAgainMessages[Math.floor(Math.random() * t.tryAgainMessages.length)];
      setFeedback({ type: 'retry', text: msg });
      if (isDragDropMode) {
        window.setTimeout(() => setDroppedValue(null), 500);
      }
    }
  };

  const toggleObjectTap = (idx: number) => {
    audioService.playClick();
    setTappedObjects((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, val: number | string) => {
    e.dataTransfer.setData('text/plain', String(val));
  };

  const handleDropOnSlot = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    handleAnswerSubmission(raw);
  };

  const promptText = getPromptText(question, settings.language);
  const progressPercent = Math.round(((questionIndex + (isAdvancing ? 1 : 0)) / totalQuestions) * 100);

  useEffect(() => {
    onProgressChange?.({
      current: questionIndex + 1,
      total: totalQuestions,
      correctCount,
      promptText,
    });
  }, [questionIndex, totalQuestions, correctCount, promptText, onProgressChange]);

  return (
    <div className={hideHeader ? 'w-full' : 'max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8'}>
      {/* Top Game HUD (hidden when wrapped inside Dark Gaming GameplayScreen) */}
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onExit();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backHome}</span>
          </button>

          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
              <span>{t.gameTitles[gameId]}</span>
              <span className="tabular-nums">
                {t.questionProgress} {questionIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%`, backgroundColor: gameMeta.color }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {gameId === 'math_practice' && settings.timerEnabledInPractice && (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold tabular-nums">
                <Clock className="w-4 h-4 text-[#287BFF]" />
                <span>{elapsedSeconds}{t.secondsShort}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF8DB] border border-[#FFD83D] text-amber-900 font-bold tabular-nums">
              <Star className="w-4 h-4 fill-[#FFD83D] text-amber-500" />
              <span>{correctCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Addition Quiz Range Selector (0-5, 0-10, 0-20, 0-100) */}
      {gameId === 'addition_quiz' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {[5, 10, 20, 100].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRangeChange(r)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                quizRange === r
                  ? 'bg-[#287BFF] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              0–{r}
            </button>
          ))}
        </div>
      )}

      {/* Mascot Instruction Bubble */}
      <div className="mb-6">
        <MascotCompanion
          mascotId={profile.mascot}
          outfit={profile.equippedOutfit}
          message={feedback ? feedback.text : promptText}
          lang={settings.language}
          size="sm"
          mood={feedback?.type === 'correct' ? 'celebrating' : 'happy'}
        />
      </div>

      {/* Main Interactive Game Canvas */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
        {/* 1. COUNT OBJECTS */}
        {question.kind === 'count_objects' && (
          <div className="space-y-6">
            <div className="bg-[#F5FAFF] border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-4 min-h-[180px]">
              {Array.from({ length: question.count }, (_, idx) => {
                const isTapped = tappedObjects.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleObjectTap(idx)}
                    className={`relative p-2.5 rounded-2xl transition-transform duration-150 ${
                      isTapped
                        ? 'bg-[#FFD83D]/30 scale-110 ring-2 ring-[#FFD83D]'
                        : 'hover:scale-105 bg-white border border-slate-100 shadow-xs'
                    }`}
                  >
                    <MathObjectIcon type={question.objectType} size={54} />
                    {isTapped && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#287BFF] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                        {Array.from(tappedObjects).sort((a, b) => a - b).indexOf(idx) + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-sm font-semibold text-slate-500">
              {t.tapChoiceHint}
            </p>
          </div>
        )}

        {/* 2. COMPARE NUMBERS */}
        {question.kind === 'compare_numbers' && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5">
            <div className="bg-[#F5FAFF] border border-slate-200 rounded-2xl p-5 flex flex-col items-center">
              <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[110px]">
                {Array.from({ length: question.leftCount }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={40} />
                ))}
              </div>
              <span className="mt-3 text-2xl font-display font-bold text-[#287BFF] tabular-nums">
                {question.leftCount}
              </span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnSlot}
              className={`w-24 h-24 mx-auto rounded-3xl border-3 border-dashed flex items-center justify-center text-4xl font-display font-bold transition-colors ${
                droppedValue !== null
                  ? 'border-[#35D66F] bg-[#ECFFF2] text-[#15803D]'
                  : 'border-[#FF55AE] bg-[#FFF0F7] text-[#FF55AE]'
              }`}
            >
              {droppedValue ?? '?'}
            </div>

            <div className="bg-[#F5FAFF] border border-slate-200 rounded-2xl p-5 flex flex-col items-center">
              <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[110px]">
                {Array.from({ length: question.rightCount }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={40} />
                ))}
              </div>
              <span className="mt-3 text-2xl font-display font-bold text-[#9755F5] tabular-nums">
                {question.rightCount}
              </span>
            </div>
          </div>
        )}

        {/* 3. ADDITION PUZZLE */}
        {question.kind === 'addition_puzzle' && (
          <div className="space-y-6">
            <div className="bg-[#F5FAFF] border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-6">
              <div className="flex flex-wrap gap-1.5 max-w-[200px] justify-center">
                {Array.from({ length: question.a }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={34} />
                ))}
              </div>
              <span className="text-3xl font-display font-bold text-slate-500">+</span>
              <div className="flex flex-wrap gap-1.5 max-w-[200px] justify-center">
                {Array.from({ length: question.b }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={34} />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-3xl sm:text-5xl font-display font-bold tabular-nums">
              {question.missingSlot === 'a' ? (
                <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label={t.dropHere} />
              ) : (
                <NumberBlock value={question.a} color="#287BFF" />
              )}
              <span className="text-slate-600">+</span>
              {question.missingSlot === 'b' ? (
                <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label={t.dropHere} />
              ) : (
                <NumberBlock value={question.b} color="#FF963C" />
              )}
              <span className="text-slate-600">=</span>
              {question.missingSlot === 'sum' ? (
                <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label={t.dropHere} />
              ) : (
                <NumberBlock value={question.sum} color="#35D66F" />
              )}
            </div>
          </div>
        )}

        {/* 4. ADDITION FUN */}
        {question.kind === 'addition_fun' && (
          <div className="space-y-6">
            <div className="bg-[#F5FAFF] border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-2 max-w-[240px] justify-center">
                {Array.from({ length: question.a }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={38} />
                ))}
              </div>
              <span className="text-4xl font-display font-bold text-[#FF963C]">+</span>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-2 max-w-[240px] justify-center">
                {Array.from({ length: question.b }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={38} />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl font-display font-bold tabular-nums">
              <NumberBlock value={question.a} color="#287BFF" />
              <span>+</span>
              <NumberBlock value={question.b} color="#FF963C" />
              <span>=</span>
              <span className="w-20 h-20 rounded-2xl bg-[#FFF8DB] border-2 border-[#FFD83D] flex items-center justify-center text-amber-900">
                {isAdvancing ? question.sum : '?'}
              </span>
            </div>
          </div>
        )}

        {/* 5. ADDITION QUIZ / 8. SUBTRACTION QUIZ */}
        {(question.kind === 'addition_quiz' || question.kind === 'subtraction_quiz') && (
          <div className="py-6 flex items-center justify-center gap-4 sm:gap-6 text-4xl sm:text-6xl font-display font-bold tabular-nums">
            <NumberBlock
              value={question.kind === 'addition_quiz' ? question.a : question.total}
              color="#287BFF"
            />
            <span className="text-slate-700">
              {question.kind === 'addition_quiz' ? '+' : '−'}
            </span>
            <NumberBlock
              value={question.kind === 'addition_quiz' ? question.b : question.subtract}
              color="#FF963C"
            />
            <span className="text-slate-700">=</span>
            <span className="w-24 h-24 rounded-3xl bg-[#FFF8DB] border-2 border-[#FFD83D] flex items-center justify-center text-amber-900">
              {isAdvancing ? question.answer : '?'}
            </span>
          </div>
        )}

        {/* 6. SUBTRACTION PUZZLE */}
        {question.kind === 'subtraction_puzzle' && (
          <div className="space-y-6">
            <div className="bg-[#F5FAFF] border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: question.total }, (_, i) => {
                const isRemoved = i >= question.result;
                return (
                  <div
                    key={i}
                    className={`relative transition-all duration-300 ${
                      isRemoved ? 'opacity-35 scale-90' : 'opacity-100'
                    }`}
                  >
                    <MathObjectIcon type={question.objectType} size={38} />
                    {isRemoved && (
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-rose-600">
                        ×
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-3xl sm:text-5xl font-display font-bold tabular-nums">
              <NumberBlock value={question.total} color="#9755F5" />
              {question.puzzleType === 'operator' ? (
                <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label="?" />
              ) : (
                <span>−</span>
              )}
              {question.puzzleType === 'number' ? (
                <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label={t.dropHere} />
              ) : (
                <NumberBlock value={question.subtract} color="#FF55AE" />
              )}
              <span>=</span>
              <NumberBlock value={question.result} color="#35D66F" />
            </div>
          </div>
        )}

        {/* 7. SUBTRACTION FUN */}
        {question.kind === 'subtraction_fun' && (
          <div className="space-y-6">
            <div className="bg-[#FFF4F9] border border-pink-200 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-4 min-h-[150px]">
              {Array.from({ length: question.total }, (_, i) => {
                const isCrossedOut = i >= question.result;
                return (
                  <div
                    key={i}
                    className={`relative p-2 rounded-2xl transition-all duration-500 ${
                      isCrossedOut
                        ? 'opacity-30 -translate-y-2 scale-90 bg-rose-50'
                        : 'bg-white border border-pink-100 shadow-xs'
                    }`}
                  >
                    <MathObjectIcon type={question.objectType} size={46} />
                    {isCrossedOut && (
                      <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-rose-600">
                        ×
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 text-4xl font-display font-bold tabular-nums">
              <NumberBlock value={question.total} color="#FF55AE" />
              <span>−</span>
              <NumberBlock value={question.subtract} color="#FF963C" />
              <span>=</span>
              <span className="w-20 h-20 rounded-2xl bg-[#FFF8DB] border-2 border-[#FFD83D] flex items-center justify-center text-amber-900">
                {isAdvancing ? question.result : '?'}
              </span>
            </div>
          </div>
        )}

        {/* 9. MATH PYRAMID */}
        {question.kind === 'math_pyramid' && (
          <div className="py-4 flex flex-col items-center gap-3">
            {question.rows.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center justify-center gap-3">
                {row.map((val, cIdx) => {
                  const key = `${rIdx}-${cIdx}`;
                  const isMissing = key === question.missingKey;
                  if (isMissing) {
                    return (
                      <DropSlot
                        key={key}
                        value={droppedValue}
                        onDrop={handleDropOnSlot}
                        label="?"
                      />
                    );
                  }
                  const blockColor =
                    rIdx === 0 ? '#9755F5' : rIdx === 1 ? '#287BFF' : '#35D66F';
                  return <NumberBlock key={key} value={val} color={blockColor} />;
                })}
              </div>
            ))}
          </div>
        )}

        {/* 10. MISSING NUMBERS */}
        {question.kind === 'missing_numbers' && (
          <div className="py-6 flex flex-wrap items-center justify-center gap-4 text-4xl sm:text-5xl font-display font-bold tabular-nums">
            {question.missingPos === 'left' ? (
              <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label="?" />
            ) : (
              <NumberBlock value={question.left} color="#287BFF" />
            )}
            <span>{question.operator === '+' ? '+' : '−'}</span>
            {question.missingPos === 'right' ? (
              <DropSlot value={droppedValue} onDrop={handleDropOnSlot} label="?" />
            ) : (
              <NumberBlock value={question.right} color="#FF963C" />
            )}
            <span>=</span>
            <NumberBlock value={question.result} color="#35D66F" />
          </div>
        )}

        {/* 11. NUMBER RECOGNITION (inside Math Practice) */}
        {question.kind === 'number_recognition' && (
          <div className="py-8 text-center">
            <div className="inline-block px-8 py-5 rounded-3xl bg-[#ECFFF2] border-2 border-[#35D66F]">
              <p className="text-3xl sm:text-5xl font-display font-bold text-slate-900">
                {settings.language === 'hi' ? question.wordHi : question.wordEn}
              </p>
            </div>
          </div>
        )}

        {/* 12. LOGIC PUZZLES */}
        {question.kind === 'logic_puzzles' && (
          <div className="space-y-5 py-4">
            {question.variant === 'sequence' && question.sequence && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {question.sequence.map((val, idx) =>
                  val === null ? (
                    <DropSlot
                      key={idx}
                      value={droppedValue}
                      onDrop={handleDropOnSlot}
                      label="?"
                    />
                  ) : (
                    <NumberBlock key={idx} value={val} color="#FF963C" />
                  )
                )}
              </div>
            )}

            {question.variant === 'grid' && question.grid && (
              <div className="grid grid-cols-2 gap-3 w-fit mx-auto bg-slate-100 p-4 rounded-3xl border border-slate-200">
                {question.grid.flatMap((row, rIdx) =>
                  row.map((val, cIdx) =>
                    val === null ? (
                      <DropSlot
                        key={`${rIdx}-${cIdx}`}
                        value={droppedValue}
                        onDrop={handleDropOnSlot}
                        label="?"
                      />
                    ) : (
                      <NumberBlock
                        key={`${rIdx}-${cIdx}`}
                        value={val}
                        color={rIdx === 0 ? '#287BFF' : '#9755F5'}
                      />
                    )
                  )
                )}
              </div>
            )}

            <p className="text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#FF963C]" />
              <span>{settings.language === 'hi' ? question.hintHi : question.hintEn}</span>
            </p>
          </div>
        )}

        {/* 13. TEN FRAME ADDITION */}
        {question.kind === 'ten_frame' && (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-5 gap-2.5 max-w-md mx-auto bg-[#F5FAFF] border-2 border-[#287BFF]/30 rounded-3xl p-4">
              {Array.from({ length: 10 }, (_, idx) => {
                const isFirst = idx < question.a;
                const isSecond = idx >= question.a && idx < question.sum;
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl bg-white border border-slate-200 flex items-center justify-center"
                  >
                    {isFirst && <div className="w-8 h-8 rounded-full bg-[#287BFF] shadow-xs" />}
                    {isSecond && <div className="w-8 h-8 rounded-full bg-[#FF55AE] shadow-xs" />}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-3xl font-display font-bold text-slate-900 tabular-nums">
              {question.a} + {question.b} = ?
            </p>
          </div>
        )}

        {/* 14. THREE NUMBER ADDITION */}
        {question.kind === 'three_number_addition' && (
          <div className="py-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-3xl sm:text-5xl font-display font-bold tabular-nums">
            <NumberBlock value={question.a} color="#287BFF" />
            <span>+</span>
            <NumberBlock value={question.b} color="#35D66F" />
            <span>+</span>
            <NumberBlock value={question.c} color="#FF963C" />
            <span>=</span>
            <span className="w-20 h-20 rounded-2xl bg-[#FFF8DB] border-2 border-[#FFD83D] flex items-center justify-center text-amber-900">
              {isAdvancing ? question.sum : '?'}
            </span>
          </div>
        )}

        {/* 15. MATH RACING */}
        {question.kind === 'math_racing' && (
          <div className="space-y-6">
            <div className="bg-[#ECFFF2] border border-emerald-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-2">
                <span>{t.carRacerYou}</span>
                <span className="inline-flex items-center gap-1">
                  <Flag className="w-4 h-4 text-rose-500" />
                  {t.carRacerFinish}
                </span>
              </div>
              <div className="relative h-14 bg-slate-700 rounded-2xl overflow-hidden flex items-center px-3">
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-300/70" />
                <div
                  className="relative z-10 transition-all duration-500 ease-out"
                  style={{
                    transform: `translateX(${Math.min(
                      82,
                      Math.round(((correctCount) / totalQuestions) * 82)
                    )}%)`,
                    width: '100%',
                  }}
                >
                  <div className="w-12">
                    <MathObjectIcon type="car" size={46} />
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4 text-center">
              <span className="inline-block px-8 py-5 rounded-3xl bg-[#FFF0F7] border-2 border-[#FF55AE] text-4xl sm:text-5xl font-display font-bold text-slate-900 tabular-nums">
                {question.equation}
              </span>
            </div>
          </div>
        )}

        {/* 16. WORD PROBLEMS */}
        {question.kind === 'word_problems' && (
          <div className="space-y-5">
            <div className="bg-[#F4EEFF] border border-purple-200 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: question.a }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={36} />
                ))}
              </div>
              <span className="text-3xl font-display font-bold text-[#9755F5]">
                {question.operator === '+' ? '+' : '−'}
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: question.b }, (_, i) => (
                  <MathObjectIcon key={i} type={question.objectType} size={36} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 17. COUNTING 1 TO 100 */}
        {question.kind === 'counting_100' && (
          <div className="py-4 flex flex-wrap items-center justify-center gap-3">
            {question.cells.map((cell) =>
              cell.isMissing ? (
                <DropSlot
                  key={cell.num}
                  value={droppedValue}
                  onDrop={handleDropOnSlot}
                  label="?"
                />
              ) : (
                <NumberBlock key={cell.num} value={cell.num} color="#FF963C" />
              )
            )}
          </div>
        )}

        {/* Drag / Tap Helper Line */}
        {isDragDropMode && (
          <p className="text-center text-sm font-semibold text-slate-500 mt-4">
            {t.dragOrTapHint}
          </p>
        )}

        {/* Answer Choice Buttons */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {question.choices.map((choice) => {
            const key = String(choice);
            const wasWrong = wrongAttemptsOnCurrent.has(key);
            const isCorrectReveal = isAdvancing && key === String(question.answer);

            return (
              <button
                key={key}
                type="button"
                draggable={isDragDropMode && !isAdvancing}
                onDragStart={(e) => handleDragStart(e, choice)}
                onClick={() => handleAnswerSubmission(choice)}
                disabled={isAdvancing}
                className={`h-20 sm:h-24 rounded-3xl text-3xl sm:text-4xl font-display font-bold tabular-nums transition-all duration-150 flex items-center justify-center gap-2 border-2 focus-visible:outline-2 focus-visible:outline-[#287BFF] ${
                  isCorrectReveal
                    ? 'bg-[#35D66F] border-[#16A34A] text-white scale-105 shadow-md'
                    : wasWrong
                    ? 'bg-slate-100 border-slate-200 text-slate-400 scale-95'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-[#287BFF] hover:bg-[#EEF5FF] hover:-translate-y-0.5 active:translate-y-0 shadow-xs cursor-pointer'
                }`}
              >
                <span>{choice}</span>
                {isCorrectReveal && <CheckCircle2 className="w-7 h-7" />}
              </button>
            );
          })}
        </div>

        {/* Refresh / Skip Question Button (Gentle Reset) */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              loadNextQuestion(questionIndex);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{settings.language === 'hi' ? 'नया सवाल' : 'Try Different Question'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const NumberBlock: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div
    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-white font-display font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-sm tabular-nums select-none"
    style={{ backgroundColor: color }}
  >
    {value}
  </div>
);

const DropSlot: React.FC<{
  value: string | number | null;
  onDrop: (e: React.DragEvent) => void;
  label: string;
}> = ({ value, onDrop, label }) => (
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    className={`w-20 h-20 rounded-2xl border-3 border-dashed flex items-center justify-center text-3xl font-display font-bold tabular-nums transition-colors ${
      value !== null
        ? 'border-[#35D66F] bg-[#ECFFF2] text-[#15803D]'
        : 'border-[#287BFF] bg-[#EEF5FF] text-[#287BFF]'
    }`}
  >
    {value ?? label}
  </div>
);
