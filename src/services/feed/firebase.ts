import { collection, query, where, orderBy, getDocs, getFirestore, limit } from 'firebase/firestore';
import { MyPost } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

export async function fetchFeedPosts(limitCount: number = 20): Promise<MyPost[]> {
  try {
    // Get a mix of popular and recent posts for the feed
    // First, get posts ordered by engagement (views + likes + comments)
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('isTrashed', '==', false),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title || '',
        thumbnail: data.thumbnail || '',
        content: data.content || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        authorEmail: data.authorEmail || '',
        authorName: data.authorName || '',
        isTrashed: data.isTrashed || false,
        trashedAt: data.trashedAt?.toDate() || new Date(),
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        comments: data.comments || [],
        subNotes: (data.subNotes || []).map((subNote: { id: string; title: string; content: string; createdAt: { toDate?: () => Date } | Date; updatedAt: { toDate?: () => Date } | Date }) => ({
          id: subNote.id,
          title: subNote.title || '',
          content: subNote.content || '',
          createdAt: subNote.createdAt instanceof Date ? subNote.createdAt : (subNote.createdAt?.toDate ? subNote.createdAt.toDate() : new Date()),
          updatedAt: subNote.updatedAt instanceof Date ? subNote.updatedAt : (subNote.updatedAt?.toDate ? subNote.updatedAt.toDate() : new Date()),
        })),
      } as MyPost;
    });
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
      where('isTrashed', '==', false),
      orderBy('createdAt', 'desc'),
      limit(recentLimit)
    );

    // Popular posts query (by view count)
    const popularQuery = query(
      notesRef,
      where('isPublic', '==', true),
      where('isTrashed', '==', false),
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

    return uniqueDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title || '',
        thumbnail: data.thumbnail || '',
        content: data.content || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        authorEmail: data.authorEmail || '',
        authorName: data.authorName || '',
        isTrashed: data.isTrashed || false,
        trashedAt: data.trashedAt?.toDate() || new Date(),
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        comments: data.comments || [],
        subNotes: (data.subNotes || []).map((subNote: { id: string; title: string; content: string; createdAt: { toDate?: () => Date } | Date; updatedAt: { toDate?: () => Date } | Date }) => ({
          id: subNote.id,
          title: subNote.title || '',
          content: subNote.content || '',
          createdAt: subNote.createdAt instanceof Date ? subNote.createdAt : (subNote.createdAt?.toDate ? subNote.createdAt.toDate() : new Date()),
          updatedAt: subNote.updatedAt instanceof Date ? subNote.updatedAt : (subNote.updatedAt?.toDate ? subNote.updatedAt.toDate() : new Date()),
        })),
      } as MyPost;
    });
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
      where('isTrashed', '==', false),
      orderBy('likeCount', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title || '',
        thumbnail: data.thumbnail || '',
        content: data.content || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        authorEmail: data.authorEmail || '',
        authorName: data.authorName || '',
        isTrashed: data.isTrashed || false,
        trashedAt: data.trashedAt?.toDate() || new Date(),
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        comments: data.comments || [],
        subNotes: (data.subNotes || []).map((subNote: { id: string; title: string; content: string; createdAt: { toDate?: () => Date } | Date; updatedAt: { toDate?: () => Date } | Date }) => ({
          id: subNote.id,
          title: subNote.title || '',
          content: subNote.content || '',
          createdAt: subNote.createdAt instanceof Date ? subNote.createdAt : (subNote.createdAt?.toDate ? subNote.createdAt.toDate() : new Date()),
          updatedAt: subNote.updatedAt instanceof Date ? subNote.updatedAt : (subNote.updatedAt?.toDate ? subNote.updatedAt.toDate() : new Date()),
        })),
      } as MyPost;
    });
  } catch (error) {
    console.error('Error fetching popular feed:', error);
    return [];
  }
}
