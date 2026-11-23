import React, { useEffect, useMemo, useState } from 'react';
import {
  AchievementId,
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  GameModeId,
  GameSessionResult,
  MascotId,
  OutfitId,
  ScreenRoute,
  WorldId,
} from './types/game';
import { getTranslations } from './core/localization';
import { audioService } from './services/audioService';
import {
  computeUnlockedWorlds,
  createInitialWorldProgress,
  equipShopItem,
  getGameForWorldLevel,
  purchaseShopItem,
} from './services/progressionService';
import {
  STARTER_3D_MODELS,
  claimDailyMission,
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
import { AppLayout } from './components/layout/AppLayout';
import { SplashScreen } from './components/screens/SplashScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { WorldMapScreen } from './components/screens/WorldMapScreen';
import { LevelSelectionScreen } from './components/screens/LevelSelectionScreen';
import { GameplayScreen } from './components/screens/GameplayScreen';
import { VictoryScreen } from './components/screens/VictoryScreen';
import { TrophyRoomScreen, TrophyRoomTab } from './components/screens/TrophyRoomScreen';
import { GameShopScreen } from './components/screens/GameShopScreen';
import { DailyChallengeScreen } from './components/screens/DailyChallengeScreen';
import { PlayerProfileScreen } from './components/screens/PlayerProfileScreen';
import { ParentDashboardScreen } from './components/screens/ParentDashboardScreen';
import { GameCatalogView } from './components/GameCatalogView';
import { Math3DToyboxView } from './components/Math3DToyboxView';

interface ActivePlayContext {
  gameId: GameModeId;
  worldId?: WorldId;
  levelNumber?: number;
  isDailyChallenge?: boolean;
}

interface LastResultState extends ActivePlayContext {
  correctCount: number;
  wrongCount: number;
  starsEarned: number;
  xpEarned: number;
  coinsEarned: number;
  alreadyClaimedDaily: boolean;
  newlyUnlockedAchievements: AchievementId[];
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() =>
    loadActiveProfileId(loadProfiles())
  );
  const [history, setHistory] = useState<GameSessionResult[]>(() => loadHistory());

  const [route, setRoute] = useState<ScreenRoute>('splash');
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>('fruit_island');
  const [rewardsInitialTab, setRewardsInitialTab] = useState<TrophyRoomTab>('trophies');
  const [playContext, setPlayContext] = useState<ActivePlayContext>({
    gameId: 'count_objects',
  });
  const [lastResult, setLastResult] = useState<LastResultState | null>(null);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || profiles[0],
    [profiles, activeProfileId]
  );

  const t = getTranslations(settings.language);

  useEffect(() => {
    audioService.syncSettings(
      settings.soundEnabled,
      settings.musicEnabled,
      settings.voiceEnabled,
      settings.soundVolume,
      settings.musicVolume
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

  const handleStartQuickGame = (gameId: GameModeId) => {
    audioService.playClick();
    setPlayContext({ gameId });
    setRoute('play');
  };

  const handleStartWorldLevel = (worldId: WorldId, levelNumber: number) => {
    audioService.playClick();
    setSelectedWorldId(worldId);
    const mode = getGameForWorldLevel(worldId, levelNumber);
    setPlayContext({
      gameId: mode,
      worldId,
      levelNumber,
    });
    setRoute('play');
  };

  const handleStartDailyChallenge = () => {
    audioService.playClick();
    setPlayContext({
      gameId: 'math_practice',
      isDailyChallenge: true,
    });
    setRoute('play');
  };

  const handleGameComplete = (res: {
    gameId: GameModeId;
    correctCount: number;
    wrongCount: number;
    starsEarned: number;
    durationSeconds: number;
  }) => {
    const {
      updatedProfile,
      newSession,
      newlyUnlockedAchievements,
      xpEarned,
      coinsEarned,
      alreadyClaimedDaily,
    } = recordCompletedGame(
      activeProfile,
      res.gameId,
      res.correctCount,
      res.wrongCount,
      res.starsEarned,
      res.durationSeconds,
      {
        worldId: playContext.worldId,
        levelNumber: playContext.levelNumber,
        isDailyChallenge: playContext.isDailyChallenge,
      }
    );

    updateActiveProfile(updatedProfile);
    setHistory((prev) => [newSession, ...prev]);
    setLastResult({
      ...playContext,
      gameId: res.gameId,
      correctCount: res.correctCount,
      wrongCount: res.wrongCount,
      starsEarned: alreadyClaimedDaily ? 0 : res.starsEarned,
      xpEarned,
      coinsEarned,
      alreadyClaimedDaily,
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

  const handleBuyShopItem = (itemId: string) => {
    const res = purchaseShopItem(activeProfile, itemId);
    if (res.success) {
      updateActiveProfile(res.updatedProfile);
    }
  };

  const handleEquipShopItem = (itemId: string) => {
    updateActiveProfile(equipShopItem(activeProfile, itemId));
  };

  const handleClaimDailyMission = (missionId: string) => {
    const res = claimDailyMission(activeProfile, missionId);
    if (res.claimed) {
      audioService.playCelebration();
      updateActiveProfile(res.updatedProfile);
    }
  };

  const handleResetProfileProgress = () => {
    updateActiveProfile({
      ...activeProfile,
      stars: 0,
      spentStars: 0,
      xp: 0,
      coins: 0,
      dailyCompleted: 0,
      completedGames: {},
      unlockedOutfits: ['default'],
      equippedOutfit: 'default',
      plantedGardenIds: [],
      totalSecondsLearned: 0,
      equationsSolved: 0,
      perfectScores: 0,
      currentStreak: 0,
      unlockedAchievements: [],
      achievementHistory: [],
      unlocked3DModels: [...STARTER_3D_MODELS],
      unlockedWorlds: ['fruit_island'],
      worldProgress: createInitialWorldProgress(),
      ownedShopItems: [],
      equippedCosmetics: {
        robotSkin: 'default',
        carSkin: 'default',
        accessory: 'none',
        envTheme: 'default',
      },
      dailyChallengeState: {
        lastCompletedDate: null,
        bestScoreToday: 0,
        claimedMissionsDate: null,
        claimedMissionIds: [],
      },
      topicStats: {},
    });
    setHistory((prev) => prev.filter((h) => h.profileId !== activeProfile.id));
  };

  const handleNavigate = (nextRoute: ScreenRoute) => {
    if (nextRoute === 'rewards') {
      setRewardsInitialTab('trophies');
    }
    setRoute(nextRoute);
  };

  return (
    <AppLayout
      route={route}
      profile={activeProfile}
      settings={settings}
      onToggleSound={() =>
        setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
      }
      onNavigate={handleNavigate}
    >
      {/* 1. SPLASH SCREEN */}
      {route === 'splash' && (
        <SplashScreen
          mascotId={activeProfile.mascot}
          lang={settings.language}
          onFinish={() => setRoute('home')}
        />
      )}

      {/* 2. HOME SCREEN */}
      {route === 'home' && (
        <HomeScreen
          profile={activeProfile}
          lang={settings.language}
          selectedWorldId={selectedWorldId}
          onNavigate={handleNavigate}
          onContinueAdventure={handleStartWorldLevel}
          onStartQuickGame={handleStartQuickGame}
        />
      )}

      {/* 3. 3D ADVENTURE WORLD MAP */}
      {route === 'worlds' && (
        <WorldMapScreen
          profile={activeProfile}
          lang={settings.language}
          selectedWorldId={selectedWorldId}
          onSelectWorld={(wId) => setSelectedWorldId(wId)}
          onEnterWorld={(wId) => {
            setSelectedWorldId(wId);
            setRoute('levels');
          }}
        />
      )}

      {/* 4. 100-LEVEL SELECTION SCREEN */}
      {route === 'levels' && (
        <LevelSelectionScreen
          worldId={selectedWorldId}
          profile={activeProfile}
          lang={settings.language}
          onBack={() => setRoute('worlds')}
          onStartLevel={handleStartWorldLevel}
        />
      )}

      {/* 5. ARCADE & MINI-GAMES CATALOG + 3D TOYBOX LAUNCH */}
      {route === 'games' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          <GameCatalogView
            profile={activeProfile}
            lang={settings.language}
            onStartGame={handleStartQuickGame}
            onLaunch3DToybox={() => setRoute('toybox3d')}
            title={t.allGamesTitle}
          />
        </div>
      )}

      {/* PRESERVED INTERACTIVE 3D MATH TOYBOX STUDIO */}
      {route === 'toybox3d' && (
        <Math3DToyboxView
          profile={activeProfile}
          lang={settings.language}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() =>
            setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
          }
          onBack={() => setRoute('home')}
          onEarnStars={(stars) => {
            setProfiles((prev) =>
              prev.map((p) => {
                if (p.id !== activeProfile.id) return p;
                const nextStars = p.stars + stars;
                const nextDraft: ChildProfile = {
                  ...p,
                  stars: nextStars,
                  coins: (p.coins || 0) + stars * 5,
                  xp: (p.xp || 0) + stars * 10,
                  unlockedOutfits: computeUnlockedOutfits(
                    nextStars,
                    p.unlockedOutfits
                  ),
                };
                return {
                  ...nextDraft,
                  unlockedAchievements: computeUnlockedAchievements(nextDraft),
                  unlockedWorlds: computeUnlockedWorlds(nextDraft),
                };
              })
            );
          }}
          onUnlock3DModel={(modelId) => {
            setProfiles((prev) =>
              prev.map((p) => {
                if (p.id !== activeProfile.id) return p;
                const existing = p.unlocked3DModels || [...STARTER_3D_MODELS];
                if (existing.includes(modelId)) return p;
                return {
                  ...p,
                  unlocked3DModels: [...existing, modelId],
                };
              })
            );
          }}
        />
      )}

      {/* 6. ACTIVE GAMEPLAY SCREEN */}
      {route === 'play' && (
        <GameplayScreen
          gameId={playContext.gameId}
          worldId={playContext.worldId}
          levelNumber={playContext.levelNumber}
          isDailyChallenge={playContext.isDailyChallenge}
          profile={activeProfile}
          settings={settings}
          onExit={() =>
            setRoute(
              playContext.isDailyChallenge
                ? 'daily'
                : playContext.worldId
                ? 'levels'
                : 'home'
            )
          }
          onComplete={handleGameComplete}
        />
      )}

      {/* 7. VICTORY / RESULTS SCREEN */}
      {route === 'results' && lastResult && (
        <VictoryScreen
          gameId={lastResult.gameId}
          worldId={lastResult.worldId}
          levelNumber={lastResult.levelNumber}
          isDailyChallenge={lastResult.isDailyChallenge}
          correctCount={lastResult.correctCount}
          wrongCount={lastResult.wrongCount}
          starsEarned={lastResult.starsEarned}
          xpEarned={lastResult.xpEarned}
          coinsEarned={lastResult.coinsEarned}
          alreadyClaimedDaily={lastResult.alreadyClaimedDaily}
          newlyUnlockedAchievements={lastResult.newlyUnlockedAchievements}
          profile={activeProfile}
          lang={settings.language}
          onPlayAgain={() => setRoute('play')}
          onNextLevel={handleStartWorldLevel}
          onNextGame={handleStartQuickGame}
          onReturnToMap={() => setRoute('levels')}
          onHome={() => setRoute('home')}
          onViewRewards={() => {
            setRewardsInitialTab('achievements');
            setRoute('rewards');
          }}
        />
      )}

      {/* 8. TROPHY ROOM & REWARD GARDEN */}
      {route === 'rewards' && (
        <TrophyRoomScreen
          key={rewardsInitialTab}
          profile={activeProfile}
          lang={settings.language}
          initialTab={rewardsInitialTab}
          onPlantGardenItem={handlePlantGardenItem}
          onEquipOutfit={handleEquipOutfit}
          onOpenShop={() => setRoute('shop')}
        />
      )}

      {/* 9. GAME SHOP */}
      {route === 'shop' && (
        <GameShopScreen
          profile={activeProfile}
          lang={settings.language}
          onBuyItem={handleBuyShopItem}
          onEquipItem={handleEquipShopItem}
        />
      )}

      {/* 10. DAILY CHALLENGE SCREEN */}
      {route === 'daily' && (
        <DailyChallengeScreen
          profile={activeProfile}
          lang={settings.language}
          onStartDailyChallenge={handleStartDailyChallenge}
          onClaimMission={handleClaimDailyMission}
        />
      )}

      {/* 11. PLAYER PROFILE SCREEN */}
      {route === 'profile' && (
        <PlayerProfileScreen
          profiles={profiles}
          activeProfile={activeProfile}
          settings={settings}
          onUpdateProfile={updateActiveProfile}
          onUpdateSettings={setSettings}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            setRoute('home');
          }}
          onCreateProfile={handleCreateProfile}
          onDeleteProfile={handleDeleteProfile}
          onOpenParentDashboard={() => setRoute('parent')}
        />
      )}

      {/* 12. PARENT DASHBOARD (GATED) */}
      {route === 'parent' && (
        <ParentDashboardScreen
          profile={activeProfile}
          history={history}
          settings={settings}
          onUpdateSettings={setSettings}
          onUpdateProfile={updateActiveProfile}
          onResetProfileProgress={handleResetProfileProgress}
          onBack={() => setRoute('profile')}
        />
      )}
    </AppLayout>
  );
}
