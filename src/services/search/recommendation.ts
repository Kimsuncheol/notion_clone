import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import type { FirebaseNoteContent, TagType } from '@/types/firebase';
import cosineSimilarity = require('compute-cosine-similarity');

const db = getFirestore(firebaseApp);

const DEFAULT_KEYWORD_LIMIT = 10;

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'have',
  'this',
  'from',
  'your',
  'into',
  'about',
  'there',
  'their',
  'will',
  'would',
  'could',
  'while',
  'where',
  'when',
  'what',
  'which',
  'been',
  'used',
  'using',
  'also',
  'within',
  'between',
  'through',
  'each',
  'them',
  'over',
  'such',
  'more',
  'other',
  'than',
  'like',
  'into',
  'both',
  'just',
  'only',
  'very',
]);

type RecentNoteForRecommendation = Pick<
  FirebaseNoteContent,
  'id' | 'title' | 'content' | 'tags' | 'isPublic' | 'isPublished'
>;

interface KeywordGeneratorOptions {
  limit?: number;
}

export const fetchRecentReadNotesForRecommendation = async (
  userId: string,
  limitCount: number = 50
): Promise<RecentNoteForRecommendation[]> => {
  if (!userId) {
    console.warn('No userId provided to fetch recent read notes for recommendation');
    return [];
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn(`User document not found for userId: ${userId}`);
      return [];
    }

    const userData = userDoc.data();
    const recentlyReadNotes = Array.isArray(userData.recentlyReadNotes)
      ? userData.recentlyReadNotes
      : [];

    return recentlyReadNotes
      .filter((note: Partial<FirebaseNoteContent>) => note?.isPublic === true && note?.isPublished === true)
      .slice(0, limitCount)
      .map((note: Partial<FirebaseNoteContent>) => ({
        id: note.id ?? '',
        title: note.title ?? '',
        content: typeof note.content === 'string' ? note.content : '',
        tags: Array.isArray(note.tags) ? (note.tags as TagType[]) : [],
        isPublic: note.isPublic ?? false,
        isPublished: note.isPublished ?? false,
      }));
  } catch (error) {
    console.error('Error fetching recent read notes for recommendation:', error);
    return [];
  }
};

export const generateRecommendedSearchKeywords = async (
  userId: string,
  options: KeywordGeneratorOptions = {}
): Promise<string[]> => {
  const notes = await fetchRecentReadNotesForRecommendation(userId);
  return computeRecommendedKeywords(notes, options);
};

export const computeRecommendedKeywords = (
  notes: RecentNoteForRecommendation[],
  options: KeywordGeneratorOptions = {}
): string[] => {
  if (!Array.isArray(notes) || notes.length === 0) {
    return [];
  }

  const noteKeywordMaps = notes.map(extractWeightedKeywordsFromNote);
  const vocabulary = new Map<string, number>();

  noteKeywordMaps.forEach(keywordsMap => {
    keywordsMap.forEach((_, keyword) => {
      if (!vocabulary.has(keyword)) {
        vocabulary.set(keyword, vocabulary.size);
      }
    });
  });

  if (vocabulary.size === 0) {
    return [];
  }

  const vectors = noteKeywordMaps.map(keywordMap => buildVectorFromKeywordMap(keywordMap, vocabulary));

  const averageVector = buildAverageVector(vectors, vocabulary.size);
  const similarities = vectors.map(vector => {
    const similarity = cosineSimilarity(vector, averageVector);
    return Number.isFinite(similarity) ? (similarity as number) : 0;
  });

  const termScores = new Array<number>(vocabulary.size).fill(0);

  vectors.forEach((vector, vectorIndex) => {
    const similarity = similarities[vectorIndex] ?? 0;
    for (let i = 0; i < vocabulary.size; i += 1) {
      termScores[i] += vector[i] * similarity;
    }
  });

  const limit = options.limit ?? DEFAULT_KEYWORD_LIMIT;

  return Array.from(vocabulary.entries())
    .map(([keyword, index]) => ({ keyword, score: termScores[index] }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ keyword }) => keyword);
};

const extractWeightedKeywordsFromNote = (note: RecentNoteForRecommendation): Map<string, number> => {
  const keywordWeights = new Map<string, number>();

  const pushKeyword = (keyword: string, weight: number) => {
    const sanitized = keyword.trim().toLowerCase();
    if (!sanitized || STOP_WORDS.has(sanitized) || sanitized.length < 2) {
      return;
    }
    keywordWeights.set(sanitized, (keywordWeights.get(sanitized) ?? 0) + weight);
  };

  note.tags?.forEach((tag: TagType | string) => {
    if (typeof tag === 'string') {
      pushKeyword(tag, 3);
      return;
    }
    if (tag?.name) {
      pushKeyword(tag.name, 3);
    }
  });

  tokenizeText(note.title).forEach(token => pushKeyword(token, 2));
  tokenizeText(note.content).forEach(token => pushKeyword(token, 1));

  return keywordWeights;
};

const tokenizeText = (text: string | undefined): string[] => {
  if (!text) {
    return [];
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 300);
};

const buildVectorFromKeywordMap = (keywordMap: Map<string, number>, vocabulary: Map<string, number>): number[] => {
  const vector = new Array<number>(vocabulary.size).fill(0);

  keywordMap.forEach((weight, keyword) => {
    const index = vocabulary.get(keyword);
    if (index !== undefined) {
      vector[index] = weight;
    }
  });

  return vector;
};

const buildAverageVector = (vectors: number[][], size: number): number[] => {
  const averageVector = new Array<number>(size).fill(0);

  vectors.forEach(vector => {
    for (let i = 0; i < size; i += 1) {
      averageVector[i] += vector[i];
    }
  });

  const divisor = vectors.length || 1;

  for (let i = 0; i < size; i += 1) {
    averageVector[i] /= divisor;
  }

  return averageVector;
};

