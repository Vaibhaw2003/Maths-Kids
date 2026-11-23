import {
  ChildProfile,
  DifficultyLevel,
  GAME_CATALOG,
  GameModeId,
  SHOP_CATALOG,
  WORLDS_CATALOG,
  WorldId,
  WorldLevelProgress,
} from '../types/game';

export function getLocalDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayLocalDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export function createInitialWorldProgress(): Record<WorldId, WorldLevelProgress> {
  return {
    fruit_island: { highestUnlockedLevel: 1, levelStars: {} },
    robot_city: { highestUnlockedLevel: 1, levelStars: {} },
    racing_valley: { highestUnlockedLevel: 1, levelStars: {} },
    space_galaxy: { highestUnlockedLevel: 1, levelStars: {} },
    animal_kingdom: { highestUnlockedLevel: 1, levelStars: {} },
    treasure_island: { highestUnlockedLevel: 1, levelStars: {} },
  };
}

/**
 * Compute player level and XP progress within the current level.
 * Level 1->2 requires 100 XP, increasing by +40 XP per level.
 */
export function getPlayerLevelInfo(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  percent: number;
} {
  let xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let required = 100;
  while (xp >= required && level < 99) {
    xp -= required;
    level += 1;
    required = 100 + (level - 1) * 40;
  }
  return {
    level,
    currentLevelXp: xp,
    xpForNextLevel: required,
    percent: Math.min(100, Math.round((xp / required) * 100)),
  };
}

/**
 * Evaluate which adventure worlds are unlocked based on real progression.
 * Never unlocks a world unless its actual condition is satisfied.
 */
export function computeUnlockedWorlds(profile: ChildProfile): WorldId[] {
  const unlocked = new Set<WorldId>(['fruit_island']);

  for (let i = 1; i < WORLDS_CATALOG.length; i++) {
    const world = WORLDS_CATALOG[i];
    const prevWorld = WORLDS_CATALOG[i - 1];
    const prevProg = profile.worldProgress?.[prevWorld.id];
    const prevCompletedCount = prevProg ? Object.keys(prevProg.levelStars).length : 0;

    if (
      prevCompletedCount >= world.requiredPrevWorldLevels ||
      profile.stars >= world.requiredStars
    ) {
      unlocked.add(world.id);
    }
  }

  return WORLDS_CATALOG.map((w) => w.id).filter((id) => unlocked.has(id));
}

export function isWorldUnlocked(profile: ChildProfile, worldId: WorldId): boolean {
  return computeUnlockedWorlds(profile).includes(worldId);
}

export function getWorldCompletedCount(profile: ChildProfile, worldId: WorldId): number {
  const prog = profile.worldProgress?.[worldId];
  return prog ? Object.keys(prog.levelStars).length : 0;
}

export function getWorldTotalStars(profile: ChildProfile, worldId: WorldId): number {
  const prog = profile.worldProgress?.[worldId];
  if (!prog) return 0;
  return Object.values(prog.levelStars).reduce((sum, s) => sum + s, 0);
}

export function getLevelDifficulty(levelNumber: number): DifficultyLevel {
  if (levelNumber <= 33) return 'easy';
  if (levelNumber <= 66) return 'medium';
  return 'advanced';
}

export function getGameForWorldLevel(worldId: WorldId, levelNumber: number): GameModeId {
  const world = WORLDS_CATALOG.find((w) => w.id === worldId) || WORLDS_CATALOG[0];
  const idx = (Math.max(1, levelNumber) - 1) % world.gameModes.length;
  return world.gameModes[idx];
}

export function calculateLevelStars(correctCount: number, wrongCount: number): number {
  if (correctCount <= 0) return 0;
  if (wrongCount === 0) return 3;
  if (wrongCount <= 2) return 2;
  return 1;
}

export function purchaseShopItem(
  profile: ChildProfile,
  itemId: string
): { success: boolean; updatedProfile: ChildProfile; reason?: 'owned' | 'insufficient' | 'not_found' } {
  const item = SHOP_CATALOG.find((s) => s.id === itemId);
  if (!item) return { success: false, updatedProfile: profile, reason: 'not_found' };

  const owned = new Set(profile.ownedShopItems || []);
  if (owned.has(item.id)) {
    return { success: false, updatedProfile: profile, reason: 'owned' };
  }
  if (profile.coins < item.costCoins) {
    return { success: false, updatedProfile: profile, reason: 'insufficient' };
  }

  owned.add(item.id);
  const nextCosmetics = { ...profile.equippedCosmetics };
  let nextOutfits = [...profile.unlockedOutfits];
  let nextEquippedOutfit = profile.equippedOutfit;

  if (item.category === 'outfit' && item.outfitId) {
    if (!nextOutfits.includes(item.outfitId)) nextOutfits.push(item.outfitId);
    nextEquippedOutfit = item.outfitId;
  } else if (item.category === 'robot_skin') {
    nextCosmetics.robotSkin = item.id;
  } else if (item.category === 'car_skin') {
    nextCosmetics.carSkin = item.id;
  } else if (item.category === 'accessory') {
    nextCosmetics.accessory = item.id;
  } else if (item.category === 'env_theme') {
    nextCosmetics.envTheme = item.id;
  }

  return {
    success: true,
    updatedProfile: {
      ...profile,
      coins: profile.coins - item.costCoins,
      ownedShopItems: Array.from(owned),
      unlockedOutfits: nextOutfits,
      equippedOutfit: nextEquippedOutfit,
      equippedCosmetics: nextCosmetics,
    },
  };
}

export function equipShopItem(profile: ChildProfile, itemId: string): ChildProfile {
  const item = SHOP_CATALOG.find((s) => s.id === itemId);
  if (!item || !profile.ownedShopItems.includes(itemId)) return profile;

  const nextCosmetics = { ...profile.equippedCosmetics };
  let nextEquippedOutfit = profile.equippedOutfit;

  if (item.category === 'outfit' && item.outfitId) {
    nextEquippedOutfit = item.outfitId;
  } else if (item.category === 'robot_skin') {
    nextCosmetics.robotSkin = item.id;
  } else if (item.category === 'car_skin') {
    nextCosmetics.carSkin = item.id;
  } else if (item.category === 'accessory') {
    nextCosmetics.accessory = item.id;
  } else if (item.category === 'env_theme') {
    nextCosmetics.envTheme = item.id;
  }

  return {
    ...profile,
    equippedOutfit: nextEquippedOutfit,
    equippedCosmetics: nextCosmetics,
  };
}

export function getGameCategory(gameId: GameModeId) {
  return GAME_CATALOG.find((g) => g.id === gameId)?.category || 'counting';
}
