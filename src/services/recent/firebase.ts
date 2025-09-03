import { collection, query, where, orderBy, getDocs, getFirestore, limit } from 'firebase/firestore';
import { MyPost } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

export async function fetchRecentPosts(limitCount: number = 20): Promise<MyPost[]> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc'), // Order by most recently updated
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
    console.error('Error fetching recently opened posts:', error);
    // Fallback to updatedAt if recentlyOpenDate doesn't exist
    return await fetchRecentPosts(limitCount);
  }
}
