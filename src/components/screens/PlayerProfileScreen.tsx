import React, { useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Globe,
  Lock,
  Music,
  Plus,
  Star,
  Trash2,
  Trophy,
  User,
  Volume2,
} from 'lucide-react';
import {
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  LanguageCode,
  MASCOTS,
  MascotId,
  OUTFIT_CATALOG,
} from '../../types/game';
import { getDifficultyLabel, getTranslations } from '../../core/localization';
import { getPlayerLevelInfo } from '../../services/progressionService';
import { audioService } from '../../services/audioService';
import { GameButton } from '../gaming/GameButton';
import { GameCard } from '../gaming/GameCard';
import { MascotAvatar } from '../gaming/MascotAvatar';
import { XPProgressBar } from '../gaming/XPProgressBar';

interface PlayerProfileScreenProps {
  profiles: ChildProfile[];
  activeProfile: ChildProfile;
  settings: AppSettings;
  onUpdateProfile: (next: ChildProfile) => void;
  onUpdateSettings: (next: AppSettings) => void;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (nickname: string, mascot: MascotId, difficulty: DifficultyLevel) => void;
  onDeleteProfile: (id: string) => void;
  onOpenParentDashboard: () => void;
}

export const PlayerProfileScreen: React.FC<PlayerProfileScreenProps> = ({
  profiles,
  activeProfile,
  settings,
  onUpdateProfile,
  onUpdateSettings,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onOpenParentDashboard,
}) => {
  const t = getTranslations(settings.language);
  const [editingName, setEditingName] = useState(activeProfile.nickname);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMascot, setNewMascot] = useState<MascotId>('leo');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('easy');

  const levelInfo = getPlayerLevelInfo(activeProfile.xp || 0);
  const totalGamesPlayed = Object.values(activeProfile.completedGames).reduce(
    (s, n) => s + (n || 0),
    0
  );

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editingName.trim();
    if (!trimmed) return;
    audioService.playCorrect();
    onUpdateProfile({ ...activeProfile, nickname: trimmed });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    audioService.playCorrect();
    onCreateProfile(trimmed, newMascot, newDifficulty);
    setNewName('');
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Active Hero Profile Card */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <MascotAvatar
              mascotId={activeProfile.mascot}
              outfit={activeProfile.equippedOutfit}
              accessory={activeProfile.equippedCosmetics?.accessory}
              size="xl"
            />
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#22D3EE]">
                {t.playerLevelLabel} {levelInfo.level}
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white truncate">
                {activeProfile.nickname}
              </h1>
              <div className="w-48 sm:w-64">
                <XPProgressBar totalXp={activeProfile.xp || 0} showNumbers />
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveNickname} className="flex flex-wrap items-center gap-2.5 pt-2">
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              maxLength={24}
              placeholder={t.nicknamePlaceholder}
              className="px-4 py-2.5 rounded-xl bg-[#10152E] border border-[#AEBBD9]/25 text-white text-sm font-semibold focus:outline-none focus:border-[#22D3EE]"
            />
            <GameButton type="submit" variant="primary" size="sm">
              {t.saveProfile}
            </GameButton>
            <GameButton
              variant="purple"
              size="sm"
              onClick={onOpenParentDashboard}
            >
              <Lock className="w-4 h-4" />
              <span>{t.parentZone}</span>
            </GameButton>
          </form>
        </div>

        {/* Profile Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
          <div className="bg-[#10152E] border border-[#FFD43B]/35 rounded-2xl p-3.5 text-center">
            <Star className="w-5 h-5 fill-[#FFD43B] text-[#FFD43B] mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-[#FFD43B] tabular-nums">
              {activeProfile.stars}
            </p>
            <p className="text-xs text-[#AEBBD9]">{t.starsEarned}</p>
          </div>
          <div className="bg-[#10152E] border border-[#22D3EE]/35 rounded-2xl p-3.5 text-center">
            <Coins className="w-5 h-5 text-[#22D3EE] mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-[#22D3EE] tabular-nums">
              {activeProfile.coins || 0}
            </p>
            <p className="text-xs text-[#AEBBD9]">{t.coinsLabel}</p>
          </div>
          <div className="bg-[#10152E] border border-[#35D982]/35 rounded-2xl p-3.5 text-center">
            <Trophy className="w-5 h-5 text-[#35D982] mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-[#35D982] tabular-nums">
              {totalGamesPlayed}
            </p>
            <p className="text-xs text-[#AEBBD9]">{t.activitiesDone}</p>
          </div>
          <div className="bg-[#10152E] border border-[#A855F7]/35 rounded-2xl p-3.5 text-center">
            <Award className="w-5 h-5 text-[#A855F7] mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-white tabular-nums">
              {activeProfile.unlockedAchievements.length}
            </p>
            <p className="text-xs text-[#AEBBD9]">{t.achievementsTab}</p>
          </div>
        </div>
      </div>

      {/* Avatar & Audio Quick Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pick Mascot & Outfit */}
        <GameCard className="p-5 space-y-4">
          <h2 className="text-lg font-display font-bold text-white">{t.pickMascot}</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {(['leo', 'bella', 'coco'] as MascotId[]).map((mId) => {
              const m = MASCOTS[mId];
              const active = activeProfile.mascot === mId;
              return (
                <button
                  key={mId}
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    onUpdateProfile({ ...activeProfile, mascot: mId });
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#287BFF]/20 border-[#22D3EE]'
                      : 'bg-[#10152E] border-[#AEBBD9]/15 hover:border-[#AEBBD9]/40'
                  }`}
                >
                  <MascotAvatar mascotId={mId} outfit={activeProfile.equippedOutfit} size="md" glow={active} />
                  <span className="text-xs font-display font-bold text-white">
                    {t[m.nameKey]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#AEBBD9]/15 space-y-2">
            <p className="text-xs font-bold text-[#AEBBD9]">{t.outfitsTab}</p>
            <div className="flex flex-wrap gap-2">
              {OUTFIT_CATALOG.map((o) => {
                const unlocked =
                  activeProfile.stars >= o.unlockStars ||
                  activeProfile.unlockedOutfits.includes(o.id);
                const equipped = activeProfile.equippedOutfit === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      audioService.playClick();
                      onUpdateProfile({ ...activeProfile, equippedOutfit: o.id });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-colors ${
                      equipped
                        ? 'bg-[#35D982] border-[#35D982] text-[#08291A]'
                        : unlocked
                        ? 'bg-[#10152E] border-[#AEBBD9]/25 text-white hover:border-[#22D3EE] cursor-pointer'
                        : 'bg-[#10152E]/60 border-[#AEBBD9]/10 text-[#AEBBD9]/40 cursor-not-allowed'
                    }`}
                  >
                    {settings.language === 'hi' ? o.nameHi : o.nameEn}
                  </button>
                );
              })}
            </div>
          </div>
        </GameCard>

        {/* Quick Audio, Music & Language Settings */}
        <GameCard className="p-5 space-y-4">
          <h2 className="text-lg font-display font-bold text-white">{t.audioSettingsTitle}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <Volume2 className="w-4 h-4 text-[#22D3EE]" />
                {t.soundEffects}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold cursor-pointer ${
                  settings.soundEnabled
                    ? 'bg-[#35D982] text-[#08291A]'
                    : 'bg-[#10152E] text-[#AEBBD9]'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <Music className="w-4 h-4 text-[#A855F7]" />
                {t.backgroundMusic}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled })
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold cursor-pointer ${
                  settings.musicEnabled
                    ? 'bg-[#35D982] text-[#08291A]'
                    : 'bg-[#10152E] text-[#AEBBD9]'
                }`}
              >
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#AEBBD9]/15">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <Globe className="w-4 h-4 text-[#FFD43B]" />
                {t.languageLabel}
              </span>
              <div className="flex gap-2">
                {(['en', 'hi'] as LanguageCode[]).map((lCode) => (
                  <button
                    key={lCode}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      onUpdateSettings({ ...settings, language: lCode });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold cursor-pointer ${
                      settings.language === lCode
                        ? 'bg-[#287BFF] text-white'
                        : 'bg-[#10152E] text-[#AEBBD9]'
                    }`}
                  >
                    {lCode === 'en' ? 'English' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GameCard>
      </div>

      {/* Switch or Add Child Profile */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-display font-bold text-white">{t.switchProfile}</h2>
          <GameButton
            variant="primary"
            size="sm"
            onClick={() => setShowCreateForm((s) => !s)}
          >
            <Plus className="w-4 h-4" />
            <span>{t.createProfile}</span>
          </GameButton>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateSubmit}
            className="gaming-panel rounded-3xl p-5 space-y-4 border border-[#22D3EE]/35"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#AEBBD9] mb-1.5">
                  {t.enterNickname}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t.nicknamePlaceholder}
                  maxLength={24}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10152E] border border-[#AEBBD9]/25 text-white text-sm font-semibold focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AEBBD9] mb-1.5">
                  {t.pickMascot}
                </label>
                <div className="flex gap-2">
                  {(['leo', 'bella', 'coco'] as MascotId[]).map((mId) => (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => setNewMascot(mId)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        newMascot === mId
                          ? 'bg-[#287BFF] border-[#287BFF] text-white'
                          : 'bg-[#10152E] border-[#AEBBD9]/20 text-[#AEBBD9]'
                      }`}
                    >
                      {t[MASCOTS[mId].nameKey].split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AEBBD9] mb-1.5">
                  {t.pickLevel}
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'advanced'] as DifficultyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewDifficulty(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        newDifficulty === lvl
                          ? 'bg-[#35D982] border-[#35D982] text-[#08291A]'
                          : 'bg-[#10152E] border-[#AEBBD9]/20 text-[#AEBBD9]'
                      }`}
                    >
                      {getDifficultyLabel(lvl, t).split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GameButton type="submit" variant="success" size="sm">
                {t.saveProfile}
              </GameButton>
              <GameButton
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                {t.cancel}
              </GameButton>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;
            const lv = getPlayerLevelInfo(p.xp || 0);
            return (
              <GameCard
                key={p.id}
                glowColor={isActive ? '#22D3EE' : undefined}
                className="p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <MascotAvatar mascotId={p.mascot} outfit={p.equippedOutfit} size="md" />
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-base text-white truncate">
                      {p.nickname}
                    </h3>
                    <p className="text-xs text-[#22D3EE] font-bold">
                      LV {lv.level} · {getDifficultyLabel(p.difficulty, t).split(' ')[0]}
                    </p>
                    <p className="text-xs text-[#FFD43B] font-bold mt-0.5 tabular-nums">
                      {p.stars} ★ · {p.coins || 0} {t.coinsLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#AEBBD9]/15">
                  <GameButton
                    variant={isActive ? 'success' : 'primary'}
                    size="sm"
                    fullWidth
                    onClick={() => onSelectProfile(p.id)}
                  >
                    {isActive ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span>{isActive ? t.equippedItem : t.playNow}</span>
                  </GameButton>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        onDeleteProfile(p.id);
                      }}
                      className="p-2.5 rounded-xl bg-[#10152E] text-[#AEBBD9] hover:text-[#FF5B6E] transition-colors cursor-pointer"
                      aria-label={t.deleteProfile}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </GameCard>
            );
          })}
        </div>
      </section>
    </div>
  );
};
