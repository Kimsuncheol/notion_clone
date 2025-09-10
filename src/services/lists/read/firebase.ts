import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { FirebaseNoteContent } from '@/types/firebase';

const db = getFirestore(firebaseApp);

export const fetchRecentReadPosts = async (userId: string, limitCount: number = 12): Promise<FirebaseNoteContent[]> => {
  try {
    // Memory optimization: limit results and fetch recent posts efficiently
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      orderBy('viewCount', 'desc'), // Use viewCount as proxy for recently read posts
      limit(limitCount * 2) // Get more to filter out user's own posts
    );
    
    const snapshot = await getDocs(q);
    
    // Memory optimization: filter and map in single pass, exclude user's posts
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pageId: data.pageId || doc.id,
          title: data.title || 'Untitled',
          content: data.content || '',
          description: data.description || data.content?.substring(0, 200) || '',
          tags: data.tags || [],
          series: data.series || null,
          authorId: data.userId || data.authorId || '',
          authorEmail: data.authorEmail || '',
          authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
          isPublic: data.isPublic ?? true,
          isPublished: data.isPublished ?? true,
          thumbnailUrl: data.thumbnailUrl || '',
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          likeUsers: data.likeUsers || [],
          originalLocation: data.originalLocation || { isPublic: true },
          comments: data.comments || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recentlyOpenDate: data.recentlyOpenDate?.toDate(),
        } as FirebaseNoteContent;
      })
      .filter(note => note.authorId !== userId) // Exclude user's own posts
      .slice(0, limitCount); // Memory optimization: limit final results
  } catch (error) {
    console.error('Error fetching recent read posts:', error);
    return []; // Return empty array instead of throwing to prevent page crashes
  }
};