import React, { useState } from 'react';
import { Check, Plus, Trash2, User } from 'lucide-react';
import {
  ChildProfile,
  DifficultyLevel,
  LanguageCode,
  MASCOTS,
  MascotId,
} from '../types/game';
import { getDifficultyLabel, getTranslations } from '../core/localization';
import { SafeImage } from './SafeImage';
import { audioService } from '../services/audioService';

interface ProfileManagerViewProps {
  profiles: ChildProfile[];
  activeProfileId: string;
  lang: LanguageCode;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (nickname: string, mascot: MascotId, difficulty: DifficultyLevel) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileManagerView: React.FC<ProfileManagerViewProps> = ({
  profiles,
  activeProfileId,
  lang,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}) => {
  const t = getTranslations(lang);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState('');
  const [mascot, setMascot] = useState<MascotId>('leo');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;
    audioService.playCorrect();
    onCreateProfile(trimmed, mascot, difficulty);
    setNickname('');
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            {t.chooseHero}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t.appSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            setShowForm((s) => !s);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#287BFF] hover:bg-blue-600 text-white font-bold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{t.createProfile}</span>
        </button>
      </div>

      {/* Add Profile Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-xl font-display font-bold text-slate-900">
            {t.createProfile}
          </h2>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t.enterNickname}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.nicknamePlaceholder}
              maxLength={24}
              required
              className="w-full max-w-md px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-[#287BFF]"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">{t.pickMascot}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['leo', 'bella', 'coco'] as MascotId[]).map((mId) => {
                const m = MASCOTS[mId];
                const selected = mascot === mId;
                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setMascot(mId);
                    }}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                      selected
                        ? 'border-[#287BFF] bg-[#EEF5FF]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <SafeImage
                      src={m.image}
                      alt={t[m.nameKey]}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <p className="font-display font-bold text-slate-900">{t[m.nameKey]}</p>
                      <p className="text-xs font-medium text-slate-500">{t[m.roleKey]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">{t.pickLevel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['easy', 'medium', 'advanced'] as DifficultyLevel[]).map((lvl) => {
                const selected = difficulty === lvl;
                const desc =
                  lvl === 'easy'
                    ? t.levelEasyDesc
                    : lvl === 'medium'
                    ? t.levelMediumDesc
                    : t.levelAdvancedDesc;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setDifficulty(lvl);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selected
                        ? 'border-[#35D66F] bg-[#ECFFF2]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-display font-bold text-slate-900">
                      {getDifficultyLabel(lvl, t)}
                    </p>
                    <p className="text-xs font-medium text-slate-600 mt-1">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#35D66F] hover:bg-emerald-600 text-white font-bold transition-colors"
            >
              {t.saveProfile}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Existing Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const m = MASCOTS[p.mascot];
          const isActive = p.id === activeProfileId;
          const gamesCount = Object.values(p.completedGames).reduce(
            (sum, v) => sum + (v || 0),
            0
          );

          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between gap-4 ${
                isActive ? 'border-[#287BFF] shadow-sm' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <SafeImage
                  src={m.image}
                  alt={p.nickname}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-lg text-slate-900 truncate">
                    {p.nickname}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {getDifficultyLabel(p.difficulty, t)}
                  </p>
                  <p className="text-xs font-bold text-amber-700 mt-1 tabular-nums">
                    {p.stars} ★ · {gamesCount} {t.activitiesDone}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    onSelectProfile(p.id);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-[#EEF5FF] text-[#287BFF]'
                      : 'bg-[#287BFF] hover:bg-blue-600 text-white'
                  }`}
                >
                  {isActive ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{isActive ? t.equipped.replace('Wearing', 'Active').replace('पहना हुआ', 'सक्रिय') : t.playNow}</span>
                </button>

                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      onDeleteProfile(p.id);
                    }}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label={t.deleteProfile}
                    title={t.deleteProfile}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
