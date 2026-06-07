export interface ValidationResult {
  valid: boolean;
  message: string;
  warnings: string[];
  qualityScore: number;
}

const MIN_MEANINGFUL_LENGTH = 16;
const MIN_MEANINGFUL_WORDS = 3;
const MIN_QUALITY_SCORE = 70;

const STOP_WORDS = new Set<string>([
  'the', 'and', 'for', 'with', 'that', 'from', 'this', 'will', 'have', 'has', 'are', 'was', 'were',
  'but', 'not', 'you', 'your', 'our', 'all', 'any', 'new', 'up', 'out', 'into', 'even', 'more', 'most',
  'can', 'its', 'also', 'use', 'uses', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'by', 'as', 'is', 'it', 'be',
  'or', 'if', 'so', 'too', 'very', 'just', 'than', 'that', 'which', 'these', 'those', 'their', 'they', 'them'
]);

const STRONG_SIGNAL_PATTERN = /\b(?:growth|increase|increased|increases|decline|declined|declines|decrease|decreased|decreases|rise|rising|fall|falling|profit|loss|demand|sales|revenue|forecast|trend|market|customer|volume|usage|traffic|adoption|performance|margin|rate|quarter|month|year|recovery|expansion|contraction|acceleration|deceleration|stability|stable|volatile|growth|demand|share)\b/i;
const ACTION_VERB_PATTERN = /\b(?:grow|growning|growing|increase|increased|increases|decrease|decreased|decreases|rise|rising|fall|falling|expand|contracts|contract|accelerate|accelerating|decelerate|decelerating|improve|improving|worsen|worsening|strengthen|weakening|stabilize|stabilizing|surge|surging|drop|dropping|gain|gaining|lose|losing)\b/i;
const NOUN_ONLY_PATTERN = /\b(?:apple|banana|moon|car|random|fish|cloud|tree|chair|table|dog|cat|ball)\b/i;
const GIBBERISH_KEYBOARD_PATTERN = /^(?:qwerty|asdf|zxcv|zxcvbnm|asdfghjkl|qazwsx|12345|54321|98765|00000|111111|000000|999999)$/i;
const REPEATED_CHAR_PATTERN = /^([a-z])\1+$/i;

const PUNCTUATION_ONLY_REGEX = /^[\p{P}\s]+$/u;
const SYMBOL_ONLY_REGEX = /^[\p{S}\s]+$/u;
const PUNCTUATION_SYMBOL_ONLY_REGEX = /^[\p{P}\p{S}\s]+$/u;
const NUMERIC_ONLY_REGEX = /^[\d\s]+$/;
const WHITESPACE_ONLY_REGEX = /^\s*$/;

export function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractWords(text: string) {
  return normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter(Boolean);
}

export function calculateMeaningfulWords(text: string) {
  return extractWords(text).filter((token) => token.length >= 3 && !STOP_WORDS.has(token)).length;
}

function isPotentiallyGibberishToken(token: string) {
  if (GIBBERISH_KEYBOARD_PATTERN.test(token)) return true;
  if (REPEATED_CHAR_PATTERN.test(token)) return true;
  if (token.length >= 5 && !/[aeiouy]/i.test(token)) return true;
  if (/^[a-z]{1,2}$/i.test(token)) return true;
  return false;
}

function calculateNoiseRatio(text: string) {
  const raw = normalizeText(text);
  if (!raw.length) return 1;
  const nonAlphaNumeric = raw.replace(/[A-Za-z0-9]/g, '');
  return nonAlphaNumeric.length / raw.length;
}

export function validatePredictionInput(query: string): ValidationResult {
  const normalized = normalizeText(query);
  const warnings: string[] = [];

  if (!normalized || WHITESPACE_ONLY_REGEX.test(query)) {
    return {
      valid: false,
      message: 'Prediction cannot be generated because the input is empty or contains only whitespace. Please enter meaningful text.',
      warnings,
      qualityScore: 0,
    };
  }

  const compact = normalized.replace(/\s+/g, '');
  const containsAlphabetic = /[A-Za-z]/.test(compact);
  if (!containsAlphabetic) {
    return {
      valid: false,
      message: 'Prediction cannot be generated because the input contains only punctuation or special characters. Please enter meaningful text.',
      warnings: ['Detected input without alphabetic characters.'],
      qualityScore: 0,
    };
  }

  return {
    valid: true,
    message: 'Input passes basic validation.',
    warnings,
    qualityScore: 100,
  };
}

export function purgeInvalidPredictions(database: { predictions: any[]; users: any[] }) {
  const beforeCount = database.predictions.length;
  const validPredictions = database.predictions.filter((prediction) => {
    if (!prediction || typeof prediction.query !== 'string') return false;
    return validatePredictionInput(prediction.query).valid;
  });

  if (validPredictions.length !== beforeCount) {
    database.predictions = validPredictions;

    const countsByUser = new Map<string, number>();
    database.predictions.forEach((prediction) => {
      const userId = prediction.userId;
      if (typeof userId === 'string') {
        countsByUser.set(userId, (countsByUser.get(userId) || 0) + 1);
      }
    });

    database.users.forEach((user) => {
      if (typeof user.id === 'string') {
        user.predictionCount = countsByUser.get(user.id) || 0;
      }
    });
  }
}
