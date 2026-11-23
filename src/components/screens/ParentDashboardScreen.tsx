import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Globe,
  Lock,
  Music,
  ShieldCheck,
  Sliders,
  Star,
  Target,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import {
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  GameCategory,
  GameSessionResult,
  LanguageCode,
} from '../../types/game';
import {
  SUPPORTED_LANGUAGES,
  getCategoryLabel,
  getDifficultyLabel,
  getTranslations,
} from '../../core/localization';
import { audioService } from '../../services/audioService';
import { GameButton } from '../gaming/GameButton';
import { GameCard } from '../gaming/GameCard';

interface ParentDashboardScreenProps {
  profile: ChildProfile;
  history: GameSessionResult[];
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  onUpdateProfile: (next: ChildProfile) => void;
  onResetProfileProgress: () => void;
  onBack: () => void;
}

const TOPIC_ORDER: GameCategory[] = [
  'counting',
  'addition',
  'subtraction',
  'puzzles',
  'adventure',
];

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  profile,
  history,
  settings,
  onUpdateSettings,
  onUpdateProfile,
  onResetProfileProgress,
  onBack,
}) => {
  const t = getTranslations(settings.language);
  const [unlocked, setUnlocked] = useState(false);
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [confirmResetStep, setConfirmResetStep] = useState(false);

  const gateProblem = useMemo(() => {
    const a = 12 + (profile.nickname.length % 7);
    const b = 7 + (profile.stars % 5);
    return { a, b, answer: a + b };
  }, [profile.nickname.length, profile.stars]);

  const profileHistory = useMemo(
    () => history.filter((h) => h.profileId === profile.id),
    [history, profile.id]
  );

  const stats = useMemo(() => {
    const totalCorrect = profileHistory.reduce((s, r) => s + r.correctCount, 0);
    const totalWrong = profileHistory.reduce((s, r) => s + r.wrongCount, 0);
    const attempts = totalCorrect + totalWrong;
    const accuracy = attempts > 0 ? Math.round((totalCorrect / attempts) * 100) : 100;
    const totalMinutes = Math.floor(profile.totalSecondsLearned / 60);
    const remSeconds = profile.totalSecondsLearned % 60;
    return {
      accuracy,
      timeLabel:
        totalMinutes > 0
          ? `${totalMinutes}${t.minutesShort} ${remSeconds}${t.secondsShort}`
          : `${remSeconds}${t.secondsShort}`,
      sessions: profileHistory.length,
    };
  }, [profileHistory, profile.totalSecondsLearned, t.minutesShort, t.secondsShort]);

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(gateInput.trim()) === gateProblem.answer) {
      audioService.playCorrect();
      setUnlocked(true);
      setGateError(false);
    } else {
      audioService.playGentleTryAgain();
      setGateError(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <form
          onSubmit={handleVerifyGate}
          className="gaming-panel rounded-3xl p-7 text-center space-y-5 border border-[#22D3EE]/35"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#287BFF]/20 border border-[#287BFF]/45 text-[#22D3EE] mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {t.parentGateTitle}
            </h1>
            <p className="text-sm text-[#AEBBD9] mt-1">{t.parentGatePrompt}</p>
          </div>

          <div className="py-3 px-6 rounded-2xl bg-[#10152E] border border-[#AEBBD9]/20 text-3xl font-display font-bold text-[#FFD43B] tabular-nums">
            {gateProblem.a} + {gateProblem.b} = ?
          </div>

          <input
            type="number"
            inputMode="numeric"
            value={gateInput}
            onChange={(e) => {
              setGateInput(e.target.value);
              setGateError(false);
            }}
            placeholder="?"
            required
            className="w-full text-center text-2xl font-bold py-3 rounded-2xl bg-[#10152E] border border-[#AEBBD9]/30 text-white focus:outline-none focus:border-[#22D3EE] tabular-nums"
          />

          {gateError && (
            <p className="text-sm font-bold text-[#FF5B6E]">{t.parentGateWrong}</p>
          )}

          <div className="flex flex-col gap-2.5">
            <GameButton type="submit" variant="primary" size="lg" fullWidth>
              {t.parentGateVerify}
            </GameButton>
            <GameButton variant="secondary" size="md" fullWidth onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              <span>{t.cancel}</span>
            </GameButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold text-[#22D3EE] hover:text-white mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.navProfile}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            {t.parentDashboardTitle} · {profile.nickname}
          </h1>
          <p className="text-[#AEBBD9] text-sm">{t.parentSubtitle}</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5 text-[#35D982]" />}
          label={t.statAccuracy}
          value={`${stats.accuracy}%`}
          accent="#35D982"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-[#22D3EE]" />}
          label={t.statTimeSpent}
          value={stats.timeLabel}
          accent="#22D3EE"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-[#A855F7]" />}
          label={t.statGamesPlayed}
          value={String(stats.sessions)}
          accent="#A855F7"
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-[#FFD43B] fill-[#FFD43B]" />}
          label={t.statTotalStars}
          value={String(profile.stars)}
          accent="#FFD43B"
        />
      </div>

      {/* Topic-Wise Progress Breakdown */}
      <GameCard className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#22D3EE]" />
          <h2 className="text-lg font-display font-bold text-white">
            {t.topicBreakdownTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TOPIC_ORDER.map((cat) => {
            const stat = profile.topicStats?.[cat] || { attempted: 0, correct: 0 };
            const pct =
              stat.attempted > 0
                ? Math.round((stat.correct / stat.attempted) * 100)
                : 0;
            return (
              <div
                key={cat}
                className="bg-[#10152E] border border-[#AEBBD9]/15 rounded-2xl p-4 space-y-2"
              >
                <p className="text-sm font-display font-bold text-white">
                  {getCategoryLabel(cat, t)}
                </p>
                <p className="text-2xl font-display font-bold text-[#22D3EE] tabular-nums">
                  {stat.attempted > 0 ? `${pct}%` : '—'}
                </p>
                <p className="text-xs text-[#AEBBD9] tabular-nums">
                  {stat.correct} / {stat.attempted} {t.correctLabel}
                </p>
                <div className="h-2 rounded-full bg-[#192344] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] to-[#35D982]"
                    style={{ width: `${stat.attempted > 0 ? Math.max(6, pct) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GameCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty & Custom Number Range */}
        <GameCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="text-lg font-display font-bold text-white">
              {t.difficultyControlsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'advanced'] as DifficultyLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  audioService.playClick();
                  onUpdateProfile({ ...profile, difficulty: lvl });
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-display font-bold border transition-colors cursor-pointer ${
                  profile.difficulty === lvl
                    ? 'bg-[#287BFF] border-[#287BFF] text-white'
                    : 'bg-[#10152E] border-[#AEBBD9]/20 text-[#AEBBD9] hover:text-white'
                }`}
              >
                {getDifficultyLabel(lvl, t).split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-[#AEBBD9]/15">
            <div className="flex items-center justify-between text-sm font-bold text-white">
              <span>{t.customMaxRangeLabel}</span>
              <span className="tabular-nums text-[#22D3EE]">
                {profile.customMaxNumber ? `0–${profile.customMaxNumber}` : t.usePresetRange}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={profile.customMaxNumber ?? 20}
              onChange={(e) =>
                onUpdateProfile({
                  ...profile,
                  customMaxNumber: Number(e.target.value),
                })
              }
              className="w-full accent-[#22D3EE]"
            />
            {profile.customMaxNumber !== null && (
              <button
                type="button"
                onClick={() =>
                  onUpdateProfile({ ...profile, customMaxNumber: null })
                }
                className="text-xs font-bold text-[#22D3EE] hover:underline cursor-pointer"
              >
                {t.usePresetRange}
              </button>
            )}
          </div>
        </GameCard>

        {/* Audio, Volume Sliders, Timer & Language Settings */}
        <GameCard className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#A855F7]" />
            <h2 className="text-lg font-display font-bold text-white">
              {t.audioSettingsTitle}
            </h2>
          </div>

          <ToggleRow
            icon={<Volume2 className="w-4 h-4 text-[#22D3EE]" />}
            label={t.soundEffects}
            checked={settings.soundEnabled}
            onChange={(v) => onUpdateSettings({ ...settings, soundEnabled: v })}
          />
          <div className="flex items-center justify-between gap-3 text-xs text-[#AEBBD9]">
            <span>{t.soundVolumeLabel}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundVolume: Number(e.target.value) })
              }
              className="w-36 accent-[#22D3EE]"
            />
          </div>

          <ToggleRow
            icon={<Music className="w-4 h-4 text-[#FF5B6E]" />}
            label={t.backgroundMusic}
            checked={settings.musicEnabled}
            onChange={(v) => onUpdateSettings({ ...settings, musicEnabled: v })}
          />
          <div className="flex items-center justify-between gap-3 text-xs text-[#AEBBD9]">
            <span>{t.musicVolumeLabel}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, musicVolume: Number(e.target.value) })
              }
              className="w-36 accent-[#A855F7]"
            />
          </div>

          <ToggleRow
            icon={<Globe className="w-4 h-4 text-[#35D982]" />}
            label={t.voiceInstructions}
            checked={settings.voiceEnabled}
            onChange={(v) => onUpdateSettings({ ...settings, voiceEnabled: v })}
          />
          <ToggleRow
            icon={<Clock className="w-4 h-4 text-[#FFD43B]" />}
            label={t.practiceTimer}
            checked={settings.timerEnabledInPractice}
            onChange={(v) =>
              onUpdateSettings({ ...settings, timerEnabledInPractice: v })
            }
          />

          <div className="pt-3 border-t border-[#AEBBD9]/15">
            <p className="text-xs font-bold text-[#AEBBD9] mb-2">
              {t.languageLabel} ({t.futureLanguagesTitle})
            </p>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((langOpt) => {
                const isActive = settings.language === langOpt.code;
                return (
                  <button
                    key={langOpt.code}
                    type="button"
                    disabled={!langOpt.ready}
                    onClick={() => {
                      if (langOpt.ready) {
                        audioService.playClick();
                        onUpdateSettings({
                          ...settings,
                          language: langOpt.code as LanguageCode,
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      isActive
                        ? 'bg-[#287BFF] border-[#287BFF] text-white'
                        : langOpt.ready
                        ? 'bg-[#10152E] border-[#AEBBD9]/25 text-white hover:border-[#22D3EE] cursor-pointer'
                        : 'bg-[#10152E]/50 border-[#AEBBD9]/10 text-[#AEBBD9]/40 cursor-not-allowed'
                    }`}
                  >
                    {langOpt.nativeName}
                    {!langOpt.ready ? ' (Soon)' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </GameCard>
      </div>

      {/* Recent Learning History */}
      <GameCard className="p-6 space-y-4">
        <h2 className="text-lg font-display font-bold text-white">
          {t.gameHistoryTitle}
        </h2>
        {profileHistory.length === 0 ? (
          <p className="text-sm text-[#AEBBD9] py-2">{t.noHistoryYet}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#AEBBD9]/20 text-[#AEBBD9] text-xs">
                  <th className="py-2 pr-4 font-bold">Activity</th>
                  <th className="py-2 px-4 font-bold">{t.correctLabel}</th>
                  <th className="py-2 px-4 font-bold">{t.wrongLabel}</th>
                  <th className="py-2 px-4 font-bold">{t.starsLabel}</th>
                  <th className="py-2 pl-4 font-bold">{t.statTimeSpent}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AEBBD9]/10">
                {profileHistory.slice(0, 12).map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-4 font-bold text-white">
                      {t.gameTitles[row.gameId]}
                      {row.levelNumber ? ` (Lv ${row.levelNumber})` : ''}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#35D982] tabular-nums">
                      {row.correctCount}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#AEBBD9] tabular-nums">
                      {row.wrongCount}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#FFD43B] tabular-nums">
                      +{row.starsEarned} ★
                    </td>
                    <td className="py-2.5 pl-4 text-[#AEBBD9] tabular-nums">
                      {row.durationSeconds}
                      {t.secondsShort}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GameCard>

      {/* Child Safety & Reset */}
      <div className="gaming-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 border border-[#22D3EE]/25">
        <div className="flex items-start gap-3 max-w-2xl">
          <ShieldCheck className="w-6 h-6 text-[#35D982] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-white">
              {t.privacyNoteTitle}
            </h3>
            <p className="text-sm text-[#AEBBD9] mt-0.5">{t.privacyNoteBody}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!confirmResetStep) {
              setConfirmResetStep(true);
            } else {
              onResetProfileProgress();
              setConfirmResetStep(false);
            }
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            confirmResetStep
              ? 'bg-[#FF5B6E] text-white'
              : 'bg-[#10152E] border border-[#FF5B6E]/45 text-[#FF5B6E] hover:bg-[#FF5B6E]/15'
          }`}
        >
          {confirmResetStep ? t.confirmReset : t.resetProgress}
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}> = ({ icon, label, value, accent }) => (
  <GameCard glowColor={accent} className="p-4 flex items-center gap-3">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${accent}22` }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#AEBBD9] truncate">{label}</p>
      <p className="text-xl font-display font-bold text-white tabular-nums">{value}</p>
    </div>
  </GameCard>
);

const ToggleRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}> = ({ icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
      {icon}
      <span>{label}</span>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        audioService.playClick();
        onChange(!checked);
      }}
      className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
        checked ? 'bg-[#35D982] justify-end' : 'bg-[#10152E] justify-start'
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
    </button>
  </div>
);
