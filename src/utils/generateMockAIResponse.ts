const DEFAULT_WORDS = [
  'analysis',
  'approach',
  'architecture',
  'context',
  'data',
  'design',
  'insight',
  'iteration',
  'metric',
  'model',
  'pattern',
  'process',
  'refinement',
  'scenario',
  'solution',
  'strategy',
  'structure',
  'system',
  'trade-off',
  'workflow'
];

type Range = {
  min: number;
  max: number;
};

export interface MockAIResponseOptions {
  lengthRange?: Range;
  delayRangeMs?: Range;
}

const DEFAULT_LENGTH_RANGE: Range = { min: 140, max: 260 };
const DEFAULT_DELAY_RANGE_MS: Range = { min: 300, max: 800 };

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const randomIntInRange = ({ min, max }: Range) => {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);

  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const buildRandomBody = (targetLength: number) => {
  const words: string[] = [];

  while (words.join(' ').length < targetLength) {
    const nextWord = DEFAULT_WORDS[Math.floor(Math.random() * DEFAULT_WORDS.length)];
    words.push(nextWord);
  }

  return words.join(' ').slice(0, targetLength).trim();
};

export const generateMockAIResponse = (question: string, length: number) => {
  const sanitizedLength = clamp(Math.floor(length), 32, 2000);
  const intro = question.trim()
    ? `Here is a simulated answer about "${question.trim()}": `
    : 'Here is a simulated answer: ';

  const bodyLength = Math.max(sanitizedLength - intro.length, 0);
  const body = buildRandomBody(bodyLength);

  const response = `${intro}${body}`.trim();

  return response.length > sanitizedLength
    ? response.slice(0, sanitizedLength).trimEnd()
    : response;
};

export const fetchMockAIResponse = async (
  question: string,
  options: MockAIResponseOptions = {}
): Promise<string> => {
  const lengthRange = options.lengthRange ?? DEFAULT_LENGTH_RANGE;
  const delayRange = options.delayRangeMs ?? DEFAULT_DELAY_RANGE_MS;

  const targetLength = randomIntInRange(lengthRange);
  const delay = randomIntInRange(delayRange);

  await new Promise((resolve) => setTimeout(resolve, delay));

  return generateMockAIResponse(question, targetLength);
};
