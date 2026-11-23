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

export type WorldId =
  | 'fruit_island'
  | 'robot_city'
  | 'racing_valley'
  | 'space_galaxy'
  | 'animal_kingdom'
  | 'treasure_island';

export type ScreenRoute =
  | 'splash'
  | 'home'
  | 'worlds'
  | 'levels'
  | 'games'
  | 'toybox3d'
  | 'play'
  | 'results'
  | 'rewards'
  | 'shop'
  | 'daily'
  | 'profile'
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

export type AchievementId =
  | 'first_step'
  | 'perfect_score'
  | 'perfect_streak_5'
  | 'equations_25'
  | 'equations_100'
  | 'math_explorer'
  | 'master_explorer'
  | 'garden_keeper';

export interface AchievementDefinition {
  id: AchievementId;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  target: number;
  color: string;
  icon: 'award' | 'target' | 'flame' | 'calculator' | 'trophy' | 'compass' | 'sparkles' | 'flower';
}

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: 'first_step',
    titleEn: 'First Steps',
    titleHi: 'पहला कदम',
    descriptionEn: 'Complete your very first math game.',
    descriptionHi: 'अपना पहला गणित खेल पूरा करें।',
    target: 1,
    color: '#35D66F',
    icon: 'award',
  },
  {
    id: 'perfect_score',
    titleEn: 'Perfect Score',
    titleHi: 'शत-प्रतिशत अंक',
    descriptionEn: 'Finish a round with zero retries.',
    descriptionHi: 'बिना किसी गलती के एक राउंड पूरा करें।',
    target: 1,
    color: '#FFD83D',
    icon: 'target',
  },
  {
    id: 'equations_25',
    titleEn: 'Number Builder',
    titleHi: 'संख्या निर्माता',
    descriptionEn: 'Solve 25 math questions correctly.',
    descriptionHi: '25 गणित के सवाल सही हल करें।',
    target: 25,
    color: '#287BFF',
    icon: 'calculator',
  },
  {
    id: 'math_explorer',
    titleEn: 'Math Explorer',
    titleHi: 'गणित खोजकर्ता',
    descriptionEn: 'Play 5 different math game modes.',
    descriptionHi: '5 अलग-अलग गणित खेल आज़माएँ।',
    target: 5,
    color: '#9755F5',
    icon: 'compass',
  },
  {
    id: 'perfect_streak_5',
    titleEn: 'Accuracy Ace',
    titleHi: 'सटीकता चैंपियन',
    descriptionEn: 'Earn 5 Perfect Score rounds.',
    descriptionHi: '5 बार बिना गलती किए राउंड जीतें।',
    target: 5,
    color: '#FF55AE',
    icon: 'flame',
  },
  {
    id: 'garden_keeper',
    titleEn: 'Garden Keeper',
    titleHi: 'बगीचा रक्षक',
    descriptionEn: 'Plant 3 items in your Reward Garden.',
    descriptionHi: 'इनाम बगीचे में 3 पौधे या चीज़ें लगाएँ।',
    target: 3,
    color: '#35D66F',
    icon: 'flower',
  },
  {
    id: 'equations_100',
    titleEn: '100 Equations Solved',
    titleHi: '100 सवाल हल',
    descriptionEn: 'Solve 100 math questions correctly!',
    descriptionHi: '100 गणित के सवाल सही हल करें!',
    target: 100,
    color: '#FF963C',
    icon: 'trophy',
  },
  {
    id: 'master_explorer',
    titleEn: 'All-Star Explorer',
    titleHi: 'ऑल-स्टार खोजकर्ता',
    descriptionEn: 'Play 12 different math game modes.',
    descriptionHi: '12 अलग-अलग गणित खेल पूरे करें।',
    target: 12,
    color: '#287BFF',
    icon: 'sparkles',
  },
];

export interface WorldLevelProgress {
  highestUnlockedLevel: number;
  levelStars: Record<number, number>;
}

export interface WorldDefinition {
  id: WorldId;
  order: number;
  nameEn: string;
  nameHi: string;
  subtitleEn: string;
  subtitleHi: string;
  totalLevels: number;
  accentHex: string;
  secondaryHex: string;
  unlockRequirementEn: string;
  unlockRequirementHi: string;
  /** Minimum stars required OR previous world levels required */
  requiredStars: number;
  requiredPrevWorldLevels: number;
  gameModes: GameModeId[];
  toyboxModel: 'apple_tree' | 'math_robot' | 'race_car' | 'rocket' | 'toy_train' | 'star_trophy';
}

export const WORLDS_CATALOG: WorldDefinition[] = [
  {
    id: 'fruit_island',
    order: 1,
    nameEn: 'Fruit Island',
    nameHi: 'फल द्वीप',
    subtitleEn: 'Sunny orchards for counting & early addition',
    subtitleHi: 'गिनती और जोड़ सीखने का हरा-भरा द्वीप',
    totalLevels: 100,
    accentHex: '#35D982',
    secondaryHex: '#22D3EE',
    unlockRequirementEn: 'Unlocked from start',
    unlockRequirementHi: 'शुरू से खुला है',
    requiredStars: 0,
    requiredPrevWorldLevels: 0,
    gameModes: ['count_objects', 'addition_fun', 'addition_puzzle', 'ten_frame'],
    toyboxModel: 'apple_tree',
  },
  {
    id: 'robot_city',
    order: 2,
    nameEn: 'Robot City',
    nameHi: 'रोबोट सिटी',
    subtitleEn: 'Neon workshops with subtraction & missing numbers',
    subtitleHi: 'घटाव और गायब संख्याओं का रोबोट शहर',
    totalLevels: 100,
    accentHex: '#A855F7',
    secondaryHex: '#22D3EE',
    unlockRequirementEn: 'Complete 3 levels in Fruit Island or earn 8★',
    unlockRequirementHi: 'फल द्वीप में 3 स्तर जीतें या 8★ कमाएँ',
    requiredStars: 8,
    requiredPrevWorldLevels: 3,
    gameModes: ['subtraction_fun', 'subtraction_puzzle', 'missing_numbers', 'compare_numbers'],
    toyboxModel: 'math_robot',
  },
  {
    id: 'racing_valley',
    order: 3,
    nameEn: 'Racing Valley',
    nameHi: 'रेसिंग वैली',
    subtitleEn: 'Turbo tracks for fast sums & number racing',
    subtitleHi: 'तेज़ जोड़ और कार रेसिंग की घाटी',
    totalLevels: 100,
    accentHex: '#FF963C',
    secondaryHex: '#FFD43B',
    unlockRequirementEn: 'Complete 3 levels in Robot City or earn 18★',
    unlockRequirementHi: 'रोबोट सिटी में 3 स्तर जीतें या 18★ कमाएँ',
    requiredStars: 18,
    requiredPrevWorldLevels: 3,
    gameModes: ['math_racing', 'addition_quiz', 'subtraction_quiz', 'three_number_addition'],
    toyboxModel: 'race_car',
  },
  {
    id: 'space_galaxy',
    order: 4,
    nameEn: 'Space Galaxy',
    nameHi: 'अंतरिक्ष गैलेक्सी',
    subtitleEn: 'Starry orbits for pyramids & logic puzzles',
    subtitleHi: 'पिरामिड और तर्क पहेलियों का अंतरिक्ष',
    totalLevels: 100,
    accentHex: '#287BFF',
    secondaryHex: '#A855F7',
    unlockRequirementEn: 'Complete 3 levels in Racing Valley or earn 30★',
    unlockRequirementHi: 'रेसिंग वैली में 3 स्तर जीतें या 30★ कमाएँ',
    requiredStars: 30,
    requiredPrevWorldLevels: 3,
    gameModes: ['math_pyramid', 'logic_puzzles', 'math_practice'],
    toyboxModel: 'rocket',
  },
  {
    id: 'animal_kingdom',
    order: 5,
    nameEn: 'Animal Kingdom',
    nameHi: 'पशु साम्राज्य',
    subtitleEn: 'Story meadows & 1 to 100 adventures',
    subtitleHi: 'कहानी के सवाल और 1 से 100 गिनती',
    totalLevels: 100,
    accentHex: '#22D3EE',
    secondaryHex: '#35D982',
    unlockRequirementEn: 'Complete 3 levels in Space Galaxy or earn 45★',
    unlockRequirementHi: 'अंतरिक्ष में 3 स्तर जीतें या 45★ कमाएँ',
    requiredStars: 45,
    requiredPrevWorldLevels: 3,
    gameModes: ['word_problems', 'counting_100', 'compare_numbers'],
    toyboxModel: 'toy_train',
  },
  {
    id: 'treasure_island',
    order: 6,
    nameEn: 'Treasure Island',
    nameHi: 'खजाना द्वीप',
    subtitleEn: 'Grand champion island of mixed mastery quests',
    subtitleHi: 'सभी गणित चुनौतियों का ग्रैंड चैंपियन द्वीप',
    totalLevels: 100,
    accentHex: '#FFD43B',
    secondaryHex: '#FF5B6E',
    unlockRequirementEn: 'Complete 3 levels in Animal Kingdom or earn 60★',
    unlockRequirementHi: 'पशु साम्राज्य में 3 स्तर जीतें या 60★ कमाएँ',
    requiredStars: 60,
    requiredPrevWorldLevels: 3,
    gameModes: ['math_practice', 'math_pyramid', 'math_racing', 'word_problems'],
    toyboxModel: 'star_trophy',
  },
];

export type ShopCategory =
  | 'outfit'
  | 'robot_skin'
  | 'car_skin'
  | 'accessory'
  | 'env_theme';

export interface ShopItem {
  id: string;
  category: ShopCategory;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  costCoins: number;
  previewHex: string;
  accentHex: string;
  outfitId?: OutfitId;
}

export const SHOP_CATALOG: ShopItem[] = [
  {
    id: 'outfit_glasses',
    category: 'outfit',
    nameEn: 'Cyan Cyber Visor',
    nameHi: 'नियॉन चश्मा',
    descriptionEn: 'Equip glowing star glasses on your mascot companion.',
    descriptionHi: 'अपने साथी को चमकदार स्टार चश्मा पहनाएँ।',
    costCoins: 40,
    previewHex: '#22D3EE',
    accentHex: '#287BFF',
    outfitId: 'glasses',
  },
  {
    id: 'outfit_crown',
    category: 'outfit',
    nameEn: 'Starlight Crown',
    nameHi: 'सुनहरा मुकुट',
    descriptionEn: 'Royal golden adventure crown for math champions.',
    descriptionHi: 'गणित चैंपियन के लिए शाही सुनहरा मुकुट।',
    costCoins: 80,
    previewHex: '#FFD43B',
    accentHex: '#FF963C',
    outfitId: 'crown',
  },
  {
    id: 'outfit_cape',
    category: 'outfit',
    nameEn: 'Heroic Neon Cape',
    nameHi: 'सुपर हीरो केप',
    descriptionEn: 'Soar across worlds with a bright adventure cape.',
    descriptionHi: 'चमकते हीरो केप के साथ दुनिया की सैर करें।',
    costCoins: 110,
    previewHex: '#FF5B6E',
    accentHex: '#A855F7',
    outfitId: 'cape',
  },
  {
    id: 'robot_cobalt',
    category: 'robot_skin',
    nameEn: 'Cobalt Cyber Bot',
    nameHi: 'कोबाल्ट रोबोट स्किन',
    descriptionEn: 'Sleek electric blue armor coat for Robo-Buddy.',
    descriptionHi: 'रोबो दोस्त के लिए इलेक्ट्रिक ब्लू कवच।',
    costCoins: 75,
    previewHex: '#287BFF',
    accentHex: '#22D3EE',
  },
  {
    id: 'robot_gold',
    category: 'robot_skin',
    nameEn: 'Solar Gold Bot',
    nameHi: 'सोलर गोल्ड रोबोट',
    descriptionEn: 'Shining golden finish for Robo-Buddy in 3D.',
    descriptionHi: 'रोबो दोस्त के लिए चमकदार सुनहरी स्किन।',
    costCoins: 140,
    previewHex: '#FFD43B',
    accentHex: '#FF963C',
  },
  {
    id: 'car_emerald',
    category: 'car_skin',
    nameEn: 'Emerald Turbo',
    nameHi: 'ग्रीन टर्बो कार',
    descriptionEn: 'Neon green racing paint with cyan stripes.',
    descriptionHi: 'नियॉन ग्रीन और सियान रेसिंग कार पेंट।',
    costCoins: 70,
    previewHex: '#35D982',
    accentHex: '#22D3EE',
  },
  {
    id: 'car_plasma',
    category: 'car_skin',
    nameEn: 'Plasma Violet Racer',
    nameHi: 'वायलेट प्लाज़्मा रेसर',
    descriptionEn: 'Electric purple finish built for Racing Valley.',
    descriptionHi: 'रेसिंग वैली के लिए पर्पल प्लाज़्मा पेंट।',
    costCoins: 120,
    previewHex: '#A855F7',
    accentHex: '#FFD43B',
  },
  {
    id: 'acc_jetpack',
    category: 'accessory',
    nameEn: 'Starlight Jet Wing',
    nameHi: 'स्टार जेटपैक',
    descriptionEn: 'Sparkling adventure badge & booster aura.',
    descriptionHi: 'चमकता हुआ स्टार बूस्टर बैज।',
    costCoins: 65,
    previewHex: '#22D3EE',
    accentHex: '#A855F7',
  },
  {
    id: 'theme_aurora',
    category: 'env_theme',
    nameEn: 'Aurora Sky Plaza',
    nameHi: 'ऑरोरा स्काई थीम',
    descriptionEn: 'Vibrant teal-blue glow backdrop for your Home hero.',
    descriptionHi: 'होम स्क्रीन के लिए सुंदर ऑरोरा बैकग्राउंड।',
    costCoins: 95,
    previewHex: '#22D3EE',
    accentHex: '#35D982',
  },
  {
    id: 'theme_cosmic',
    category: 'env_theme',
    nameEn: 'Cosmic Nebula',
    nameHi: 'कॉस्मिक नेबुला थीम',
    descriptionEn: 'Deep galaxy purple starlight adventure glow.',
    descriptionHi: 'अंतरिक्ष स्टारलाइट पर्पल थीम।',
    costCoins: 130,
    previewHex: '#A855F7',
    accentHex: '#287BFF',
  },
];

export interface ChildProfile {
  id: string;
  nickname: string;
  mascot: MascotId;
  difficulty: DifficultyLevel;
  customMaxNumber: number | null;
  stars: number;
  spentStars: number;
  xp: number;
  coins: number;
  dailyCompleted: number;
  dailyGoal: number;
  lastActiveDate: string;
  completedGames: Partial<Record<GameModeId, number>>;
  unlockedOutfits: OutfitId[];
  equippedOutfit: OutfitId;
  plantedGardenIds: string[];
  totalSecondsLearned: number;
  equationsSolved: number;
  perfectScores: number;
  currentStreak: number;
  unlockedAchievements: AchievementId[];
  achievementHistory: Array<{ id: AchievementId; unlockedAt: number }>;
  unlocked3DModels: string[];
  unlockedWorlds: WorldId[];
  worldProgress: Record<WorldId, WorldLevelProgress>;
  ownedShopItems: string[];
  equippedCosmetics: {
    robotSkin: string;
    carSkin: string;
    accessory: string;
    envTheme: string;
  };
  dailyChallengeState: {
    lastCompletedDate: string | null;
    bestScoreToday: number;
    claimedMissionsDate: string | null;
    claimedMissionIds: string[];
  };
  topicStats: Partial<Record<GameCategory, { attempted: number; correct: number }>>;
}

export interface GameSessionResult {
  id: string;
  profileId: string;
  gameId: GameModeId;
  worldId?: WorldId;
  levelNumber?: number;
  difficulty: DifficultyLevel;
  correctCount: number;
  wrongCount: number;
  starsEarned: number;
  coinsEarned?: number;
  xpEarned?: number;
  durationSeconds: number;
  timestamp: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  language: LanguageCode;
  timerEnabledInPractice: boolean;
  soundVolume: number;
  musicVolume: number;
}
