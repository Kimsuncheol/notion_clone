import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getFirestore,
  limit,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { MyPost } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);
const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;
const MAX_RANK_EXCLUSIVE = 20;

function mapDocToMyPost(doc: QueryDocumentSnapshot<DocumentData>): MyPost {
  const data = doc.data();
  const createdAt = typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate() : new Date();
  const updatedAt = typeof data.updatedAt?.toDate === 'function' ? data.updatedAt.toDate() : undefined;
  const recentlyOpenDate = typeof data.recentlyOpenDate?.toDate === 'function' ? data.recentlyOpenDate.toDate() : undefined;
  const trashedAt = typeof data.trashedAt?.toDate === 'function' ? data.trashedAt.toDate() : new Date(0);
  const thumbnail = data.thumbnailUrl ?? data.thumbnail ?? '';

  return {
    id: doc.id,
    userId: data.userId ?? '',
    authorId: data.authorId ?? data.userId ?? '',
    title: data.title ?? '',
    thumbnailUrl: thumbnail,
    content: data.content ?? '',
    description: data.description ?? '',
    createdAt,
    updatedAt,
    recentlyOpenDate,
    authorEmail: data.authorEmail ?? '',
    authorName: data.authorName ?? '',
    isTrashed: data.isTrashed ?? false,
    trashedAt,
    viewCount: data.viewCount ?? 0,
    likeCount: data.likeCount ?? 0,
    commentCount: data.commentCount ?? 0,
    likeUsers: data.likeUsers ?? [],
    comments: data.comments ?? [],
    tags: data.tags ?? [],
    isPublished: data.isPublished ?? false,
    series: data.series ?? null,
    authorAvatar: data.authorAvatar ?? undefined,
    summary: data.summary ?? '',
  } as MyPost;
}

function scorePost(post: MyPost): number {
  const likeCount = post.likeCount ?? 0;
  const commentCount = post.comments?.length ?? 0;
  const viewCount = post.viewCount ?? 0;
  return likeCount * 3 + commentCount * 5 + viewCount * 2;
}

function filterAndRankPosts(posts: MyPost[], limitCount: number): MyPost[] {
  const now = Date.now();
  const ranked = posts
    .filter(post => {
      const referenceDate = (post.updatedAt ?? post.createdAt)?.getTime?.();
      return typeof referenceDate === 'number' && referenceDate > 0 && now - referenceDate < ONE_YEAR_IN_MS;
    })
    .map(post => ({ post, score: scorePost(post) }))
    .sort((a, b) => b.score - a.score);

  const maxCount = Math.max(Math.min(limitCount, MAX_RANK_EXCLUSIVE - 1), 0);
  return ranked.slice(0, maxCount).map(({ post }) => post);
}

export async function fetchFeedPosts(limitCount: number = 20): Promise<MyPost[]> {
  try {
    // Get a mix of popular and recent posts for the feed
    // First, get posts ordered by engagement (views + likes + comments)
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(mapDocToMyPost);
    return filterAndRankPosts(posts, limitCount);
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return [];
  }
}

// Alternative: Fetch curated feed with mix of recent and popular posts
export async function fetchCuratedFeed(limitCount: number = 20): Promise<MyPost[]> {
  try {
    const notesRef = collection(db, 'notes');
    
    // Get half recent posts and half popular posts
    const recentLimit = Math.floor(limitCount / 2);
    const popularLimit = limitCount - recentLimit;

    // Recent posts query
    const recentQuery = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      where('updatedAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
      orderBy('createdAt', 'desc'),
      limit(recentLimit)
    );

    // Popular posts query (by view count)
    const popularQuery = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      where('updatedAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
      orderBy('viewCount', 'desc'),
      limit(popularLimit)
    );

    // Execute both queries in parallel
    const [recentSnapshot, popularSnapshot] = await Promise.all([
      getDocs(recentQuery),
      getDocs(popularQuery)
    ]);

    // Combine and deduplicate results
    const allDocs = [...recentSnapshot.docs, ...popularSnapshot.docs];
    const uniqueDocsMap = new Map();
    
    allDocs.forEach(doc => {
      if (!uniqueDocsMap.has(doc.id)) {
        uniqueDocsMap.set(doc.id, doc);
      }
    });

    const uniqueDocs = Array.from(uniqueDocsMap.values());
    const posts = uniqueDocs.map(mapDocToMyPost);
    return filterAndRankPosts(posts, limitCount);
  } catch (error) {
    console.error('Error fetching curated feed:', error);
    // Fallback to basic feed
    return await fetchFeedPosts(limitCount);
  }
}

// Fetch feed posts by most liked (engagement-based)
export async function fetchPopularFeed(limitCount: number = 20): Promise<MyPost[]> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      orderBy('likeCount', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(mapDocToMyPost);
    return filterAndRankPosts(posts, limitCount);
  } catch (error) {
    console.error('Error fetching popular feed:', error);
    return [];
  }
}
