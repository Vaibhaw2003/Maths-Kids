import {
  DifficultyLevel,
  GameModeId,
  LanguageCode,
  VisualObjectType,
} from '../types/game';

const OBJECT_TYPES: VisualObjectType[] = [
  'apple',
  'banana',
  'star',
  'duck',
  'candy',
  'car',
  'balloon',
];

const OBJECT_NAMES: Record<VisualObjectType, { enSingular: string; enPlural: string; hi: string }> = {
  apple: { enSingular: 'apple', enPlural: 'apples', hi: 'सेब' },
  banana: { enSingular: 'banana', enPlural: 'bananas', hi: 'केले' },
  star: { enSingular: 'star', enPlural: 'stars', hi: 'सितारे' },
  duck: { enSingular: 'duck', enPlural: 'ducks', hi: 'बत्तखें' },
  candy: { enSingular: 'candy', enPlural: 'candies', hi: 'टॉफ़ियाँ' },
  car: { enSingular: 'car', enPlural: 'cars', hi: 'कारें' },
  balloon: { enSingular: 'balloon', enPlural: 'balloons', hi: 'गुब्बारे' },
};

const NUMBER_WORDS_EN: Record<number, string> = {
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
};

const NUMBER_WORDS_HI: Record<number, string> = {
  1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच',
  6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस',
  11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पंद्रह',
  16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस', 20: 'बीस',
};

export type GeneratedQuestion =
  | {
      id: string;
      kind: 'count_objects';
      objectType: VisualObjectType;
      count: number;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'compare_numbers';
      objectType: VisualObjectType;
      leftCount: number;
      rightCount: number;
      answer: '<' | '>' | '=';
      choices: Array<'<' | '>' | '='>;
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'addition_puzzle';
      a: number;
      b: number;
      sum: number;
      missingSlot: 'a' | 'b' | 'sum';
      objectType: VisualObjectType;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'addition_fun';
      a: number;
      b: number;
      sum: number;
      objectType: VisualObjectType;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'addition_quiz';
      a: number;
      b: number;
      sum: number;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'subtraction_puzzle';
      total: number;
      subtract: number;
      result: number;
      puzzleType: 'number' | 'operator';
      objectType: VisualObjectType;
      answer: number | '+' | '-';
      choices: Array<number | '+' | '-'>;
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'subtraction_fun';
      total: number;
      subtract: number;
      result: number;
      objectType: VisualObjectType;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'subtraction_quiz';
      total: number;
      subtract: number;
      result: number;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'math_pyramid';
      rows: number[][];
      missingKey: string; // e.g. "0-0"
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'missing_numbers';
      left: number;
      right: number;
      result: number;
      operator: '+' | '-';
      missingPos: 'left' | 'right';
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'number_recognition';
      targetNumber: number;
      wordEn: string;
      wordHi: string;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'logic_puzzles';
      variant: 'sequence' | 'grid';
      sequence?: Array<number | null>;
      grid?: Array<Array<number | null>>;
      hintEn: string;
      hintHi: string;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'ten_frame';
      a: number;
      b: number;
      sum: number;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'three_number_addition';
      a: number;
      b: number;
      c: number;
      sum: number;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'math_racing';
      equation: string;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'word_problems';
      objectType: VisualObjectType;
      a: number;
      b: number;
      operator: '+' | '-';
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    }
  | {
      id: string;
      kind: 'counting_100';
      cells: Array<{ num: number; isMissing: boolean }>;
      answer: number;
      choices: number[];
      promptEn: string;
      promptHi: string;
    };

function randInt(min: number, max: number): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  if (high <= low) return low;
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeNumericChoices(answer: number, minVal: number, maxVal: number, count = 4): number[] {
  const set = new Set<number>([answer]);
  let attempts = 0;
  while (set.size < count && attempts < 60) {
    attempts++;
    const delta = randInt(-4, 4);
    const candidate = answer + (delta === 0 ? 1 : delta);
    if (candidate >= minVal && candidate <= Math.max(maxVal, answer + 4)) {
      set.add(candidate);
    }
  }
  while (set.size < count) {
    set.add(randInt(minVal, Math.max(minVal + count + 3, maxVal)));
  }
  return shuffle(Array.from(set));
}

function getEffectiveRange(difficulty: DifficultyLevel, customMax: number | null) {
  const preset =
    difficulty === 'easy'
      ? { countMax: 10, sumMax: 5 }
      : difficulty === 'medium'
      ? { countMax: 20, sumMax: 20 }
      : { countMax: 100, sumMax: 100 };

  if (customMax && customMax >= 5) {
    return {
      countMax: Math.min(customMax, 100),
      sumMax: customMax,
    };
  }
  return preset;
}

export function getPromptText(q: GeneratedQuestion, lang: LanguageCode): string {
  return lang === 'hi' ? q.promptHi : q.promptEn;
}

export function generateQuestion(
  gameId: GameModeId,
  difficulty: DifficultyLevel,
  customMax: number | null,
  usedSignatures: Set<string>,
  quizRangeOverride?: number
): GeneratedQuestion {
  const range = getEffectiveRange(difficulty, customMax);
  const sumLimit = quizRangeOverride ?? range.sumMax;

  for (let attempt = 0; attempt < 25; attempt++) {
    const q = buildCandidateQuestion(gameId, difficulty, range.countMax, sumLimit);
    const sig = `${q.kind}:${q.promptEn}:${q.answer}`;
    if (!usedSignatures.has(sig) || attempt === 24) {
      usedSignatures.add(sig);
      return q;
    }
  }
  return buildCandidateQuestion(gameId, difficulty, range.countMax, sumLimit);
}

function buildCandidateQuestion(
  gameId: GameModeId,
  difficulty: DifficultyLevel,
  countMax: number,
  sumMax: number
): GeneratedQuestion {
  const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const objectType = pickRandom(OBJECT_TYPES);
  const objNames = OBJECT_NAMES[objectType];

  if (gameId === 'math_practice') {
    const pick = pickRandom<GameModeId>([
      'addition_quiz',
      'subtraction_quiz',
      'number_recognition' as GameModeId,
    ]);
    if (pick === ('number_recognition' as GameModeId)) {
      const limit = Math.min(20, Math.max(5, sumMax));
      const target = randInt(1, limit);
      return {
        id,
        kind: 'number_recognition',
        targetNumber: target,
        wordEn: NUMBER_WORDS_EN[target] || String(target),
        wordHi: NUMBER_WORDS_HI[target] || String(target),
        answer: target,
        choices: makeNumericChoices(target, 1, limit, 4),
        promptEn: `Tap the number "${NUMBER_WORDS_EN[target] || target}"!`,
        promptHi: `संख्या "${NUMBER_WORDS_HI[target] || target}" पर टैप करें!`,
      };
    }
    return buildCandidateQuestion(pick, difficulty, countMax, sumMax);
  }

  switch (gameId) {
    case 'count_objects': {
      const visualCap = difficulty === 'easy' ? Math.min(10, countMax) : Math.min(15, countMax);
      const count = randInt(1, Math.max(3, visualCap));
      return {
        id,
        kind: 'count_objects',
        objectType,
        count,
        answer: count,
        choices: makeNumericChoices(count, 1, Math.max(5, visualCap), 4),
        promptEn: `How many ${count === 1 ? objNames.enSingular : objNames.enPlural} can you count?`,
        promptHi: `यहाँ कितने ${objNames.hi} हैं? गिनकर बताएँ!`,
      };
    }

    case 'compare_numbers': {
      const cap = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 12 : 16;
      const leftCount = randInt(1, cap);
      const makeEqual = Math.random() < 0.22;
      const rightCount = makeEqual ? leftCount : randInt(1, cap);
      const answer: '<' | '>' | '=' =
        leftCount > rightCount ? '>' : leftCount < rightCount ? '<' : '=';
      return {
        id,
        kind: 'compare_numbers',
        objectType,
        leftCount,
        rightCount,
        answer,
        choices: ['>', '<', '='],
        promptEn: 'Compare the two groups! Pick >, <, or =.',
        promptHi: 'दोनों समूहों की तुलना करें! >, < या = चुनें।',
      };
    }

    case 'addition_puzzle': {
      const maxS = Math.min(20, Math.max(4, sumMax));
      const a = randInt(1, Math.max(2, maxS - 1));
      const b = randInt(1, Math.max(1, maxS - a));
      const sum = a + b;
      const missingSlot = pickRandom<('a' | 'b' | 'sum')>(['b', 'a', 'sum']);
      const answer = missingSlot === 'a' ? a : missingSlot === 'b' ? b : sum;
      return {
        id,
        kind: 'addition_puzzle',
        a,
        b,
        sum,
        missingSlot,
        objectType,
        answer,
        choices: makeNumericChoices(answer, 1, maxS + 2, 4),
        promptEn: 'Drag or tap the missing number block to solve!',
        promptHi: 'सही संख्या ब्लॉक रखकर जोड़ पहेली हल करें!',
      };
    }

    case 'addition_fun': {
      const maxS = Math.min(14, Math.max(4, sumMax));
      const a = randInt(1, Math.max(2, Math.floor(maxS / 2) + 1));
      const b = randInt(1, Math.max(1, maxS - a));
      const sum = a + b;
      return {
        id,
        kind: 'addition_fun',
        a,
        b,
        sum,
        objectType,
        answer: sum,
        choices: makeNumericChoices(sum, 2, maxS + 2, 4),
        promptEn: `Add ${a} and ${b} ${objNames.enPlural} together!`,
        promptHi: `${a} और ${b} ${objNames.hi} को आपस में जोड़ें!`,
      };
    }

    case 'addition_quiz': {
      const a = randInt(0, Math.max(2, Math.floor(sumMax * 0.6)));
      const b = randInt(0, Math.max(1, sumMax - a));
      const sum = a + b;
      return {
        id,
        kind: 'addition_quiz',
        a,
        b,
        sum,
        answer: sum,
        choices: makeNumericChoices(sum, 0, sumMax + 4, 4),
        promptEn: `What is ${a} + ${b}?`,
        promptHi: `${a} + ${b} कितना होता है?`,
      };
    }

    case 'subtraction_puzzle': {
      const maxS = Math.min(18, Math.max(5, sumMax));
      const total = randInt(3, maxS);
      const subtract = randInt(1, total - 1);
      const result = total - subtract;
      const isOperator = Math.random() < 0.35;
      if (isOperator) {
        return {
          id,
          kind: 'subtraction_puzzle',
          total,
          subtract,
          result,
          puzzleType: 'operator',
          objectType,
          answer: '-',
          choices: ['-', '+'],
          promptEn: `Choose + or - to complete: ${total} ? ${subtract} = ${result}`,
          promptHi: `सही चिन्ह (+ या -) चुनें: ${total} ? ${subtract} = ${result}`,
        };
      }
      return {
        id,
        kind: 'subtraction_puzzle',
        total,
        subtract,
        result,
        puzzleType: 'number',
        objectType,
        answer: subtract,
        choices: makeNumericChoices(subtract, 1, total, 4),
        promptEn: `Find the missing number: ${total} - ? = ${result}`,
        promptHi: `गायब संख्या खोजें: ${total} - ? = ${result}`,
      };
    }

    case 'subtraction_fun': {
      const maxS = Math.min(12, Math.max(5, sumMax));
      const total = randInt(3, maxS);
      const subtract = randInt(1, total - 1);
      const result = total - subtract;
      return {
        id,
        kind: 'subtraction_fun',
        total,
        subtract,
        result,
        objectType,
        answer: result,
        choices: makeNumericChoices(result, 0, total, 4),
        promptEn: `${total} ${objNames.enPlural}, ${subtract} flew away! How many are left?`,
        promptHi: `${total} ${objNames.hi} थे, ${subtract} चले गए! कितने बचे?`,
      };
    }

    case 'subtraction_quiz': {
      const total = randInt(2, Math.max(5, sumMax));
      const subtract = randInt(0, total);
      const result = total - subtract;
      return {
        id,
        kind: 'subtraction_quiz',
        total,
        subtract,
        result,
        answer: result,
        choices: makeNumericChoices(result, 0, total + 3, 4),
        promptEn: `What is ${total} - ${subtract}?`,
        promptHi: `${total} - ${subtract} कितना होता है?`,
      };
    }

    case 'math_pyramid': {
      const baseCap = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 8 : 15;
      const b1 = randInt(1, baseCap);
      const b2 = randInt(1, baseCap);
      const b3 = randInt(1, baseCap);
      const m1 = b1 + b2;
      const m2 = b2 + b3;
      const top = m1 + m2;
      const rows = [[top], [m1, m2], [b1, b2, b3]];
      const slots = [
        { key: '0-0', answer: top },
        { key: '1-0', answer: m1 },
        { key: '1-1', answer: m2 },
      ];
      const chosen = pickRandom(slots);
      return {
        id,
        kind: 'math_pyramid',
        rows,
        missingKey: chosen.key,
        answer: chosen.answer,
        choices: makeNumericChoices(chosen.answer, 2, top + 6, 4),
        promptEn: 'Each upper block equals the sum of the two blocks below it!',
        promptHi: 'ऊपर वाला ब्लॉक नीचे के दो ब्लॉक के जोड़ के बराबर है!',
      };
    }

    case 'missing_numbers': {
      const useAdd = Math.random() < 0.6;
      if (useAdd) {
        const a = randInt(1, Math.max(3, Math.floor(sumMax * 0.6)));
        const b = randInt(1, Math.max(2, sumMax - a));
        const res = a + b;
        const missingPos = Math.random() < 0.5 ? 'right' : 'left';
        const answer = missingPos === 'left' ? a : b;
        return {
          id,
          kind: 'missing_numbers',
          left: a,
          right: b,
          result: res,
          operator: '+',
          missingPos,
          answer,
          choices: makeNumericChoices(answer, 1, res, 4),
          promptEn: 'Find the hidden number to balance the equation!',
          promptHi: 'समीकरण पूरा करने के लिए छिपी हुई संख्या खोजें!',
        };
      }
      const left = randInt(3, Math.max(5, sumMax));
      const right = randInt(1, left - 1);
      const res = left - right;
      const missingPos = Math.random() < 0.6 ? 'right' : 'left';
      const answer = missingPos === 'left' ? left : right;
      return {
        id,
        kind: 'missing_numbers',
        left,
        right,
        result: res,
        operator: '-',
        missingPos,
        answer,
        choices: makeNumericChoices(answer, 1, left + 4, 4),
        promptEn: 'Find the hidden number to solve the puzzle!',
        promptHi: 'पहेली हल करने के लिए छिपी हुई संख्या खोजें!',
      };
    }

    case 'logic_puzzles': {
      const isSequence = Math.random() < 0.65;
      if (isSequence) {
        const step = difficulty === 'easy' ? randInt(1, 2) : difficulty === 'medium' ? pickRandom([2, 3, 5]) : pickRandom([2, 4, 5, 10]);
        const start = randInt(1, difficulty === 'easy' ? 4 : 15);
        const seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
        const missingIdx = randInt(1, 4);
        const answer = seq[missingIdx];
        const displaySeq = seq.map((v, i) => (i === missingIdx ? null : v));
        return {
          id,
          kind: 'logic_puzzles',
          variant: 'sequence',
          sequence: displaySeq,
          hintEn: `Count forward by +${step}`,
          hintHi: `हर कदम पर +${step} जोड़ें`,
          answer,
          choices: makeNumericChoices(answer, 1, seq[4] + step, 4),
          promptEn: 'Complete the number pattern!',
          promptHi: 'संख्या पैटर्न पूरा करें!',
        };
      }
      // 2x2 magic sum grid where row sums match
      const a = randInt(1, difficulty === 'easy' ? 5 : 12);
      const b = randInt(1, difficulty === 'easy' ? 5 : 12);
      const rowSum = a + b;
      const c = randInt(1, rowSum - 1);
      const d = rowSum - c;
      return {
        id,
        kind: 'logic_puzzles',
        variant: 'grid',
        grid: [
          [a, b],
          [c, null],
        ],
        hintEn: `Each row adds up to ${rowSum}`,
        hintHi: `हर पंक्ति का जोड़ ${rowSum} है`,
        answer: d,
        choices: makeNumericChoices(d, 1, rowSum + 4, 4),
        promptEn: `Both rows have the same sum (${rowSum}). Fill the missing square!`,
        promptHi: `दोनों पंक्तियों का जोड़ बराबर (${rowSum}) है। खाली जगह भरें!`,
      };
    }

    case 'ten_frame': {
      const a = randInt(1, 7);
      const b = randInt(1, 10 - a);
      const sum = a + b;
      return {
        id,
        kind: 'ten_frame',
        a,
        b,
        sum,
        answer: sum,
        choices: makeNumericChoices(sum, 2, 10, 4),
        promptEn: `Count all blue and pink dots in the Ten Frame: ${a} + ${b} = ?`,
        promptHi: `टेन फ्रेम में नीले और गुलाबी डॉट्स गिनें: ${a} + ${b} = ?`,
      };
    }

    case 'three_number_addition': {
      const cap = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 7 : 15;
      const a = randInt(1, cap);
      const b = randInt(1, cap);
      const c = randInt(1, cap);
      const sum = a + b + c;
      return {
        id,
        kind: 'three_number_addition',
        a,
        b,
        c,
        sum,
        answer: sum,
        choices: makeNumericChoices(sum, 3, sum + 5, 4),
        promptEn: `Add all three numbers: ${a} + ${b} + ${c} = ?`,
        promptHi: `तीनों संख्याओं को जोड़ें: ${a} + ${b} + ${c} = ?`,
      };
    }

    case 'math_racing': {
      const isAdd = Math.random() < 0.6;
      if (isAdd) {
        const a = randInt(1, Math.max(3, Math.floor(sumMax * 0.5)));
        const b = randInt(1, Math.max(2, Math.floor(sumMax * 0.5)));
        const sum = a + b;
        return {
          id,
          kind: 'math_racing',
          equation: `${a} + ${b} = ?`,
          answer: sum,
          choices: makeNumericChoices(sum, 2, sum + 5, 4),
          promptEn: `Solve to boost your car: ${a} + ${b} = ?`,
          promptHi: `कार आगे बढ़ाने के लिए हल करें: ${a} + ${b} = ?`,
        };
      }
      const total = randInt(3, Math.max(5, sumMax));
      const sub = randInt(1, total - 1);
      const res = total - sub;
      return {
        id,
        kind: 'math_racing',
        equation: `${total} - ${sub} = ?`,
        answer: res,
        choices: makeNumericChoices(res, 0, total, 4),
        promptEn: `Solve to zoom ahead: ${total} - ${sub} = ?`,
        promptHi: `आगे बढ़ने के लिए हल करें: ${total} - ${sub} = ?`,
      };
    }

    case 'word_problems': {
      const maxN = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 18;
      const isAdd = Math.random() < 0.55;
      if (isAdd) {
        const a = randInt(1, Math.max(2, Math.floor(maxN / 2)));
        const b = randInt(1, Math.max(2, maxN - a));
        const ans = a + b;
        return {
          id,
          kind: 'word_problems',
          objectType,
          a,
          b,
          operator: '+',
          answer: ans,
          choices: makeNumericChoices(ans, 2, maxN + 2, 4),
          promptEn: `Leo found ${a} ${objNames.enPlural} and Bella gave him ${b} more. How many ${objNames.enPlural} in all?`,
          promptHi: `लियो को ${a} ${objNames.hi} मिले और बेला ने ${b} और दिए। कुल कितने ${objNames.hi} हुए?`,
        };
      }
      const a = randInt(3, maxN);
      const b = randInt(1, a - 1);
      const ans = a - b;
      return {
        id,
        kind: 'word_problems',
        objectType,
        a,
        b,
        operator: '-',
        answer: ans,
        choices: makeNumericChoices(ans, 0, maxN, 4),
        promptEn: `Coco had ${a} ${objNames.enPlural} and shared ${b} with friends. How many are left?`,
        promptHi: `कोको के पास ${a} ${objNames.hi} थे और उसने ${b} दोस्तों को दे दिए। कितने बचे?`,
      };
    }

    case 'counting_100': {
      const maxStart = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 45 : 95;
      const startNum = randInt(1, Math.max(1, maxStart));
      const missingOffset = randInt(1, 4);
      const cells = Array.from({ length: 6 }, (_, i) => ({
        num: startNum + i,
        isMissing: i === missingOffset,
      }));
      const answer = startNum + missingOffset;
      return {
        id,
        kind: 'counting_100',
        cells,
        answer,
        choices: makeNumericChoices(answer, 1, 100, 4),
        promptEn: 'Which number belongs in the empty tile on the 1–100 chart?',
        promptHi: '1–100 संख्या चार्ट की खाली जगह में कौन-सी संख्या आएगी?',
      };
    }
  }
}
