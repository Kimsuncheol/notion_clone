import { collection, query, where, orderBy, getDocs, getFirestore, limit, Timestamp } from 'firebase/firestore';
import { MyPost } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

export async function fetchRecentPosts(limitCount: number = 20): Promise<MyPost[]> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      orderBy('updatedAt', 'desc'), // Order by most recently updated
      // diffDay is less than 30 days
      where('updatedAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
      where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
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
      } as MyPost;
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

// Alternative: Fetch posts by recently opened date (if recentlyOpenDate field exists)
export async function fetchRecentlyOpenedPosts(limitCount: number = 20): Promise<MyPost[]> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      orderBy('recentlyOpenDate', 'desc'),
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
      } as MyPost;
    });
  } catch (error) {
    console.error('Error fetching recently opened posts:', error);
    // Fallback to updatedAt if recentlyOpenDate doesn't exist
    return await fetchRecentPosts(limitCount);
  }
}
