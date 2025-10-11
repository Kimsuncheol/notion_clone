import type { MyPost } from '@/types/firebase';

const BASE_URL = 'http://127.0.0.1:8000';

type RecommendationPayload = {
  recommendations?: unknown;
  posts?: unknown;
  data?: unknown;
  results?: unknown;
};

const isMyPostArray = (value: unknown): value is MyPost[] => Array.isArray(value);

export const fetchServerRecommendations = async (userId: string): Promise<MyPost[]> => {
  if (!userId) {
    throw new Error('userId is required to fetch recommendations');
  }

  try {
    const response = await fetch(`${BASE_URL}/recommend/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Graceful fallback: 404 from server means "no recommendations" (e.g., user not found)
      if (response.status === 404) {
        console.warn('No server-side recommendations (404). Returning empty list.');
        return [];
      }
      throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
    }

    const payload: RecommendationPayload | MyPost[] = await response.json();

    // If backend returns { items: [{ id, score, metadata }] }, map metadata → MyPost
    const asAny = payload as any;
    if (asAny && Array.isArray(asAny.items)) {
      const mapped = asAny.items
        .map((it: any) => it && it.metadata)
        .filter((m: any) => !!m)
        .map((m: any) => {
          // normalize createdAt
          let createdAt: Date;
          if (m.createdAt instanceof Date) {
            createdAt = m.createdAt;
          } else if (typeof m.createdAt === 'string') {
            createdAt = new Date(m.createdAt);
          } else if (typeof m.created_at === 'string') {
            createdAt = new Date(m.created_at);
          } else {
            createdAt = new Date();
          }
          return {
            ...m,
            createdAt,
          } as MyPost;
        });
      if (isMyPostArray(mapped)) {
        return mapped;
      }
    }

    if (isMyPostArray(payload)) {
      return payload;
    }

    const candidates = [payload?.recommendations, payload?.posts, payload?.data, payload?.results].find(
      (value): value is MyPost[] => isMyPostArray(value)
    );

    if (candidates) {
      return candidates;
    }

    console.warn('Unexpected recommendation payload shape', payload);
    return [];
  } catch (error) {
    console.error('Error fetching server recommendations:', error);
    throw error;
  }
};
