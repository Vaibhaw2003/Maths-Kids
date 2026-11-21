import {
  AppSettings,
  ChildProfile,
  DifficultyLevel,
  GameModeId,
  GameSessionResult,
  MascotId,
  OUTFIT_CATALOG,
  OutfitId,
} from '../types/game';

const PROFILES_KEY = 'vs_math_kids_profiles_v1';
const ACTIVE_PROFILE_KEY = 'vs_math_kids_active_profile_v1';
const HISTORY_KEY = 'vs_math_kids_history_v1';
const SETTINGS_KEY = 'vs_math_kids_settings_v1';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

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
    dailyCompleted: 0,
    dailyGoal: 3,
    lastActiveDate: todayDateString(),
    completedGames: {},
    unlockedOutfits: ['default'],
    equippedOutfit: 'default',
    plantedGardenIds: [],
    totalSecondsLearned: 0,
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  musicEnabled: false,
  voiceEnabled: true,
  language: 'en',
  timerEnabledInPractice: false,
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
    const parsed = JSON.parse(raw) as ChildProfile[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fallback = [createDefaultProfile('Math Star', 'leo', 'easy')];
      saveProfiles(fallback);
      return fallback;
    }
    const today = todayDateString();
    return parsed.map((p) =>
      p.lastActiveDate !== today
        ? { ...p, dailyCompleted: 0, lastActiveDate: today }
        : p
    );
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
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 120)));
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

export function recordCompletedGame(
  profile: ChildProfile,
  gameId: GameModeId,
  correctCount: number,
  wrongCount: number,
  starsEarned: number,
  durationSeconds: number
): { updatedProfile: ChildProfile; newSession: GameSessionResult } {
  const newStars = profile.stars + starsEarned;
  const today = todayDateString();
  const prevDaily = profile.lastActiveDate === today ? profile.dailyCompleted : 0;
  const updatedCompleted = {
    ...profile.completedGames,
    [gameId]: (profile.completedGames[gameId] || 0) + 1,
  };

  const updatedProfile: ChildProfile = {
    ...profile,
    stars: newStars,
    dailyCompleted: prevDaily + 1,
    lastActiveDate: today,
    completedGames: updatedCompleted,
    unlockedOutfits: computeUnlockedOutfits(newStars, profile.unlockedOutfits),
    totalSecondsLearned: profile.totalSecondsLearned + durationSeconds,
  };

  const newSession: GameSessionResult = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    profileId: profile.id,
    gameId,
    difficulty: profile.difficulty,
    correctCount,
    wrongCount,
    starsEarned,
    durationSeconds,
    timestamp: Date.now(),
  };

  return { updatedProfile, newSession };
}
