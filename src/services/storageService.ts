import {
  ACHIEVEMENT_CATALOG,
  AchievementId,
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  GameModeId,
  GameSessionResult,
  MascotId,
  OUTFIT_CATALOG,
  OutfitId,
  WorldId,
} from '../types/game';
import {
  calculateLevelStars,
  computeUnlockedWorlds,
  createInitialWorldProgress,
  getGameCategory,
  getLocalDateString,
  getYesterdayLocalDateString,
} from './progressionService';

const PROFILES_KEY = 'vs_math_kids_profiles_v1';
const ACTIVE_PROFILE_KEY = 'vs_math_kids_active_profile_v1';
const HISTORY_KEY = 'vs_math_kids_history_v1';
const SETTINGS_KEY = 'vs_math_kids_settings_v1';

export const STARTER_3D_MODELS = [
  'race_car',
  'rocket',
  'apple_tree',
  'toy_train',
  'math_robot',
  'star_trophy',
];

export interface DailyMissionDef {
  id: string;
  titleEn: string;
  titleHi: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  metric: 'dailyCompleted' | 'dailyChallenge' | 'equationsToday';
}

export const DAILY_MISSIONS_CATALOG: DailyMissionDef[] = [
  {
    id: 'mission_play_1',
    titleEn: 'Complete 1 Adventure Round Today',
    titleHi: 'आज 1 एडवेंचर राउंड पूरा करें',
    target: 1,
    rewardCoins: 25,
    rewardXp: 30,
    metric: 'dailyCompleted',
  },
  {
    id: 'mission_play_3',
    titleEn: 'Hit Your Daily Goal (3 Rounds)',
    titleHi: 'आज का लक्ष्य (3 राउंड) पूरा करें',
    target: 3,
    rewardCoins: 50,
    rewardXp: 60,
    metric: 'dailyCompleted',
  },
  {
    id: 'mission_daily_challenge',
    titleEn: 'Finish the 10-Question Daily Challenge',
    titleHi: '10 सवालों की दैनिक चुनौती जीतें',
    target: 1,
    rewardCoins: 60,
    rewardXp: 80,
    metric: 'dailyChallenge',
  },
];

export function createDefaultProfile(
  nickname = 'Aarav',
  mascot: MascotId = 'leo',
  difficulty: DifficultyLevel = 'easy'
): ChildProfile {
  return {
    id: `child_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    nickname,
    mascot,
    difficulty,
    customMaxNumber: null,
    stars: 6,
    spentStars: 0,
    xp: 0,
    coins: 45,
    dailyCompleted: 0,
    dailyGoal: 3,
    lastActiveDate: getLocalDateString(),
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
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  musicEnabled: false,
  voiceEnabled: true,
  language: 'en',
  timerEnabledInPractice: false,
  soundVolume: 0.85,
  musicVolume: 0.5,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable
  }
}

export function loadProfiles(): ChildProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      const starter = [
        createDefaultProfile('Leo Explorer', 'leo', 'easy'),
        createDefaultProfile('Bella Learner', 'bella', 'medium'),
      ];
      saveProfiles(starter);
      return starter;
    }
    const parsed = JSON.parse(raw) as Partial<ChildProfile>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fallback = [createDefaultProfile('Math Star', 'leo', 'easy')];
      saveProfiles(fallback);
      return fallback;
    }
    const today = getLocalDateString();
    const yesterday = getYesterdayLocalDateString();
    return parsed.map((p) => {
      const prevStreak = typeof p.currentStreak === 'number' ? p.currentStreak : 0;
      const isNewDay = p.lastActiveDate !== today;
      const keptStreakFromYesterday =
        p.lastActiveDate === yesterday && (p.dailyCompleted || 0) >= (p.dailyGoal || 3);
      const nextStreak = isNewDay ? (keptStreakFromYesterday ? prevStreak : 0) : prevStreak;

      const baseWorldProgress = createInitialWorldProgress();
      const mergedWorldProgress = {
        ...baseWorldProgress,
        ...(p.worldProgress || {}),
      };

      const prevDailyState = p.dailyChallengeState || {
        lastCompletedDate: null,
        bestScoreToday: 0,
        claimedMissionsDate: null,
        claimedMissionIds: [],
      };
      const isSameClaimDay = prevDailyState.claimedMissionsDate === today;
      const isSameChallengeDay = prevDailyState.lastCompletedDate === today;

      const normalized: ChildProfile = {
        id: p.id || `child_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nickname: p.nickname || 'Math Star',
        mascot: p.mascot || 'leo',
        difficulty: p.difficulty || 'easy',
        customMaxNumber: p.customMaxNumber ?? null,
        stars: typeof p.stars === 'number' ? p.stars : 0,
        spentStars: typeof p.spentStars === 'number' ? p.spentStars : 0,
        xp: typeof p.xp === 'number' ? p.xp : (p.equationsSolved || 0) * 12,
        coins: typeof p.coins === 'number' ? p.coins : Math.max(45, (p.stars || 0) * 5),
        dailyCompleted: isNewDay ? 0 : p.dailyCompleted || 0,
        dailyGoal: p.dailyGoal || 3,
        lastActiveDate: today,
        completedGames: p.completedGames || {},
        unlockedOutfits: Array.isArray(p.unlockedOutfits) && p.unlockedOutfits.length > 0 ? p.unlockedOutfits : ['default'],
        equippedOutfit: p.equippedOutfit || 'default',
        plantedGardenIds: Array.isArray(p.plantedGardenIds) ? p.plantedGardenIds : [],
        totalSecondsLearned: typeof p.totalSecondsLearned === 'number' ? p.totalSecondsLearned : 0,
        equationsSolved: typeof p.equationsSolved === 'number' ? p.equationsSolved : 0,
        perfectScores: typeof p.perfectScores === 'number' ? p.perfectScores : 0,
        currentStreak: nextStreak,
        unlockedAchievements: Array.isArray(p.unlockedAchievements) ? p.unlockedAchievements : [],
        achievementHistory: Array.isArray(p.achievementHistory) ? p.achievementHistory : [],
        unlocked3DModels:
          Array.isArray(p.unlocked3DModels) && p.unlocked3DModels.length > 0
            ? Array.from(new Set([...STARTER_3D_MODELS, ...p.unlocked3DModels]))
            : [...STARTER_3D_MODELS],
        unlockedWorlds: ['fruit_island'],
        worldProgress: mergedWorldProgress,
        ownedShopItems: Array.isArray(p.ownedShopItems) ? p.ownedShopItems : [],
        equippedCosmetics: {
          robotSkin: p.equippedCosmetics?.robotSkin || 'default',
          carSkin: p.equippedCosmetics?.carSkin || 'default',
          accessory: p.equippedCosmetics?.accessory || 'none',
          envTheme: p.equippedCosmetics?.envTheme || 'default',
        },
        dailyChallengeState: {
          lastCompletedDate: prevDailyState.lastCompletedDate || null,
          bestScoreToday: isSameChallengeDay ? prevDailyState.bestScoreToday || 0 : 0,
          claimedMissionsDate: isSameClaimDay ? today : null,
          claimedMissionIds: isSameClaimDay ? prevDailyState.claimedMissionIds || [] : [],
        },
        topicStats: p.topicStats || {},
      };

      const syncedAchievements = computeUnlockedAchievements(normalized);
      const existingHistIds = new Set(normalized.achievementHistory.map((h) => h.id));
      const addedHistory = syncedAchievements
        .filter((id) => !existingHistIds.has(id))
        .map((id) => ({ id, unlockedAt: Date.now() }));

      return {
        ...normalized,
        unlockedAchievements: syncedAchievements,
        achievementHistory: [...normalized.achievementHistory, ...addedHistory],
        unlockedWorlds: computeUnlockedWorlds(normalized),
      };
    });
  } catch {
    return [createDefaultProfile('Math Star', 'leo', 'easy')];
  }
}

export function saveProfiles(profiles: ChildProfile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage errors
  }
}

export function loadActiveProfileId(profiles: ChildProfile[]): string {
  try {
    const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (saved && profiles.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore
  }
  return profiles[0].id;
}

export function saveActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // Ignore
  }
}

export function loadHistory(): GameSessionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: GameSessionResult[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 140)));
  } catch {
    // Ignore
  }
}

export function computeUnlockedOutfits(totalStars: number, existing: OutfitId[]): OutfitId[] {
  const next = new Set<OutfitId>(existing);
  OUTFIT_CATALOG.forEach((outfit) => {
    if (totalStars >= outfit.unlockStars) {
      next.add(outfit.id);
    }
  });
  return Array.from(next);
}

export function getAchievementProgress(
  profile: ChildProfile,
  achievementId: AchievementId
): { current: number; target: number } {
  const def = ACHIEVEMENT_CATALOG.find((a) => a.id === achievementId);
  const target = def?.target ?? 1;
  const totalGames = Object.values(profile.completedGames).reduce(
    (sum, n) => sum + (n || 0),
    0
  );
  const uniqueGames = Object.values(profile.completedGames).filter(
    (n) => (n || 0) > 0
  ).length;

  let current = 0;
  switch (achievementId) {
    case 'first_step':
      current = totalGames;
      break;
    case 'perfect_score':
    case 'perfect_streak_5':
      current = profile.perfectScores;
      break;
    case 'equations_25':
    case 'equations_100':
      current = profile.equationsSolved;
      break;
    case 'math_explorer':
    case 'master_explorer':
      current = uniqueGames;
      break;
    case 'garden_keeper':
      current = profile.plantedGardenIds.length;
      break;
  }

  return { current: Math.min(current, target), target };
}

export function computeUnlockedAchievements(profile: ChildProfile): AchievementId[] {
  const unlocked = new Set<AchievementId>(profile.unlockedAchievements || []);
  ACHIEVEMENT_CATALOG.forEach((def) => {
    const { current, target } = getAchievementProgress(profile, def.id);
    if (current >= target) {
      unlocked.add(def.id);
    }
  });
  return Array.from(unlocked);
}

export interface RecordGameContext {
  worldId?: WorldId;
  levelNumber?: number;
  isDailyChallenge?: boolean;
}

export function recordCompletedGame(
  profile: ChildProfile,
  gameId: GameModeId,
  correctCount: number,
  wrongCount: number,
  starsEarned: number,
  durationSeconds: number,
  context?: RecordGameContext
): {
  updatedProfile: ChildProfile;
  newSession: GameSessionResult;
  newlyUnlockedAchievements: AchievementId[];
  xpEarned: number;
  coinsEarned: number;
  alreadyClaimedDaily: boolean;
} {
  const today = getLocalDateString();
  const yesterday = getYesterdayLocalDateString();
  const isDailyChallenge = Boolean(context?.isDailyChallenge);
  const alreadyClaimedDaily =
    isDailyChallenge && profile.dailyChallengeState?.lastCompletedDate === today;

  // Prevent duplicate daily challenge reward payouts on the same local date
  const effectiveStars = alreadyClaimedDaily ? 0 : starsEarned;
  const isPerfect = wrongCount === 0 && correctCount > 0;
  const xpEarned = alreadyClaimedDaily
    ? Math.max(10, correctCount * 3)
    : correctCount * 15 + (isPerfect ? 30 : 10) + (isDailyChallenge ? 40 : 0);
  const coinsEarned = alreadyClaimedDaily
    ? 0
    : correctCount * 5 + effectiveStars * 5 + (isDailyChallenge ? 35 : 0);

  const newStars = profile.stars + effectiveStars;
  const prevDaily = profile.lastActiveDate === today ? profile.dailyCompleted : 0;
  const nextDaily = prevDaily + 1;
  const baseStreak =
    profile.lastActiveDate === today ||
    (profile.lastActiveDate === yesterday && profile.dailyCompleted >= profile.dailyGoal)
      ? profile.currentStreak || 0
      : 0;
  const justMetDailyGoal = prevDaily < profile.dailyGoal && nextDaily >= profile.dailyGoal;
  const nextStreak = justMetDailyGoal ? baseStreak + 1 : baseStreak;

  const updatedCompleted = {
    ...profile.completedGames,
    [gameId]: (profile.completedGames[gameId] || 0) + 1,
  };

  // Topic stats
  const cat = getGameCategory(gameId);
  const prevTopic = profile.topicStats?.[cat] || { attempted: 0, correct: 0 };
  const nextTopicStats = {
    ...(profile.topicStats || {}),
    [cat]: {
      attempted: prevTopic.attempted + correctCount + wrongCount,
      correct: prevTopic.correct + correctCount,
    },
  };

  // World & Level progress (strictly store stars ONLY on completed levels)
  const nextWorldProgress = { ...profile.worldProgress };
  if (context?.worldId && context?.levelNumber && correctCount > 0) {
    const worldProg = nextWorldProgress[context.worldId] || {
      highestUnlockedLevel: 1,
      levelStars: {},
    };
    const levelStarsEarned = calculateLevelStars(correctCount, wrongCount);
    const prevLevelStars = worldProg.levelStars[context.levelNumber] || 0;
    nextWorldProgress[context.worldId] = {
      highestUnlockedLevel: Math.min(
        100,
        Math.max(worldProg.highestUnlockedLevel, context.levelNumber + 1)
      ),
      levelStars: {
        ...worldProg.levelStars,
        [context.levelNumber]: Math.max(prevLevelStars, levelStarsEarned),
      },
    };
  }

  // Daily Challenge state
  const nextDailyState = { ...profile.dailyChallengeState };
  if (isDailyChallenge) {
    nextDailyState.lastCompletedDate = today;
    nextDailyState.bestScoreToday = Math.max(
      profile.dailyChallengeState?.lastCompletedDate === today
        ? profile.dailyChallengeState.bestScoreToday
        : 0,
      correctCount
    );
  }

  const previousUnlocked = new Set(profile.unlockedAchievements || []);

  const draftProfile: ChildProfile = {
    ...profile,
    stars: newStars,
    xp: (profile.xp || 0) + xpEarned,
    coins: (profile.coins || 0) + coinsEarned,
    dailyCompleted: nextDaily,
    lastActiveDate: today,
    completedGames: updatedCompleted,
    unlockedOutfits: computeUnlockedOutfits(newStars, profile.unlockedOutfits),
    totalSecondsLearned: profile.totalSecondsLearned + durationSeconds,
    equationsSolved: (profile.equationsSolved || 0) + correctCount,
    perfectScores: (profile.perfectScores || 0) + (isPerfect ? 1 : 0),
    currentStreak: nextStreak,
    unlockedAchievements: profile.unlockedAchievements || [],
    worldProgress: nextWorldProgress,
    dailyChallengeState: nextDailyState,
    topicStats: nextTopicStats,
  };

  const nextUnlocked = computeUnlockedAchievements(draftProfile);
  const newlyUnlockedAchievements = nextUnlocked.filter(
    (id) => !previousUnlocked.has(id)
  );
  const nowTs = Date.now();
  const nextHistoryEntries = newlyUnlockedAchievements.map((id) => ({
    id,
    unlockedAt: nowTs,
  }));

  const updatedProfile: ChildProfile = {
    ...draftProfile,
    unlockedAchievements: nextUnlocked,
    achievementHistory: [...(profile.achievementHistory || []), ...nextHistoryEntries],
    unlockedWorlds: computeUnlockedWorlds(draftProfile),
  };

  const newSession: GameSessionResult = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    profileId: profile.id,
    gameId,
    worldId: context?.worldId,
    levelNumber: context?.levelNumber,
    difficulty: profile.difficulty,
    correctCount,
    wrongCount,
    starsEarned: effectiveStars,
    coinsEarned,
    xpEarned,
    durationSeconds,
    timestamp: nowTs,
  };

  return {
    updatedProfile,
    newSession,
    newlyUnlockedAchievements,
    xpEarned,
    coinsEarned,
    alreadyClaimedDaily,
  };
}

export function claimDailyMission(
  profile: ChildProfile,
  missionId: string
): { claimed: boolean; updatedProfile: ChildProfile } {
  const mission = DAILY_MISSIONS_CATALOG.find((m) => m.id === missionId);
  if (!mission) return { claimed: false, updatedProfile: profile };

  const today = getLocalDateString();
  const claimedToday =
    profile.dailyChallengeState?.claimedMissionsDate === today
      ? profile.dailyChallengeState.claimedMissionIds || []
      : [];

  if (claimedToday.includes(missionId)) {
    return { claimed: false, updatedProfile: profile };
  }

  let progressVal = 0;
  if (mission.metric === 'dailyCompleted') {
    progressVal = profile.lastActiveDate === today ? profile.dailyCompleted : 0;
  } else if (mission.metric === 'dailyChallenge') {
    progressVal = profile.dailyChallengeState?.lastCompletedDate === today ? 1 : 0;
  }

  if (progressVal < mission.target) {
    return { claimed: false, updatedProfile: profile };
  }

  return {
    claimed: true,
    updatedProfile: {
      ...profile,
      coins: (profile.coins || 0) + mission.rewardCoins,
      xp: (profile.xp || 0) + mission.rewardXp,
      dailyChallengeState: {
        ...profile.dailyChallengeState,
        claimedMissionsDate: today,
        claimedMissionIds: [...claimedToday, missionId],
      },
    },
  };
}
