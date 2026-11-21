import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flower2,
  Globe,
  Lock,
  Play,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AchievementId,
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  GameModeId,
  GameSessionResult,
  MASCOTS,
  MEADOW_BG_IMAGE,
  MascotId,
  OutfitId,
  ScreenRoute,
} from './types/game';
import { getDifficultyLabel, getTranslations } from './core/localization';
import { audioService } from './services/audioService';
import {
  computeUnlockedAchievements,
  computeUnlockedOutfits,
  createDefaultProfile,
  loadActiveProfileId,
  loadHistory,
  loadProfiles,
  loadSettings,
  recordCompletedGame,
  saveActiveProfileId,
  saveHistory,
  saveProfiles,
  saveSettings,
} from './services/storageService';
import { SafeImage } from './components/SafeImage';
import { MascotCompanion } from './components/MascotCompanion';
import { GameCatalogView } from './components/GameCatalogView';
import { GameStage } from './components/GameStage';
import { ResultsView } from './components/ResultsView';
import { RewardGardenView } from './components/RewardGardenView';
import { ProfileManagerView } from './components/ProfileManagerView';
import { ParentDashboardView } from './components/ParentDashboardView';
import { Math3DToyboxView } from './components/Math3DToyboxView';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() =>
    loadActiveProfileId(loadProfiles())
  );
  const [history, setHistory] = useState<GameSessionResult[]>(() => loadHistory());

  const [route, setRoute] = useState<ScreenRoute>('welcome');
  const [rewardsInitialTab, setRewardsInitialTab] = useState<
    'garden' | 'achievements' | 'stickers' | 'outfits'
  >('garden');
  const [activeGameId, setActiveGameId] = useState<GameModeId>('count_objects');
  const [lastResult, setLastResult] = useState<{
    gameId: GameModeId;
    correctCount: number;
    wrongCount: number;
    starsEarned: number;
    newlyUnlockedAchievements: AchievementId[];
  } | null>(null);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || profiles[0],
    [profiles, activeProfileId]
  );

  const t = getTranslations(settings.language);

  useEffect(() => {
    audioService.syncSettings(
      settings.soundEnabled,
      settings.musicEnabled,
      settings.voiceEnabled
    );
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const updateActiveProfile = (updated: ChildProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleStartGame = (gameId: GameModeId) => {
    audioService.playClick();
    setActiveGameId(gameId);
    setRoute('play');
  };

  const handleGameComplete = (res: {
    gameId: GameModeId;
    correctCount: number;
    wrongCount: number;
    starsEarned: number;
    durationSeconds: number;
  }) => {
    const { updatedProfile, newSession, newlyUnlockedAchievements } = recordCompletedGame(
      activeProfile,
      res.gameId,
      res.correctCount,
      res.wrongCount,
      res.starsEarned,
      res.durationSeconds
    );
    updateActiveProfile(updatedProfile);
    setHistory((prev) => [newSession, ...prev]);
    setLastResult({
      gameId: res.gameId,
      correctCount: res.correctCount,
      wrongCount: res.wrongCount,
      starsEarned: res.starsEarned,
      newlyUnlockedAchievements,
    });
    setRoute('results');
  };

  const handleCreateProfile = (
    nickname: string,
    mascot: MascotId,
    difficulty: DifficultyLevel
  ) => {
    const newProf = createDefaultProfile(nickname, mascot, difficulty);
    setProfiles((prev) => [...prev, newProf]);
    setActiveProfileId(newProf.id);
    setRoute('home');
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) return prev;
      if (activeProfileId === id) {
        setActiveProfileId(next[0].id);
      }
      return next;
    });
  };

  const handlePlantGardenItem = (itemId: string, cost: number) => {
    const spendable = activeProfile.stars - activeProfile.spentStars;
    if (spendable < cost || activeProfile.plantedGardenIds.includes(itemId)) {
      return;
    }
    const nextDraft: ChildProfile = {
      ...activeProfile,
      spentStars: activeProfile.spentStars + cost,
      plantedGardenIds: [...activeProfile.plantedGardenIds, itemId],
    };
    updateActiveProfile({
      ...nextDraft,
      unlockedAchievements: computeUnlockedAchievements(nextDraft),
    });
  };

  const handleEquipOutfit = (outfitId: OutfitId) => {
    updateActiveProfile({
      ...activeProfile,
      equippedOutfit: outfitId,
    });
  };

  const handleResetProfileProgress = () => {
    updateActiveProfile({
      ...activeProfile,
      stars: 0,
      spentStars: 0,
      dailyCompleted: 0,
      completedGames: {},
      unlockedOutfits: ['default'],
      equippedOutfit: 'default',
      plantedGardenIds: [],
      totalSecondsLearned: 0,
      equationsSolved: 0,
      perfectScores: 0,
      unlockedAchievements: [],
    });
    setHistory((prev) => prev.filter((h) => h.profileId !== activeProfile.id));
  };

  const totalCompletedCount = Object.values(activeProfile.completedGames).reduce(
    (sum, n) => sum + (n || 0),
    0
  );
  const dailyPct = Math.min(
    100,
    Math.round((activeProfile.dailyCompleted / activeProfile.dailyGoal) * 100)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F6FAFF] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setRoute('welcome');
            }}
            className="text-xl font-display font-bold tracking-tight text-[#287BFF] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.appName}
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setRoute('home');
              }}
              className={`hover:text-[#287BFF] transition-colors whitespace-nowrap shrink-0 ${
                route === 'home' ? 'text-[#287BFF]' : ''
              }`}
            >
              {t.navHome}
            </button>
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setRoute('games');
              }}
              className={`hover:text-[#287BFF] transition-colors whitespace-nowrap shrink-0 ${
                route === 'games' ? 'text-[#287BFF]' : ''
              }`}
            >
              {t.navGames}
            </button>
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setRoute('toybox3d');
              }}
              className={`hover:text-[#287BFF] transition-colors whitespace-nowrap shrink-0 ${
                route === 'toybox3d' ? 'text-[#287BFF]' : ''
              }`}
            >
              {t.navToybox3D}
            </button>
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setRewardsInitialTab('garden');
                setRoute('rewards');
              }}
              className={`hover:text-[#287BFF] transition-colors whitespace-nowrap shrink-0 ${
                route === 'rewards' ? 'text-[#287BFF]' : ''
              }`}
            >
              {t.navRewards}
            </button>
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setRoute('profiles');
              }}
              className={`hover:text-[#287BFF] transition-colors whitespace-nowrap shrink-0 ${
                route === 'profiles' ? 'text-[#287BFF]' : ''
              }`}
            >
              {t.navProfiles}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setRoute('parent');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#287BFF] hover:bg-blue-600 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.parentZone}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Compact Bar (kept minimal and under 15% viewport height) */}
      {route !== 'play' && route !== 'toybox3d' && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
          {(
            [
              { id: 'home', label: t.navHome },
              { id: 'games', label: t.navGames },
              { id: 'toybox3d', label: t.navToybox3D },
              { id: 'rewards', label: t.navRewards },
              { id: 'profiles', label: t.navProfiles },
            ] as Array<{ id: ScreenRoute; label: string }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                audioService.playClick();
                setRoute(item.id);
              }}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                route === item.id
                  ? 'bg-[#EEF5FF] text-[#287BFF]'
                  : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content Router */}
      <main className="flex-1 pb-20 md:pb-12">
        {/* WELCOME SCREEN */}
        {route === 'welcome' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Left Welcome Copy */}
              <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-10 flex flex-col justify-between gap-6 shadow-xs">
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#287BFF]">
                    {t.appName} · {t.appSubtitle}
                  </p>
                  <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 leading-tight text-balance">
                    {t.welcomeGreeting}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    {t.welcomeDescription}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        setRoute('home');
                      }}
                      className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#35D66F] hover:bg-emerald-600 text-white text-lg font-display font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>{t.playNow}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        setRoute('toybox3d');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#9755F5] hover:bg-purple-600 text-white font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Box className="w-5 h-5" />
                      <span>{t.launchToybox3D}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        setRoute('profiles');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#EEF5FF] hover:bg-blue-100 text-[#287BFF] font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Users className="w-5 h-5" />
                      <span>{t.switchProfile}: {activeProfile.nickname}</span>
                    </button>
                  </div>

                  {/* Language & Sound Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        setSettings((s) => ({
                          ...s,
                          language: s.language === 'en' ? 'hi' : 'en',
                        }));
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors"
                    >
                      <Globe className="w-4 h-4 text-[#287BFF]" />
                      <span>{settings.language === 'en' ? 'English / हिन्दी' : 'हिन्दी / English'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors"
                    >
                      {settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-[#35D66F]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{settings.soundEnabled ? 'Sound On' : 'Muted'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Visual Meadow & 3 Mascots */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 min-h-[340px] flex flex-col justify-between p-6 shadow-xs">
                <SafeImage
                  src={MEADOW_BG_IMAGE}
                  alt="VS Math Kids Sunny Meadow"
                  fallbackBg="#E0F2FE"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />

                <div className="relative z-10 flex justify-end">
                  <div className="bg-white/95 rounded-2xl px-4 py-2 font-bold text-sm text-amber-800 shadow-sm inline-flex items-center gap-1.5 tabular-nums">
                    <Star className="w-4 h-4 fill-[#FFD83D] text-amber-500" />
                    <span>{activeProfile.stars} ★ · {activeProfile.nickname}</span>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-3 mt-auto">
                  {(['leo', 'bella', 'coco'] as MascotId[]).map((mId) => {
                    const m = MASCOTS[mId];
                    return (
                      <div
                        key={mId}
                        className="bg-white/95 rounded-2xl p-3 text-center shadow-sm flex flex-col items-center"
                      >
                        <SafeImage
                          src={m.image}
                          alt={t[m.nameKey]}
                          className="w-20 h-20 rounded-xl object-cover mb-2 animate-float"
                        />
                        <p className="font-display font-bold text-slate-900 text-sm">
                          {t[m.nameKey]}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 leading-tight mt-0.5">
                          {t[m.roleKey]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOME SCREEN */}
        {route === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
            {/* Hero Learning Strip */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-center">
              <div className="space-y-4">
                <MascotCompanion
                  mascotId={activeProfile.mascot}
                  outfit={activeProfile.equippedOutfit}
                  message={`${activeProfile.nickname}! ${
                    settings.language === 'hi'
                      ? 'आज हम कौन-सा गणित का खेल खेलें?'
                      : 'Which math adventure shall we play today?'
                  }`}
                  lang={settings.language}
                  size="lg"
                />
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStartGame('count_objects')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#287BFF] hover:bg-blue-600 text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t.gameTitles.count_objects}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartGame('math_racing')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF55AE] hover:bg-pink-600 text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t.gameTitles.math_racing}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setRoute('toybox3d');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4EEFF] hover:bg-purple-100 text-[#7C3AED] text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Box className="w-4 h-4 text-[#9755F5]" />
                    <span>{t.launchToybox3D}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setRoute('rewards');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ECFFF2] hover:bg-emerald-100 text-emerald-800 text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Flower2 className="w-4 h-4 text-[#35D66F]" />
                    <span>{t.navRewards}</span>
                  </button>
                </div>
              </div>

              {/* Daily Progress & Stats */}
              <div className="bg-[#F6FAFF] border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{t.dailyGoalTitle}</span>
                  <span className="text-sm font-display font-bold text-[#287BFF] tabular-nums">
                    {activeProfile.dailyCompleted} / {activeProfile.dailyGoal}
                  </span>
                </div>
                <div className="h-3.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#35D66F] rounded-full transition-all duration-300"
                    style={{ width: `${dailyPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                    <Star className="w-5 h-5 fill-[#FFD83D] text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-display font-bold text-slate-900 tabular-nums">
                      {activeProfile.stars}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">{t.starsEarned}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                    <Trophy className="w-5 h-5 text-[#9755F5] mx-auto mb-1" />
                    <p className="text-lg font-display font-bold text-slate-900 tabular-nums">
                      {totalCompletedCount}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">{t.activitiesDone}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-[#287BFF] leading-tight">
                      {getDifficultyLabel(activeProfile.difficulty, t).split(' ')[0]}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      {settings.language === 'hi' ? 'स्तर' : 'Level'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Categories & All 17 Games */}
            <GameCatalogView
              profile={activeProfile}
              lang={settings.language}
              onStartGame={handleStartGame}
              title={t.featuredTitle}
            />
          </div>
        )}

        {/* ALL GAMES SELECTION SCREEN */}
        {route === 'games' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <GameCatalogView
              profile={activeProfile}
              lang={settings.language}
              onStartGame={handleStartGame}
            />
          </div>
        )}

        {/* 3D MATH TOYBOX STUDIO */}
        {route === 'toybox3d' && (
          <Math3DToyboxView
            profile={activeProfile}
            lang={settings.language}
            onBack={() => setRoute('home')}
            onEarnStars={(stars) => {
              const nextStars = activeProfile.stars + stars;
              const nextDraft: ChildProfile = {
                ...activeProfile,
                stars: nextStars,
                unlockedOutfits: computeUnlockedOutfits(
                  nextStars,
                  activeProfile.unlockedOutfits
                ),
              };
              updateActiveProfile({
                ...nextDraft,
                unlockedAchievements: computeUnlockedAchievements(nextDraft),
              });
            }}
          />
        )}

        {/* ACTIVE GAMEPLAY SCREEN */}
        {route === 'play' && (
          <GameStage
            key={activeGameId}
            gameId={activeGameId}
            profile={activeProfile}
            settings={settings}
            onExit={() => setRoute('home')}
            onComplete={handleGameComplete}
          />
        )}

        {/* RESULTS SCREEN */}
        {route === 'results' && lastResult && (
          <ResultsView
            gameId={lastResult.gameId}
            correctCount={lastResult.correctCount}
            wrongCount={lastResult.wrongCount}
            starsEarned={lastResult.starsEarned}
            newlyUnlockedAchievements={lastResult.newlyUnlockedAchievements}
            profile={activeProfile}
            lang={settings.language}
            onPlayAgain={() => setRoute('play')}
            onNextGame={(nextId) => {
              setActiveGameId(nextId);
              setRoute('play');
            }}
            onHome={() => setRoute('home')}
            onViewAchievements={() => {
              setRewardsInitialTab('achievements');
              setRoute('rewards');
            }}
          />
        )}

        {/* REWARD GARDEN, STICKERS & OUTFITS */}
        {route === 'rewards' && (
          <RewardGardenView
            key={rewardsInitialTab}
            profile={activeProfile}
            lang={settings.language}
            initialTab={rewardsInitialTab}
            onPlantGardenItem={handlePlantGardenItem}
            onEquipOutfit={handleEquipOutfit}
          />
        )}

        {/* CHILD PROFILES SCREEN */}
        {route === 'profiles' && (
          <ProfileManagerView
            profiles={profiles}
            activeProfileId={activeProfile.id}
            lang={settings.language}
            onSelectProfile={(id) => {
              setActiveProfileId(id);
              setRoute('home');
            }}
            onCreateProfile={handleCreateProfile}
            onDeleteProfile={handleDeleteProfile}
          />
        )}

        {/* PARENT DASHBOARD */}
        {route === 'parent' && (
          <ParentDashboardView
            profile={activeProfile}
            history={history}
            settings={settings}
            onUpdateSettings={setSettings}
            onUpdateProfile={updateActiveProfile}
            onResetProfileProgress={handleResetProfileProgress}
          />
        )}
      </main>
    </div>
  );
}
