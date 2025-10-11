import { MyPost } from '@/types/firebase';

const API_BASE_URL = 'http://127.0.0.1:8000';
const DEFAULT_LIMIT = 12;

type RawRecommendation = Record<string, unknown>;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const parseDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
};

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

const extractArray = (payload: unknown): RawRecommendation[] => {
  if (Array.isArray(payload)) {
    return payload as RawRecommendation[];
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.results)) {
      return data.results as RawRecommendation[];
    }
    if (Array.isArray(data.data)) {
      return data.data as RawRecommendation[];
    }
    if (Array.isArray(data.items)) {
      return data.items as RawRecommendation[];
    }
  }

  return [];
};

const buildRequestUrl = (path: string, params: Record<string, string | number | undefined>): string => {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const fallbackId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeRecommendation = (raw: RawRecommendation, defaultIdPrefix: string): MyPost => {
  const id =
    isNonEmptyString(raw.id) ? raw.id :
    isNonEmptyString(raw.note_id) ? raw.note_id :
    fallbackId(defaultIdPrefix);

  const title = isNonEmptyString(raw.title) ? raw.title : '';
  const content = isNonEmptyString(raw.content) ? raw.content : '';
  const description = isNonEmptyString(raw.description) ? raw.description : '';
  const authorId = isNonEmptyString(raw.authorId) ? raw.authorId :
    isNonEmptyString(raw.author_id) ? raw.author_id :
    '';

  const authorEmail = isNonEmptyString(raw.authorEmail) ? raw.authorEmail :
    isNonEmptyString(raw.author_email) ? raw.author_email :
    '';

  const authorName = isNonEmptyString(raw.authorName) ? raw.authorName :
    isNonEmptyString(raw.author_name) ? raw.author_name :
    (authorEmail ? authorEmail.split('@')[0] ?? '' : '');

  const thumbnailUrl = isNonEmptyString(raw.thumbnailUrl) ? raw.thumbnailUrl :
    isNonEmptyString(raw.thumbnail) ? raw.thumbnail :
    isNonEmptyString(raw.coverImage) ? raw.coverImage :
    '';

  const noteTags = Array.isArray(raw.tags) ? raw.tags : [];
  const likeUsers = Array.isArray(raw.likeUsers) ? raw.likeUsers : [];
  const comments = Array.isArray(raw.comments) ? raw.comments : [];

  const createdAt = parseDate(raw.createdAt ?? raw.created_at);
  const updatedAt = raw.updatedAt ?? raw.updated_at ? parseDate(raw.updatedAt ?? raw.updated_at) : undefined;
  const recentlyOpenDate = raw.recentlyOpenDate ?? raw.recently_open_date
    ? parseDate(raw.recentlyOpenDate ?? raw.recently_open_date)
    : undefined;

  return {
    id,
    title,
    content,
    description,
    authorId,
    authorEmail,
    authorName,
    thumbnailUrl,
    tags: noteTags as MyPost['tags'],
    likeUsers: likeUsers as MyPost['likeUsers'],
    comments: comments as MyPost['comments'],
    series: (raw.series ?? null) as MyPost['series'],
    viewCount: parseNumber(raw.viewCount ?? raw.view_count),
    likeCount: parseNumber(raw.likeCount ?? raw.like_count),
    isPublished: asBoolean(raw.isPublished ?? raw.is_published, true),
    authorAvatar: isNonEmptyString(raw.authorAvatar) ? raw.authorAvatar : undefined,
    createdAt,
    updatedAt,
    recentlyOpenDate,
    trashedAt: parseDate(raw.trashedAt ?? raw.trashed_at ?? raw.deletedAt ?? raw.deleted_at ?? createdAt),
  };
};

const requestRecommendations = async (
  path: string,
  id: string,
  k: number,
  fallbackPrefix: string,
): Promise<MyPost[]> => {
  const limit = Number.isInteger(k) && k > 0 ? k : DEFAULT_LIMIT;
  if (!isNonEmptyString(id)) {
    throw new Error('Identifier is required to request recommendations.');
  }

  const url = buildRequestUrl(path, { k: limit });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations (status ${response.status})`);
  }

  const payload = await response.json();
  const items = extractArray(payload);

  if (items.length === 0) {
    return [];
  }

  return items.map(item => normalizeRecommendation(item ?? {}, fallbackPrefix));
};

export const fetchRecommendedUsers = async (userId: string, k = DEFAULT_LIMIT): Promise<MyPost[]> => {
  return requestRecommendations(`/recommend/users/${encodeURIComponent(userId)}`, userId, k, 'user-rec');
};

export const fetchSimilarNotes = async (noteId: string, k = DEFAULT_LIMIT): Promise<MyPost[]> => {
  return requestRecommendations(`/recommend/notes/similar/${encodeURIComponent(noteId)}`, noteId, k, 'note-rec');
};

export const fetchServerRecommendations = fetchRecommendedUsers;
