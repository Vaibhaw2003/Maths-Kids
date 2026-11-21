import { GameCategory, GameModeId, LanguageCode, DifficultyLevel, FutureLanguageCode } from '../types/game';

export interface TranslationStrings {
  appName: string;
  appSubtitle: string;
  playNow: string;
  switchProfile: string;
  parentZone: string;
  languageLabel: string;
  welcomeGreeting: string;
  welcomeDescription: string;
  chooseHero: string;
  createProfile: string;
  editProfile: string;
  nicknamePlaceholder: string;
  enterNickname: string;
  pickMascot: string;
  pickLevel: string;
  saveProfile: string;
  cancel: string;
  deleteProfile: string;
  levelEasy: string;
  levelEasyDesc: string;
  levelMedium: string;
  levelMediumDesc: string;
  levelAdvanced: string;
  levelAdvancedDesc: string;
  mascotLeo: string;
  mascotLeoRole: string;
  mascotBella: string;
  mascotBellaRole: string;
  mascotCoco: string;
  mascotCocoRole: string;
  navHome: string;
  navGames: string;
  navToybox3D: string;
  launchToybox3D: string;
  navRewards: string;
  navProfiles: string;
  dailyGoalTitle: string;
  starsEarned: string;
  activitiesDone: string;
  featuredTitle: string;
  allGamesTitle: string;
  categoryAll: string;
  categoryCounting: string;
  categoryAddition: string;
  categorySubtraction: string;
  categoryPuzzles: string;
  categoryAdventure: string;
  coreBadge: string;
  bonusBadge: string;
  agesPrefix: string;
  completedTimes: string;
  hearQuestion: string;
  questionProgress: string;
  checkAnswer: string;
  dragOrTapHint: string;
  dropHere: string;
  tapChoiceHint: string;
  encouragements: string[];
  tryAgainMessages: string[];
  resultsTitle: string;
  resultsSubtitle: string;
  correctLabel: string;
  wrongLabel: string;
  starsLabel: string;
  playAgain: string;
  nextGame: string;
  backHome: string;
  rewardsTitle: string;
  rewardsSubtitle: string;
  gardenTab: string;
  stickersTab: string;
  outfitsTab: string;
  achievementsTab: string;
  achievementUnlocked: string;
  achievementInProgress: string;
  achievementsSummary: string;
  newBadgeUnlocked: string;
  badgePopupHeading: string;
  badgePopupDismiss: string;
  viewAchievementsBtn: string;
  plantItem: string;
  planted: string;
  needMoreStars: string;
  availableStars: string;
  equipOutfit: string;
  equipped: string;
  lockedUntil: string;
  parentGateTitle: string;
  parentGatePrompt: string;
  parentGateVerify: string;
  parentGateWrong: string;
  parentDashboardTitle: string;
  parentSubtitle: string;
  statAccuracy: string;
  statTimeSpent: string;
  statGamesPlayed: string;
  statTotalStars: string;
  gameHistoryTitle: string;
  noHistoryYet: string;
  difficultyControlsTitle: string;
  customMaxRangeLabel: string;
  usePresetRange: string;
  audioSettingsTitle: string;
  soundEffects: string;
  backgroundMusic: string;
  voiceInstructions: string;
  practiceTimer: string;
  futureLanguagesTitle: string;
  privacyNoteTitle: string;
  privacyNoteBody: string;
  resetProgress: string;
  confirmReset: string;
  minutesShort: string;
  secondsShort: string;
  carRacerYou: string;
  carRacerFinish: string;
  gameTitles: Record<GameModeId, string>;
  gameDescriptions: Record<GameModeId, string>;
}

const EN: TranslationStrings = {
  appName: 'VS Math Kids',
  appSubtitle: 'Fun Learning Games for Ages 3–8',
  playNow: 'Play Games',
  switchProfile: 'Child Profiles',
  parentZone: 'Parent Zone',
  languageLabel: 'Language',
  welcomeGreeting: 'Learn Numbers with Joy!',
  welcomeDescription:
    'Count, add, subtract, race cars, and grow your own flower garden with Leo the Lion, Bella the Bunny, and Coco the Duck.',
  chooseHero: 'Choose Who Is Playing',
  createProfile: 'Add Child Profile',
  editProfile: 'Edit Profile',
  nicknamePlaceholder: 'e.g. Aarav or Mia',
  enterNickname: 'Child Nickname',
  pickMascot: 'Pick Your Animal Guide',
  pickLevel: 'Choose Learning Level',
  saveProfile: 'Save & Play',
  cancel: 'Cancel',
  deleteProfile: 'Remove',
  levelEasy: 'Easy (Ages 3–4)',
  levelEasyDesc: 'Count 1–10, add & subtract within 5',
  levelMedium: 'Medium (Ages 5–6)',
  levelMediumDesc: 'Count 1–50, add & subtract within 20',
  levelAdvanced: 'Advanced (Ages 7–8)',
  levelAdvancedDesc: 'Count 1–100, puzzles & big sums',
  mascotLeo: 'Leo the Lion',
  mascotLeoRole: 'Brave Counting Buddy',
  mascotBella: 'Bella the Bunny',
  mascotBellaRole: 'Smart Puzzle Friend',
  mascotCoco: 'Coco the Duck',
  mascotCocoRole: 'Speedy Math Racer',
  navHome: 'Home',
  navGames: 'All Games',
  navToybox3D: '3D Models',
  launchToybox3D: 'Explore 3D Models',
  navRewards: 'Reward Garden',
  navProfiles: 'Profiles',
  dailyGoalTitle: 'Daily Learning Goal',
  starsEarned: 'Total Stars',
  activitiesDone: 'Games Finished',
  featuredTitle: 'Ready to Play',
  allGamesTitle: 'Choose a Math Game',
  categoryAll: 'All Games',
  categoryCounting: 'Counting',
  categoryAddition: 'Addition',
  categorySubtraction: 'Subtraction',
  categoryPuzzles: 'Puzzles',
  categoryAdventure: 'Adventure',
  coreBadge: 'Core',
  bonusBadge: 'Bonus',
  agesPrefix: 'Ages',
  completedTimes: 'Played',
  hearQuestion: 'Hear Prompt',
  questionProgress: 'Question',
  checkAnswer: 'Check Answer',
  dragOrTapHint: 'Drag a tile or tap to place it!',
  dropHere: 'Drop here',
  tapChoiceHint: 'Tap the right answer!',
  encouragements: [
    'Great Job!',
    'Amazing!',
    'Well Done!',
    "You're a Math Star!",
    'Fantastic!',
  ],
  tryAgainMessages: [
    "Let's Try Again! You've got this!",
    'Almost there! Count one more time!',
    'Good try! Let us look closely together!',
  ],
  resultsTitle: "You're a Math Star!",
  resultsSubtitle: 'Look how many answers you solved today!',
  correctLabel: 'Correct',
  wrongLabel: 'Retries',
  starsLabel: 'Stars Earned',
  playAgain: 'Play Again',
  nextGame: 'Next Game',
  backHome: 'Back to Home',
  rewardsTitle: 'My Reward Garden & Stickers',
  rewardsSubtitle: 'Spend earned stars to plant your meadow and dress up your mascot!',
  gardenTab: 'Reward Garden',
  stickersTab: 'Sticker Book',
  outfitsTab: 'Mascot Outfits',
  achievementsTab: 'Achievements',
  achievementUnlocked: 'Unlocked',
  achievementInProgress: 'In Progress',
  achievementsSummary: 'Badges Earned',
  newBadgeUnlocked: 'New Badge Unlocked!',
  badgePopupHeading: 'Badge Unlocked!',
  badgePopupDismiss: 'Awesome!',
  viewAchievementsBtn: 'View Achievements',
  plantItem: 'Plant',
  planted: 'Planted!',
  needMoreStars: 'Earn more stars',
  availableStars: 'Spendable Stars',
  equipOutfit: 'Wear Outfit',
  equipped: 'Wearing',
  lockedUntil: 'Unlocks at',
  parentGateTitle: 'Parent Verification',
  parentGatePrompt: 'Please solve this grown-up check to enter the Parent Zone:',
  parentGateVerify: 'Enter Parent Zone',
  parentGateWrong: 'Not quite! Please try again.',
  parentDashboardTitle: 'Parent Dashboard',
  parentSubtitle: 'Track learning accuracy, play history, and safety settings offline.',
  statAccuracy: 'Overall Accuracy',
  statTimeSpent: 'Time Learning',
  statGamesPlayed: 'Sessions Completed',
  statTotalStars: 'Total Stars Collected',
  gameHistoryTitle: 'Recent Learning History',
  noHistoryYet: 'No games completed for this profile yet. Start a game to see progress!',
  difficultyControlsTitle: 'Difficulty & Number Range',
  customMaxRangeLabel: 'Maximum Number Range',
  usePresetRange: 'Use Level Preset',
  audioSettingsTitle: 'Audio & Accessibility',
  soundEffects: 'Cheerful Sound Effects',
  backgroundMusic: 'Soft Playroom Melody',
  voiceInstructions: 'Spoken Voice Prompts',
  practiceTimer: 'Optional Practice Timer',
  futureLanguagesTitle: 'Localization Architecture',
  privacyNoteTitle: 'Child Safety & Offline Privacy',
  privacyNoteBody:
    '100% offline-first. No ads, no external links for children, no accounts required, and all progress stays privately on this device.',
  resetProgress: 'Reset Profile Progress',
  confirmReset: 'Tap Again to Confirm Reset',
  minutesShort: 'm',
  secondsShort: 's',
  carRacerYou: 'Your Car',
  carRacerFinish: 'Finish',
  gameTitles: {
    count_objects: 'Count Objects',
    compare_numbers: 'Compare Numbers',
    addition_puzzle: 'Addition Puzzle',
    addition_fun: 'Addition Fun',
    addition_quiz: 'Addition Quiz',
    subtraction_puzzle: 'Subtraction Puzzle',
    subtraction_fun: 'Subtraction Fun',
    subtraction_quiz: 'Subtraction Quiz',
    math_pyramid: 'Math Pyramid',
    missing_numbers: 'Missing Numbers',
    math_practice: 'Math Practice',
    logic_puzzles: 'Logic Puzzles',
    ten_frame: 'Ten Frame Addition',
    three_number_addition: 'Three Number Add',
    math_racing: 'Math Racing',
    word_problems: 'Story Word Problems',
    counting_100: 'Count 1 to 100',
  },
  gameDescriptions: {
    count_objects: 'Count colorful apples, stars, ducks, and cars.',
    compare_numbers: 'Drag greater than, less than, or equal signs.',
    addition_puzzle: 'Drag missing number blocks to solve the sum.',
    addition_fun: 'Watch two groups join together and pick the sum.',
    addition_quiz: 'Quick cheerful multiple-choice addition practice.',
    subtraction_puzzle: 'Complete subtraction blocks with visual helpers.',
    subtraction_fun: 'See objects fly away and count how many remain.',
    subtraction_quiz: 'Test your subtraction skills at your pace.',
    math_pyramid: 'Add two bottom blocks to build the block above!',
    missing_numbers: 'Find the hidden number in equations like 4 + ? = 9.',
    math_practice: 'Mixed addition, subtraction, and number challenges.',
    logic_puzzles: 'Spot number patterns, grids, and clever sequences.',
    ten_frame: 'Fill colorful ten-frame dots to master sums.',
    three_number_addition: 'Add three friendly numbers together.',
    math_racing: 'Solve math to zoom your car across the finish line!',
    word_problems: 'Listen and solve short animal story puzzles.',
    counting_100: 'Fill missing tiles on the 1 to 100 number chart.',
  },
};

const HI: TranslationStrings = {
  appName: 'VS मैथ किड्स',
  appSubtitle: '3–8 साल के बच्चों के लिए मज़ेदार गणित खेल',
  playNow: 'खेल शुरू करें',
  switchProfile: 'बच्चों की प्रोफ़ाइल',
  parentZone: 'पैरेंट ज़ोन',
  languageLabel: 'भाषा',
  welcomeGreeting: 'खेल-खेल में गणित सीखें!',
  welcomeDescription:
    'लियो शेर, बेला खरगोश और कोको बत्तख के साथ गिनती, जोड़, घटाव, कार रेसिंग और अपना बगीचा बनाएँ।',
  chooseHero: 'खिलाड़ी चुनें',
  createProfile: 'नई प्रोफ़ाइल जोड़ें',
  editProfile: 'प्रोफ़ाइल बदलें',
  nicknamePlaceholder: 'जैसे आरव या मीरा',
  enterNickname: 'बच्चे का नाम',
  pickMascot: 'अपना साथी चुनें',
  pickLevel: 'सीखने का स्तर चुनें',
  saveProfile: 'सहेजें और खेलें',
  cancel: 'रद्द करें',
  deleteProfile: 'हटाएँ',
  levelEasy: 'आसान (3–4 साल)',
  levelEasyDesc: 'गिनती 1–10, 5 तक जोड़ व घटाव',
  levelMedium: 'मध्यम (5–6 साल)',
  levelMediumDesc: 'गिनती 1–50, 20 तक जोड़ व घटाव',
  levelAdvanced: 'उन्नत (7–8 साल)',
  levelAdvancedDesc: 'गिनती 1–100, पहेलियाँ और बड़े जोड़',
  mascotLeo: 'लियो शेर',
  mascotLeoRole: 'बहादुर गिनती साथी',
  mascotBella: 'बेला खरगोश',
  mascotBellaRole: 'चतुर पहेली दोस्त',
  mascotCoco: 'कोको बत्तख',
  mascotCocoRole: 'तेज़ गणित रेसर',
  navHome: 'होम',
  navGames: 'सभी खेल',
  navToybox3D: '3D मॉडल',
  launchToybox3D: '3D मॉडल देखें',
  navRewards: 'इनाम बगीचा',
  navProfiles: 'प्रोफ़ाइल',
  dailyGoalTitle: 'आज का लक्ष्य',
  starsEarned: 'कुल सितारे',
  activitiesDone: 'पूरे किए खेल',
  featuredTitle: 'खेलने के लिए तैयार',
  allGamesTitle: 'गणित का खेल चुनें',
  categoryAll: 'सभी खेल',
  categoryCounting: 'गिनती',
  categoryAddition: 'जोड़',
  categorySubtraction: 'घटाव',
  categoryPuzzles: 'पहेलियाँ',
  categoryAdventure: 'रोमांच',
  coreBadge: 'मुख्य',
  bonusBadge: 'बोनस',
  agesPrefix: 'उम्र',
  completedTimes: 'खेला गया',
  hearQuestion: 'सवाल सुनें',
  questionProgress: 'सवाल',
  checkAnswer: 'उत्तर जाँचें',
  dragOrTapHint: 'ब्लॉक खींचें या टैप करके रखें!',
  dropHere: 'यहाँ रखें',
  tapChoiceHint: 'सही उत्तर चुनें!',
  encouragements: [
    'शाबाश!',
    'कमाल कर दिया!',
    'बहुत बढ़िया!',
    'तुम मैथ स्टार हो!',
    'शानदार!',
  ],
  tryAgainMessages: [
    'फिर से कोशिश करें! आप कर सकते हैं!',
    'लगभग सही! एक बार फिर गिनें!',
    'अच्छा प्रयास! साथ मिलकर देखते हैं!',
  ],
  resultsTitle: 'तुम एक मैथ स्टार हो!',
  resultsSubtitle: 'देखो आज आपने कितने सवाल हल किए!',
  correctLabel: 'सही',
  wrongLabel: 'कोशिशें',
  starsLabel: 'मिले सितारे',
  playAgain: 'फिर से खेलें',
  nextGame: 'अगला खेल',
  backHome: 'होम पर जाएँ',
  rewardsTitle: 'मेरा इनाम बगीचा और स्टिकर',
  rewardsSubtitle: 'सितारों से बगीचे में पौधे लगाएँ और अपने साथी को सजाएँ!',
  gardenTab: 'इनाम बगीचा',
  stickersTab: 'स्टिकर किताब',
  outfitsTab: 'साथी के कपड़े',
  achievementsTab: 'उपलब्धियाँ',
  achievementUnlocked: 'अनलॉक हो गया',
  achievementInProgress: 'प्रगति पर',
  achievementsSummary: 'मिले बैज',
  newBadgeUnlocked: 'नया बैज मिला!',
  badgePopupHeading: 'नया बैज अनलॉक हुआ!',
  badgePopupDismiss: 'बहुत बढ़िया!',
  viewAchievementsBtn: 'सभी बैज देखें',
  plantItem: 'लगाएँ',
  planted: 'लगा दिया!',
  needMoreStars: 'और सितारे जीतें',
  availableStars: 'उपलब्ध सितारे',
  equipOutfit: 'पहनाएँ',
  equipped: 'पहना हुआ',
  lockedUntil: 'खुलता है',
  parentGateTitle: 'अभिभावक जाँच',
  parentGatePrompt: 'पैरेंट ज़ोन खोलने के लिए यह सवाल हल करें:',
  parentGateVerify: 'पैरेंट ज़ोन खोलें',
  parentGateWrong: 'सही नहीं है! फिर से प्रयास करें।',
  parentDashboardTitle: 'पैरेंट डैशबोर्ड',
  parentSubtitle: 'बच्चों की प्रगति, सटीकता और ऑफ़लाइन सुरक्षा सेटिंग्स देखें।',
  statAccuracy: 'कुल सटीकता',
  statTimeSpent: 'सीखने का समय',
  statGamesPlayed: 'पूरे किए सत्र',
  statTotalStars: 'कुल इकट्ठे सितारे',
  gameHistoryTitle: 'हाल के खेल का रिकॉर्ड',
  noHistoryYet: 'इस प्रोफ़ाइल के लिए अभी कोई खेल नहीं खेला गया है।',
  difficultyControlsTitle: 'कठिनाई और संख्या सीमा',
  customMaxRangeLabel: 'अधिकतम संख्या सीमा',
  usePresetRange: 'स्तर के अनुसार रखें',
  audioSettingsTitle: 'आवाज़ और सुविधा',
  soundEffects: 'मज़ेदार ध्वनि प्रभाव',
  backgroundMusic: 'हल्का बैकग्राउंड संगीत',
  voiceInstructions: 'बोलकर निर्देश',
  practiceTimer: 'वैकल्पिक अभ्यास टाइमर',
  futureLanguagesTitle: 'भाषा विस्तार प्रणाली',
  privacyNoteTitle: 'बाल सुरक्षा और ऑफ़लाइन गोपनीयता',
  privacyNoteBody:
    'पूरी तरह ऑफ़लाइन। कोई विज्ञापन नहीं, बच्चों के लिए कोई बाहरी लिंक नहीं, और सारा डेटा आपके डिवाइस पर सुरक्षित रहता है।',
  resetProgress: 'प्रोफ़ाइल प्रगति रीसेट करें',
  confirmReset: 'पुष्टि के लिए फिर दबाएँ',
  minutesShort: 'मि',
  secondsShort: 'से',
  carRacerYou: 'आपकी कार',
  carRacerFinish: 'लक्ष्य',
  gameTitles: {
    count_objects: 'चीज़ें गिनें',
    compare_numbers: 'संख्या तुलना',
    addition_puzzle: 'जोड़ पहेली',
    addition_fun: 'मज़ेदार जोड़',
    addition_quiz: 'जोड़ प्रश्नोत्तरी',
    subtraction_puzzle: 'घटाव पहेली',
    subtraction_fun: 'मज़ेदार घटाव',
    subtraction_quiz: 'घटाव प्रश्नोत्तरी',
    math_pyramid: 'गणित पिरामिड',
    missing_numbers: 'गायब संख्या',
    math_practice: 'गणित अभ्यास',
    logic_puzzles: 'तर्क पहेलियाँ',
    ten_frame: 'टेन फ्रेम जोड़',
    three_number_addition: 'तीन संख्याओं का जोड़',
    math_racing: 'गणित कार रेस',
    word_problems: 'कहानी सवाल',
    counting_100: '1 से 100 गिनती',
  },
  gameDescriptions: {
    count_objects: 'सेब, सितारे, बत्तख और कारें गिनें।',
    compare_numbers: 'बड़ा, छोटा या बराबर चिन्ह खींचें।',
    addition_puzzle: 'गायब संख्या ब्लॉक रखकर जोड़ पूरा करें।',
    addition_fun: 'दो समूहों को मिलाकर सही जोड़ चुनें।',
    addition_quiz: 'आसान से कठिन जोड़ के सवाल हल करें।',
    subtraction_puzzle: 'चित्रों की मदद से घटाव ब्लॉक भरें।',
    subtraction_fun: 'उड़ती हुई चीज़ें देखें और बची संख्या गिनें।',
    subtraction_quiz: 'अपनी गति से घटाव का अभ्यास करें।',
    math_pyramid: 'नीचे के दो ब्लॉक जोड़कर ऊपर का ब्लॉक बनाएँ!',
    missing_numbers: '4 + ? = 9 जैसी पहेली में छिपा अंक खोजें।',
    math_practice: 'जोड़, घटाव और संख्या पहचान का मिश्रित अभ्यास।',
    logic_puzzles: 'पैटर्न, ग्रिड और संख्या क्रम पूरा करें।',
    ten_frame: 'टेन फ्रेम डॉट्स भरकर जोड़ सीखें।',
    three_number_addition: 'तीन आसान संख्याओं को एक साथ जोड़ें।',
    math_racing: 'सही उत्तर देकर अपनी कार को जीत की रेखा तक ले जाएँ!',
    word_problems: 'मज़ेदार कहानियाँ सुनकर गणित हल करें।',
    counting_100: '1 से 100 चार्ट में छूटी हुई संख्या भरें।',
  },
};

// Extensible registry prepared for Spanish (es), French (fr), German (de), Portuguese (pt), Arabic (ar)
export const SUPPORTED_LANGUAGES: Array<{
  code: FutureLanguageCode;
  label: string;
  nativeName: string;
  ready: boolean;
}> = [
  { code: 'en', label: 'English', nativeName: 'English', ready: true },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', ready: true },
  { code: 'es', label: 'Spanish', nativeName: 'Español', ready: false },
  { code: 'fr', label: 'French', nativeName: 'Français', ready: false },
  { code: 'de', label: 'German', nativeName: 'Deutsch', ready: false },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', ready: false },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', ready: false },
];

export function getTranslations(lang: LanguageCode): TranslationStrings {
  return lang === 'hi' ? HI : EN;
}

export function getDifficultyLabel(level: DifficultyLevel, t: TranslationStrings): string {
  if (level === 'easy') return t.levelEasy;
  if (level === 'medium') return t.levelMedium;
  return t.levelAdvanced;
}

export function getCategoryLabel(category: GameCategory | 'all', t: TranslationStrings): string {
  switch (category) {
    case 'all':
      return t.categoryAll;
    case 'counting':
      return t.categoryCounting;
    case 'addition':
      return t.categoryAddition;
    case 'subtraction':
      return t.categorySubtraction;
    case 'puzzles':
      return t.categoryPuzzles;
    case 'adventure':
      return t.categoryAdventure;
  }
}
