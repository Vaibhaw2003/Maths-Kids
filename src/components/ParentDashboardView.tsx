import React, { useMemo, useState } from 'react';
import {
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
  GameSessionResult,
  LanguageCode,
} from '../types/game';
import {
  SUPPORTED_LANGUAGES,
  getDifficultyLabel,
  getTranslations,
} from '../core/localization';
import { audioService } from '../services/audioService';

interface ParentDashboardViewProps {
  profile: ChildProfile;
  history: GameSessionResult[];
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  onUpdateProfile: (next: ChildProfile) => void;
  onResetProfileProgress: () => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  profile,
  history,
  settings,
  onUpdateSettings,
  onUpdateProfile,
  onResetProfileProgress,
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
      <div className="max-w-md mx-auto px-4 py-12">
        <form
          onSubmit={handleVerifyGate}
          className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#EEF5FF] text-[#287BFF] mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              {t.parentGateTitle}
            </h1>
            <p className="text-sm text-slate-600 mt-1">{t.parentGatePrompt}</p>
          </div>

          <div className="py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-3xl font-display font-bold text-slate-900 tabular-nums">
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
            className="w-full text-center text-2xl font-bold py-3 rounded-2xl border border-slate-300 focus:outline-none focus:border-[#287BFF] tabular-nums"
          />

          {gateError && (
            <p className="text-sm font-bold text-rose-600">{t.parentGateWrong}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#287BFF] hover:bg-blue-600 text-white font-bold transition-colors"
          >
            {t.parentGateVerify}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
          {t.parentDashboardTitle} · {profile.nickname}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">{t.parentSubtitle}</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5 text-[#35D66F]" />}
          label={t.statAccuracy}
          value={`${stats.accuracy}%`}
          bg="#ECFFF2"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-[#287BFF]" />}
          label={t.statTimeSpent}
          value={stats.timeLabel}
          bg="#EEF5FF"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-[#9755F5]" />}
          label={t.statGamesPlayed}
          value={String(stats.sessions)}
          bg="#F4EEFF"
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-amber-500 fill-[#FFD83D]" />}
          label={t.statTotalStars}
          value={String(profile.stars)}
          bg="#FFF8DB"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty & Custom Number Range */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#287BFF]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
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
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                  profile.difficulty === lvl
                    ? 'bg-[#287BFF] border-[#287BFF] text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {getDifficultyLabel(lvl, t).split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700">
              <span>{t.customMaxRangeLabel}</span>
              <span className="tabular-nums text-[#287BFF]">
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
              className="w-full accent-[#287BFF]"
            />
            {profile.customMaxNumber !== null && (
              <button
                type="button"
                onClick={() =>
                  onUpdateProfile({ ...profile, customMaxNumber: null })
                }
                className="text-xs font-bold text-[#287BFF] hover:underline"
              >
                {t.usePresetRange}
              </button>
            )}
          </div>
        </div>

        {/* Audio, Timer & Language Settings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#9755F5]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              {t.audioSettingsTitle}
            </h2>
          </div>

          <ToggleRow
            icon={<Volume2 className="w-4 h-4 text-[#287BFF]" />}
            label={t.soundEffects}
            checked={settings.soundEnabled}
            onChange={(v) => onUpdateSettings({ ...settings, soundEnabled: v })}
          />
          <ToggleRow
            icon={<Music className="w-4 h-4 text-[#FF55AE]" />}
            label={t.backgroundMusic}
            checked={settings.musicEnabled}
            onChange={(v) => onUpdateSettings({ ...settings, musicEnabled: v })}
          />
          <ToggleRow
            icon={<Globe className="w-4 h-4 text-[#35D66F]" />}
            label={t.voiceInstructions}
            checked={settings.voiceEnabled}
            onChange={(v) => onUpdateSettings({ ...settings, voiceEnabled: v })}
          />
          <ToggleRow
            icon={<Clock className="w-4 h-4 text-[#FF963C]" />}
            label={t.practiceTimer}
            checked={settings.timerEnabledInPractice}
            onChange={(v) =>
              onUpdateSettings({ ...settings, timerEnabledInPractice: v })
            }
          />

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-600 mb-2">
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
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {langOpt.nativeName}
                    {!langOpt.ready ? ' (Soon)' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Learning History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-display font-bold text-slate-900">
          {t.gameHistoryTitle}
        </h2>
        {profileHistory.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">{t.noHistoryYet}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs">
                  <th className="py-2 pr-4 font-bold">Game</th>
                  <th className="py-2 px-4 font-bold">{t.correctLabel}</th>
                  <th className="py-2 px-4 font-bold">{t.wrongLabel}</th>
                  <th className="py-2 px-4 font-bold">{t.starsLabel}</th>
                  <th className="py-2 pl-4 font-bold">{t.statTimeSpent}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profileHistory.slice(0, 12).map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">
                      {t.gameTitles[row.gameId]}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-700 tabular-nums">
                      {row.correctCount}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-600 tabular-nums">
                      {row.wrongCount}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-amber-700 tabular-nums">
                      +{row.starsEarned} ★
                    </td>
                    <td className="py-2.5 pl-4 text-slate-500 tabular-nums">
                      {row.durationSeconds}
                      {t.secondsShort}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Child Safety & Reset */}
      <div className="bg-[#EEF5FF] border border-blue-200 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-2xl">
          <ShieldCheck className="w-6 h-6 text-[#287BFF] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-slate-900">
              {t.privacyNoteTitle}
            </h3>
            <p className="text-sm text-slate-700 mt-0.5">{t.privacyNoteBody}</p>
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
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
            confirmResetStep
              ? 'bg-rose-600 text-white'
              : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
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
  bg: string;
}> = ({ icon, label, value, bg }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: bg }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500 truncate">{label}</p>
      <p className="text-xl font-display font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  </div>
);

const ToggleRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}> = ({ icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
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
      className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
        checked ? 'bg-[#35D66F] justify-end' : 'bg-slate-300 justify-start'
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
    </button>
  </div>
);
