import { DifficultyLevel, LanguageCode } from '../types/game';

export type Challenge3DType =
  | 'count'
  | 'addition'
  | 'subtraction'
  | 'matching'
  | 'compare'
  | 'missing';

export type Challenge3DFilter = 'all' | Challenge3DType;

export interface Math3DChallenge {
  id: string;
  type: Challenge3DType;
  kind: 'apple' | 'star' | 'car';
  /** Primary visual count (or initial count on tree/meadow) */
  countA: number;
  /** Secondary count (added in addition, removed in subtraction, right side in compare, target in missing) */
  countB: number;
  /** Whether addition/subtraction happens directly on the Apple Tree */
  onTree: boolean;
  promptEn: string;
  promptHi: string;
  equationText: string;
  answer: string;
  choices: string[];
  solved: boolean;
}

export type TrainActivityKind = 'wheels' | 'compartments' | 'addition';

export interface TrainMicroQuiz {
  id: string;
  kind: TrainActivityKind;
  promptEn: string;
  promptHi: string;
  answer: number;
  choices: number[];
}

export interface RobotMicroQuiz {
  id: string;
  targetPartKind: 'eyes' | 'arms' | 'legs' | 'head' | 'antenna';
  promptEn: string;
  promptHi: string;
  answer: number;
  choices: number[];
}

let challengeSeq = 0;

function makeId(prefix: string): string {
  challengeSeq += 1;
  return `${prefix}_${Date.now()}_${challengeSeq}`;
}

function buildNumberChoices(correct: number, minVal: number, maxVal: number): string[] {
  const set = new Set<number>([correct]);
  let guard = 0;
  while (set.size < 4 && guard < 40) {
    guard += 1;
    const offset = Math.floor(Math.random() * 5) - 2;
    const cand = correct + (offset === 0 ? 1 : offset);
    if (cand >= minVal && cand <= maxVal) {
      set.add(cand);
    }
  }
  while (set.size < 4) {
    set.add(Math.max(minVal, correct + set.size));
  }
  return Array.from(set)
    .sort((a, b) => a - b)
    .map(String);
}

export function generateMath3DChallenge(
  difficulty: DifficultyLevel,
  filter: Challenge3DFilter
): Math3DChallenge {
  const allTypes: Challenge3DType[] = [
    'count',
    'addition',
    'subtraction',
    'matching',
    'compare',
    'missing',
  ];
  const type: Challenge3DType =
    filter === 'all'
      ? allTypes[Math.floor(Math.random() * allTypes.length)]
      : filter;

  const kinds: Array<'apple' | 'star' | 'car'> = ['apple', 'star', 'car'];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];

  const maxCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;

  if (type === 'count') {
    const n = Math.floor(Math.random() * (maxCount - 2 + 1)) + 2;
    return {
      id: makeId('count'),
      type,
      kind,
      countA: n,
      countB: 0,
      onTree: false,
      promptEn: 'Tap each 3D object to count, then pick the total!',
      promptHi: 'हर 3D चीज़ को टैप करके गिनें और सही संख्या चुनें!',
      equationText: `?`,
      answer: String(n),
      choices: buildNumberChoices(n, 1, maxCount + 2),
      solved: false,
    };
  }

  if (type === 'addition') {
    const onTree = Math.random() < 0.65;
    const maxTotal = onTree ? 8 : maxCount;
    const a = Math.floor(Math.random() * (Math.min(4, maxTotal - 2))) + 1;
    const b = Math.floor(Math.random() * (Math.min(4, maxTotal - a))) + 1;
    const sum = a + b;
    const itemNameEn = onTree ? 'apples' : kind === 'apple' ? 'apples' : kind === 'star' ? 'stars' : 'cars';
    const itemNameHi = onTree ? 'सेब' : kind === 'apple' ? 'सेब' : kind === 'star' ? 'सितारे' : 'कारें';
    return {
      id: makeId('add'),
      type,
      kind: onTree ? 'apple' : kind,
      countA: a,
      countB: b,
      onTree,
      promptEn: onTree
        ? `${a} apples on the tree + ${b} more apples = ?`
        : `${a} ${itemNameEn} + ${b} more ${itemNameEn} = ?`,
      promptHi: onTree
        ? `पेड़ पर ${a} सेब + ${b} और सेब = ?`
        : `${a} ${itemNameHi} + ${b} और ${itemNameHi} = ?`,
      equationText: `${a} + ${b} = ?`,
      answer: String(sum),
      choices: buildNumberChoices(sum, 2, maxTotal + 2),
      solved: false,
    };
  }

  if (type === 'subtraction') {
    const start = Math.floor(Math.random() * (Math.min(8, maxCount) - 3 + 1)) + 3;
    const remove = Math.floor(Math.random() * (start - 1)) + 1;
    const remain = start - remove;
    return {
      id: makeId('sub'),
      type,
      kind,
      countA: start,
      countB: remove,
      onTree: false,
      promptEn: `${start} objects, ${remove} fly away! How many are left?`,
      promptHi: `${start} चीज़ों में से ${remove} चली गईं! कितनी बचीं?`,
      equationText: `${start} - ${remove} = ?`,
      answer: String(remain),
      choices: buildNumberChoices(remain, 0, start),
      solved: false,
    };
  }

  if (type === 'matching') {
    const target = Math.floor(Math.random() * (Math.min(8, maxCount) - 2 + 1)) + 2;
    return {
      id: makeId('match'),
      type,
      kind,
      countA: target,
      countB: 0,
      onTree: false,
      promptEn: 'Match the 3D group to its exact number!',
      promptHi: '3D समूह को सही संख्या से मिलाएँ!',
      equationText: `${target === 1 ? '1' : '?'}`,
      answer: String(target),
      choices: buildNumberChoices(target, 1, maxCount + 1),
      solved: false,
    };
  }

  if (type === 'compare') {
    const left = Math.floor(Math.random() * 5) + 1;
    const right =
      Math.random() < 0.25
        ? left
        : Math.max(1, Math.min(6, left + (Math.random() < 0.5 ? 2 : -1)));
    const answer = left > right ? '>' : left < right ? '<' : '=';
    return {
      id: makeId('cmp'),
      type,
      kind,
      countA: left,
      countB: right,
      onTree: false,
      promptEn: `Compare Left (${left}) and Right (${right}) 3D groups:`,
      promptHi: `बाएँ (${left}) और दाएँ (${right}) 3D समूह की तुलना करें:`,
      equationText: `${left}  ?  ${right}`,
      answer,
      choices: ['<', '=', '>'],
      solved: false,
    };
  }

  // Missing numbers: a + ? = total
  const a = Math.floor(Math.random() * 4) + 1;
  const missing = Math.floor(Math.random() * 4) + 1;
  const total = a + missing;
  return {
    id: makeId('miss'),
    type: 'missing',
    kind,
    countA: a,
    countB: missing,
    onTree: false,
    promptEn: `${a} solid + ? glowing slots = ${total}. Find the missing number!`,
    promptHi: `${a} चीज़ें + ? खाली जगह = ${total}। गायब संख्या खोजें!`,
    equationText: `${a} + ? = ${total}`,
    answer: String(missing),
    choices: buildNumberChoices(missing, 1, 7),
    solved: false,
  };
}

export function generateTrainQuiz(kind: TrainActivityKind): TrainMicroQuiz {
  if (kind === 'wheels') {
    return {
      id: makeId('train_wheels'),
      kind,
      promptEn: 'Tap the wheels on the engine & cars! How many wheels on the engine?',
      promptHi: 'इंजन के पहिए टैप करके गिनें! इंजन में कितने पहिए हैं?',
      answer: 6,
      choices: [4, 6, 8],
    };
  }
  if (kind === 'compartments') {
    return {
      id: makeId('train_comp'),
      kind,
      promptEn: 'Tap the colorful compartments behind the engine. How many cars?',
      promptHi: 'इंजन के पीछे जुड़े डिब्बे गिनें। कुल कितने डिब्बे हैं?',
      answer: 2,
      choices: [1, 2, 3],
    };
  }
  // Addition using compartments
  return {
    id: makeId('train_add'),
    kind: 'addition',
    promptEn: '1 Engine + 2 Compartments = How many train sections in all?',
    promptHi: '1 इंजन + 2 डिब्बे = कुल कितने भाग हुए?',
    answer: 3,
    choices: [2, 3, 4],
  };
}

export function generateRobotQuiz(
  targetPartKind: RobotMicroQuiz['targetPartKind']
): RobotMicroQuiz {
  switch (targetPartKind) {
    case 'eyes':
      return {
        id: makeId('robot_eyes'),
        targetPartKind,
        promptEn: 'Tap Robo-Buddy’s glowing eyes! How many eyes?',
        promptHi: 'रोबो दोस्त की आँखें टैप करें! कितनी आँखें हैं?',
        answer: 2,
        choices: [1, 2, 3],
      };
    case 'arms':
      return {
        id: makeId('robot_arms'),
        targetPartKind,
        promptEn: 'Tap Robo-Buddy’s arms! How many arms?',
        promptHi: 'रोबो दोस्त के हाथ टैप करें! कितने हाथ हैं?',
        answer: 2,
        choices: [2, 3, 4],
      };
    case 'legs':
      return {
        id: makeId('robot_legs'),
        targetPartKind,
        promptEn: 'Tap Robo-Buddy’s legs & boots! How many legs?',
        promptHi: 'रोबो दोस्त के पैर टैप करें! कितने पैर हैं?',
        answer: 2,
        choices: [1, 2, 4],
      };
    case 'antenna':
      return {
        id: makeId('robot_ant'),
        targetPartKind,
        promptEn: 'Tap the antenna on top! How many antennas?',
        promptHi: 'सिर के ऊपर एंटीना टैप करें! कितने एंटीना हैं?',
        answer: 1,
        choices: [1, 2, 3],
      };
    case 'head':
      return {
        id: makeId('robot_head'),
        targetPartKind,
        promptEn: 'Tap Robo-Buddy’s head! How many heads?',
        promptHi: 'रोबो दोस्त का सिर टैप करें! कितने सिर हैं?',
        answer: 1,
        choices: [1, 2, 3],
      };
  }
}

export function formatChallengeVoice(ch: Math3DChallenge, lang: LanguageCode): string {
  return lang === 'hi' ? ch.promptHi : ch.promptEn;
}
