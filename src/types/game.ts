export type LanguageCode = 'en' | 'hi';

export type FutureLanguageCode = LanguageCode | 'es' | 'fr' | 'de' | 'pt' | 'ar';

export type DifficultyLevel = 'easy' | 'medium' | 'advanced';

export type MascotId = 'leo' | 'bella' | 'coco';

export type OutfitId = 'default' | 'crown' | 'glasses' | 'cape' | 'wizard';

export type GameCategory = 'counting' | 'addition' | 'subtraction' | 'puzzles' | 'adventure';

export type GameModeId =
  | 'count_objects'
  | 'compare_numbers'
  | 'addition_puzzle'
  | 'addition_fun'
  | 'addition_quiz'
  | 'subtraction_puzzle'
  | 'subtraction_fun'
  | 'subtraction_quiz'
  | 'math_pyramid'
  | 'missing_numbers'
  | 'math_practice'
  | 'logic_puzzles'
  | 'ten_frame'
  | 'three_number_addition'
  | 'math_racing'
  | 'word_problems'
  | 'counting_100';

export type ScreenRoute =
  | 'splash'
  | 'welcome'
  | 'profiles'
  | 'home'
  | 'games'
  | 'play'
  | 'results'
  | 'rewards'
  | 'parent';

export type VisualObjectType =
  | 'apple'
  | 'banana'
  | 'star'
  | 'duck'
  | 'candy'
  | 'car'
  | 'balloon';

export interface MascotInfo {
  id: MascotId;
  nameKey: 'mascotLeo' | 'mascotBella' | 'mascotCoco';
  roleKey: 'mascotLeoRole' | 'mascotBellaRole' | 'mascotCocoRole';
  image: string;
  accentColor: string;
  surfaceTint: string;
}

export const MASCOTS: Record<MascotId, MascotInfo> = {
  leo: {
    id: 'leo',
    nameKey: 'mascotLeo',
    roleKey: 'mascotLeoRole',
    image: '/src/assets/images/mascot_leo_lion_1795263817446.jpg',
    accentColor: '#FF963C',
    surfaceTint: '#FFF4E8',
  },
  bella: {
    id: 'bella',
    nameKey: 'mascotBella',
    roleKey: 'mascotBellaRole',
    image: '/src/assets/images/mascot_bella_bunny_1795263818481.jpg',
    accentColor: '#9755F5',
    surfaceTint: '#F4EEFF',
  },
  coco: {
    id: 'coco',
    nameKey: 'mascotCoco',
    roleKey: 'mascotCocoRole',
    image: '/src/assets/images/mascot_coco_duck_1795263818051.jpg',
    accentColor: '#35D66F',
    surfaceTint: '#ECFFF2',
  },
};

export const MEADOW_BG_IMAGE = '/src/assets/images/garden_meadow_bg_1795263818196.jpg';

export interface GameDefinition {
  id: GameModeId;
  category: GameCategory;
  color: string;
  isCore: boolean;
  questionsPerRound: number;
  recommendedAge: string;
}

export const GAME_CATALOG: GameDefinition[] = [
  { id: 'count_objects', category: 'counting', color: '#287BFF', isCore: true, questionsPerRound: 6, recommendedAge: '3–6' },
  { id: 'compare_numbers', category: 'counting', color: '#FF55AE', isCore: true, questionsPerRound: 6, recommendedAge: '4–7' },
  { id: 'addition_puzzle', category: 'addition', color: '#35D66F', isCore: true, questionsPerRound: 6, recommendedAge: '4–7' },
  { id: 'addition_fun', category: 'addition', color: '#FF963C', isCore: true, questionsPerRound: 6, recommendedAge: '3–6' },
  { id: 'addition_quiz', category: 'addition', color: '#287BFF', isCore: true, questionsPerRound: 8, recommendedAge: '5–8' },
  { id: 'subtraction_puzzle', category: 'subtraction', color: '#9755F5', isCore: true, questionsPerRound: 6, recommendedAge: '4–7' },
  { id: 'subtraction_fun', category: 'subtraction', color: '#FF55AE', isCore: true, questionsPerRound: 6, recommendedAge: '3–6' },
  { id: 'subtraction_quiz', category: 'subtraction', color: '#FF963C', isCore: true, questionsPerRound: 8, recommendedAge: '5–8' },
  { id: 'math_pyramid', category: 'puzzles', color: '#9755F5', isCore: true, questionsPerRound: 5, recommendedAge: '6–8' },
  { id: 'missing_numbers', category: 'puzzles', color: '#287BFF', isCore: true, questionsPerRound: 6, recommendedAge: '5–8' },
  { id: 'math_practice', category: 'puzzles', color: '#35D66F', isCore: true, questionsPerRound: 8, recommendedAge: '4–8' },
  { id: 'logic_puzzles', category: 'puzzles', color: '#FF963C', isCore: true, questionsPerRound: 6, recommendedAge: '5–8' },
  { id: 'ten_frame', category: 'addition', color: '#287BFF', isCore: false, questionsPerRound: 6, recommendedAge: '4–7' },
  { id: 'three_number_addition', category: 'addition', color: '#35D66F', isCore: false, questionsPerRound: 6, recommendedAge: '6–8' },
  { id: 'math_racing', category: 'adventure', color: '#FF55AE', isCore: false, questionsPerRound: 6, recommendedAge: '4–8' },
  { id: 'word_problems', category: 'adventure', color: '#9755F5', isCore: false, questionsPerRound: 5, recommendedAge: '5–8' },
  { id: 'counting_100', category: 'counting', color: '#FF963C', isCore: false, questionsPerRound: 6, recommendedAge: '4–8' },
];

export interface GardenItem {
  id: string;
  kind: 'sunflower' | 'tulip' | 'apple_tree' | 'rainbow_arch' | 'butterfly' | 'fountain' | 'pine_tree' | 'mushroom_house';
  nameEn: string;
  nameHi: string;
  costStars: number;
  slotIndex?: number;
}

export const GARDEN_CATALOG: GardenItem[] = [
  { id: 'sunflower', kind: 'sunflower', nameEn: 'Sunny Sunflower', nameHi: 'चमकता सूरजमुखी', costStars: 5 },
  { id: 'tulip', kind: 'tulip', nameEn: 'Pink Tulip Patch', nameHi: 'गुलाबी ट्यूलिप', costStars: 8 },
  { id: 'butterfly', kind: 'butterfly', nameEn: 'Happy Butterfly', nameHi: 'खुश तितली', costStars: 10 },
  { id: 'apple_tree', kind: 'apple_tree', nameEn: 'Counting Apple Tree', nameHi: 'सेब का पेड़', costStars: 15 },
  { id: 'pine_tree', kind: 'pine_tree', nameEn: 'Cozy Pine Tree', nameHi: 'हरा देवदार पेड़', costStars: 14 },
  { id: 'mushroom_house', kind: 'mushroom_house', nameEn: 'Fairy Mushroom', nameHi: 'परी मशरूम घर', costStars: 20 },
  { id: 'rainbow_arch', kind: 'rainbow_arch', nameEn: 'Rainbow Arch', nameHi: 'इंद्रधनुष मेहराब', costStars: 25 },
  { id: 'fountain', kind: 'fountain', nameEn: 'Star Fountain', nameHi: 'तारा फव्वारा', costStars: 30 },
];

export interface StickerItem {
  id: string;
  nameEn: string;
  nameHi: string;
  unlockStars: number;
  color: string;
  symbol: 'star' | 'rocket' | 'crown' | 'trophy' | 'medal' | 'heart' | 'rainbow' | 'owl';
}

export const STICKER_CATALOG: StickerItem[] = [
  { id: 'first_star', nameEn: 'First Math Star', nameHi: 'पहला गणित तारा', unlockStars: 3, color: '#FFD83D', symbol: 'star' },
  { id: 'counting_champ', nameEn: 'Counting Champ', nameHi: 'गिनती चैंपियन', unlockStars: 10, color: '#287BFF', symbol: 'medal' },
  { id: 'plus_pal', nameEn: 'Addition Pal', nameHi: 'जोड़ का साथी', unlockStars: 18, color: '#35D66F', symbol: 'heart' },
  { id: 'minus_master', nameEn: 'Subtraction Whiz', nameHi: 'घटाव उस्ताद', unlockStars: 28, color: '#FF55AE', symbol: 'rainbow' },
  { id: 'speed_racer', nameEn: 'Math Racer', nameHi: 'गणित रेसर', unlockStars: 40, color: '#FF963C', symbol: 'rocket' },
  { id: 'puzzle_owl', nameEn: 'Wise Puzzle Owl', nameHi: 'बुद्धिमान उल्लू', unlockStars: 55, color: '#9755F5', symbol: 'owl' },
  { id: 'royal_learner', nameEn: 'Royal Scholar', nameHi: 'शाही विद्वान', unlockStars: 75, color: '#FFD83D', symbol: 'crown' },
  { id: 'grand_trophy', nameEn: 'Grand Math Trophy', nameHi: 'महान गणित ट्रॉफी', unlockStars: 100, color: '#287BFF', symbol: 'trophy' },
];

export interface OutfitItem {
  id: OutfitId;
  nameEn: string;
  nameHi: string;
  unlockStars: number;
}

export const OUTFIT_CATALOG: OutfitItem[] = [
  { id: 'default', nameEn: 'Classic Explorer', nameHi: 'क्लासिक एक्सप्लोरर', unlockStars: 0 },
  { id: 'glasses', nameEn: 'Smart Star Glasses', nameHi: 'स्मार्ट स्टार चश्मा', unlockStars: 8 },
  { id: 'crown', nameEn: 'Golden Math Crown', nameHi: 'सुनहरा मुकुट', unlockStars: 20 },
  { id: 'cape', nameEn: 'Super Hero Cape', nameHi: 'सुपर हीरो केप', unlockStars: 35 },
  { id: 'wizard', nameEn: 'Number Wizard Hat', nameHi: 'जादूगर टोपी', unlockStars: 50 },
];

export interface ChildProfile {
  id: string;
  nickname: string;
  mascot: MascotId;
  difficulty: DifficultyLevel;
  customMaxNumber: number | null;
  stars: number;
  spentStars: number;
  dailyCompleted: number;
  dailyGoal: number;
  lastActiveDate: string;
  completedGames: Partial<Record<GameModeId, number>>;
  unlockedOutfits: OutfitId[];
  equippedOutfit: OutfitId;
  plantedGardenIds: string[];
  totalSecondsLearned: number;
}

export interface GameSessionResult {
  id: string;
  profileId: string;
  gameId: GameModeId;
  difficulty: DifficultyLevel;
  correctCount: number;
  wrongCount: number;
  starsEarned: number;
  durationSeconds: number;
  timestamp: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  language: LanguageCode;
  timerEnabledInPractice: boolean;
}
