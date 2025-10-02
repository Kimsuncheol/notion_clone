import { firebaseApp } from '@/constants/firebase';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  orderBy,
  getDocs,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { FirebaseNoteContent, MyPost } from '@/types/firebase';
import {
  extractWeightedKeywordsFromNote,
  normalizeTags,
  RecentNoteForRecommendation,
} from '@/services/search/recommendation';

const db = getFirestore(firebaseApp);

const DEFAULT_RECOMMENDATION_LIMIT = 12;
const DEFAULT_CANDIDATE_LIMIT = 60;
const MAX_KEYWORDS = 200;

interface WeightedNotesSource {
  notes: RecentNoteForRecommendation[];
  weight: number;
}

export interface ContentBasedRecommendationOptions {
  limit?: number;
  candidateLimit?: number;
  excludeIds?: string[];
}

const toDate = (value: unknown, fallback: Date = new Date()): Date => {
  if (!value) {
    return fallback;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value === 'object' && value && 'toDate' in (value as Record<string, unknown>)) {
    try {
      return (value as Timestamp).toDate();
    } catch (error) {
      console.warn('Unable to convert value with toDate method. Falling back to default date.', error);
      return fallback;
    }
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
};

const generateFallbackId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
};

const convertPartialNoteToRecent = (
  note: Partial<FirebaseNoteContent> | undefined | null,
  fallbackIdPrefix: string
): RecentNoteForRecommendation | null => {
  if (!note) {
    return null;
  }

  const id = typeof note.id === 'string' && note.id.trim() ? note.id : generateFallbackId(fallbackIdPrefix);

  return {
    id,
    title: typeof note.title === 'string' ? note.title : '',
    content: typeof note.content === 'string' ? note.content : '',
    description: typeof note.description === 'string' ? note.description : '',
    tags: normalizeTags(note.tags),
    isPublic: note.isPublic ?? true,
    isPublished: note.isPublished ?? true,
  };
};

const convertDocToRecentNote = (doc: QueryDocumentSnapshot<DocumentData>): RecentNoteForRecommendation => {
  const data = doc.data() as FirebaseNoteContent;

  return {
    id: doc.id,
    title: data.title ?? '',
    content: typeof data.content === 'string' ? data.content : '',
    description: typeof data.description === 'string' ? data.description : '',
    tags: normalizeTags(data.tags),
    isPublic: data.isPublic ?? true,
    isPublished: data.isPublished ?? true,
  };
};

const buildWeightedKeywordProfile = (sources: WeightedNotesSource[]): Map<string, number> => {
  const keywordWeights = new Map<string, number>();

  sources.forEach(source => {
    source.notes.forEach(note => {
      const noteKeywords = extractWeightedKeywordsFromNote(note);

      noteKeywords.forEach((weight, keyword) => {
        const weightedScore = weight * source.weight;
        keywordWeights.set(keyword, (keywordWeights.get(keyword) ?? 0) + weightedScore);
      });
    });
  });

  if (keywordWeights.size <= MAX_KEYWORDS) {
    return keywordWeights;
  }

  return new Map(
    Array.from(keywordWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_KEYWORDS)
  );
};

const computeMagnitude = (keywordMap: Map<string, number>): number => {
  let total = 0;

  keywordMap.forEach(weight => {
    total += weight * weight;
  });

  return Math.sqrt(total);
};

const computeCosineSimilarity = (
  userKeywords: Map<string, number>,
  userMagnitude: number,
  candidateKeywords: Map<string, number>
): number => {
  if (userMagnitude === 0 || candidateKeywords.size === 0) {
    return 0;
  }

  let dotProduct = 0;

  candidateKeywords.forEach((candidateWeight, keyword) => {
    const userWeight = userKeywords.get(keyword);
    if (userWeight) {
      dotProduct += userWeight * candidateWeight;
    }
  });

  if (dotProduct === 0) {
    return 0;
  }

  const candidateMagnitude = computeMagnitude(candidateKeywords);

  if (candidateMagnitude === 0) {
    return 0;
  }

  return dotProduct / (userMagnitude * candidateMagnitude);
};

const convertSnapshotToMyPost = (doc: QueryDocumentSnapshot<DocumentData>): MyPost => {
  const data = doc.data() as Record<string, unknown>;

  const createdAt = toDate(data.createdAt);
  const updatedAtValue = data.updatedAt ? toDate(data.updatedAt as Date | Timestamp | string, createdAt) : undefined;
  const trashedAtValue = data.trashedAt ? toDate(data.trashedAt as Date | Timestamp | string, createdAt) : new Date();

  return {
    id: doc.id,
    title: typeof data.title === 'string' ? data.title : '',
    content: typeof data.content === 'string' ? data.content : '',
    description: typeof data.description === 'string' ? data.description : '',
    authorId:
      typeof data.userId === 'string' && (data.userId as string).trim()
        ? (data.userId as string)
        : typeof data.authorId === 'string'
          ? (data.authorId as string)
          : '',
    authorEmail: typeof data.authorEmail === 'string' ? data.authorEmail : '',
    authorName: typeof data.authorName === 'string' ? data.authorName : '',
    authorAvatar: typeof data.authorAvatar === 'string' ? data.authorAvatar : undefined,
    tags: normalizeTags(data.tags),
    series: data.series ?? null,
    thumbnailUrl:
      typeof data.thumbnailUrl === 'string'
        ? (data.thumbnailUrl as string)
        : typeof data.thumbnail === 'string'
          ? (data.thumbnail as string)
          : '',
    createdAt,
    updatedAt: updatedAtValue,
    recentlyOpenDate: data.recentlyOpenDate
      ? toDate(data.recentlyOpenDate as Date | Timestamp | string, createdAt)
      : undefined,
    likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    commentCount: typeof data.commentCount === 'number' ? data.commentCount : 0,
    comments: Array.isArray(data.comments) ? (data.comments as MyPost['comments']) : [],
    likeUsers: Array.isArray(data.likeUsers) ? (data.likeUsers as MyPost['likeUsers']) : [],
    isPublished: data.isPublished === true,
    trashedAt: trashedAtValue,
    isTrashed: data.isTrashed === true,
    userId: typeof data.userId === 'string' ? (data.userId as string) : undefined,
  } as MyPost;
};

const fetchUserPreferenceNotes = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.warn(`User document not found for userId: ${userId}`);
    return {
      likedNotes: [] as RecentNoteForRecommendation[],
      recentlyReadNotes: [] as RecentNoteForRecommendation[],
      excludeIds: new Set<string>(),
    };
  }

  const userData = userDoc.data() as Record<string, unknown>;

  const likedNotes = Array.isArray(userData.likedNotes)
    ? userData.likedNotes
        .map(note => convertPartialNoteToRecent(note as Partial<FirebaseNoteContent>, 'liked'))
        .filter((note): note is RecentNoteForRecommendation => Boolean(note?.id))
    : [];

  const recentlyReadNotes = Array.isArray(userData.recentlyReadNotes)
    ? userData.recentlyReadNotes
        .map(note => convertPartialNoteToRecent(note as Partial<FirebaseNoteContent>, 'recent'))
        .filter((note): note is RecentNoteForRecommendation => Boolean(note?.id))
    : [];

  const excludeIds = new Set<string>();
  likedNotes.forEach(note => note.id && excludeIds.add(note.id));
  recentlyReadNotes.forEach(note => note.id && excludeIds.add(note.id));

  return {
    likedNotes,
    recentlyReadNotes,
    excludeIds,
  };
};

const fetchUserAuthoredNotes = async (userId: string, limitCount: number): Promise<RecentNoteForRecommendation[]> => {
  const notesRef = collection(db, 'notes');
  const authoredQuery = query(
    notesRef,
    where('userId', '==', userId),
    where('isPublished', '==', true),
    limit(limitCount)
  );

  const authoredSnapshot = await getDocs(authoredQuery);

  return authoredSnapshot.docs.map(convertDocToRecentNote);
};

const buildTagPreferenceNote = (
  userId: string,
  notes: RecentNoteForRecommendation[]
): RecentNoteForRecommendation | null => {
  const tagCounts = new Map<
    string,
    { tag: RecentNoteForRecommendation['tags'][number]; count: number }
  >();

  notes.forEach(note => {
    note.tags.forEach(tag => {
      if (!tag?.name) {
        return;
      }

      const key = tag.name.toLowerCase();
      const existing = tagCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tagCounts.set(key, { tag, count: 1 });
      }
    });
  });

  if (tagCounts.size === 0) {
    return null;
  }

  const MAX_PREFERRED_TAGS = 30;

  const preferredTags = Array.from(tagCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_PREFERRED_TAGS)
    .map(entry => ({
      id: entry.tag.id || entry.tag.name,
      name: entry.tag.name,
      userId: entry.tag.userId,
      createdAt: entry.tag.createdAt,
      updatedAt: entry.tag.updatedAt,
    }));

  if (preferredTags.length === 0) {
    return null;
  }

  return {
    id: `user-tags-${userId}`,
    title: '',
    content: '',
    description: '',
    tags: preferredTags,
    isPublic: true,
    isPublished: true,
  };
};

const fetchCandidateNotes = async (
  userId: string,
  excludeIds: Set<string>,
  limitCount: number
): Promise<{ note: MyPost; keywords: Map<string, number> }[]> => {
  const notesRef = collection(db, 'notes');

  const candidateQuery = query(notesRef, orderBy('viewCount', 'desc'), limit(limitCount));

  const snapshot = await getDocs(candidateQuery);

  const results: { note: MyPost; keywords: Map<string, number> }[] = [];

  snapshot.docs.forEach(docSnapshot => {
    const data = docSnapshot.data() as FirebaseNoteContent & { userId?: string };

    const candidateAuthorId = data.userId ?? data.authorId;
    if ((candidateAuthorId && candidateAuthorId === userId) || excludeIds.has(docSnapshot.id)) {
      return;
    }

    if (data.isPublic !== true || data.isPublished !== true) {
      return;
    }

    const note = convertSnapshotToMyPost(docSnapshot);
    const keywords = extractWeightedKeywordsFromNote({
      id: note.id,
      title: note.title,
      content: note.content,
      description: note.description ?? '',
      tags: Array.isArray(note.tags) ? note.tags : [],
      isPublic: true,
      isPublished: note.isPublished,
    });

    if (keywords.size === 0) {
      return;
    }

    results.push({ note, keywords });
  });

  return results;
};

export const fetchContentBasedRecommendations = async (
  userId: string | null | undefined,
  options: ContentBasedRecommendationOptions = {}
): Promise<MyPost[]> => {
  if (!userId) {
    console.warn('No userId provided for content-based recommendations.');
    return [];
  }

  try {
    const limitCount = options.limit ?? DEFAULT_RECOMMENDATION_LIMIT;
  const candidateLimit = options.candidateLimit ?? Math.max(DEFAULT_CANDIDATE_LIMIT, limitCount * 3);

    const { likedNotes, recentlyReadNotes, excludeIds } = await fetchUserPreferenceNotes(userId);

    const authoredNotes = await fetchUserAuthoredNotes(userId, candidateLimit);
    authoredNotes.forEach(note => excludeIds.add(note.id));

    if (Array.isArray(options.excludeIds)) {
      options.excludeIds.forEach(id => id && excludeIds.add(id));
    }

    const tagProfileNote = buildTagPreferenceNote(userId, authoredNotes);

    const sources: WeightedNotesSource[] = [];

    if (likedNotes.length > 0) {
      sources.push({ notes: likedNotes, weight: 3 });
    }

    if (recentlyReadNotes.length > 0) {
      sources.push({ notes: recentlyReadNotes, weight: 2 });
    }

    if (tagProfileNote) {
      sources.push({ notes: [tagProfileNote], weight: 1 });
    }

    if (sources.length === 0) {
      return [];
    }

    const userKeywordProfile = buildWeightedKeywordProfile(sources);
    const userMagnitude = computeMagnitude(userKeywordProfile);

    if (userMagnitude === 0) {
      return [];
    }

    const candidates = await fetchCandidateNotes(userId, excludeIds, candidateLimit);

    if (candidates.length === 0) {
      return [];
    }

    const scoredCandidates = candidates
      .map(({ note, keywords }) => ({
        note,
        score: computeCosineSimilarity(userKeywordProfile, userMagnitude, keywords),
      }))
      .filter(candidate => Number.isFinite(candidate.score) && candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount)
      .map(candidate => candidate.note);

    return scoredCandidates;
  } catch (error) {
    console.error('Failed to fetch content-based recommendations:', error);
    return [];
  }
};
