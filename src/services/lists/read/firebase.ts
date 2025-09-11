import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import type { FirebaseNoteContent } from '@/types/firebase';

const db = getFirestore(firebaseApp);

// Fetch 'recentlyReadNotes' from 'users' collection
export const fetchRecentReadPosts = async (userId: string, limitCount: number = 12): Promise<FirebaseNoteContent[]> => {
  try {
    if (!userId) {
      console.warn('No userId provided to fetchRecentReadPosts');
      return [];
    }

    // Fetch user document to get recentlyReadNotes
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.warn(`User document not found for userId: ${userId}`);
      return [];
    }
    
    const userData = userDoc.data();
    const recentlyReadNotes = userData.recentlyReadNotes || [];
    
    if (recentlyReadNotes.length === 0) {
      return [];
    }
    
    // Convert Firestore Timestamps to Date objects and ensure proper formatting
    const formattedNotes = recentlyReadNotes
      .map((note: Partial<FirebaseNoteContent> & { createdAt?: any; updatedAt?: any; recentlyOpenDate?: any }) => {
        return {
          id: note.id || '',
          pageId: note.pageId || note.id || '',
          title: note.title || 'Untitled',
          content: note.content || '',
          description: note.description || '',
          tags: note.tags || [],
          series: note.series || null,
          authorId: note.authorId || '',
          authorEmail: note.authorEmail || '',
          authorName: note.authorName || 'Anonymous',
          isPublic: note.isPublic ?? true,
          isPublished: note.isPublished ?? true,
          thumbnailUrl: note.thumbnailUrl || '',
          viewCount: note.viewCount || 0,
          likeCount: note.likeCount || 0,
          likeUsers: note.likeUsers || [],
          originalLocation: note.originalLocation || { isPublic: true },
          comments: note.comments || [],
          createdAt: note.createdAt?.toDate?.() || new Date(note.createdAt) || new Date(),
          updatedAt: note.updatedAt?.toDate?.() || new Date(note.updatedAt) || new Date(),
          recentlyOpenDate: note.recentlyOpenDate?.toDate?.() || new Date(note.recentlyOpenDate) || new Date(),
        } as FirebaseNoteContent;
      })
      .slice(0, limitCount); // Limit results to requested count
    
    console.log(`Fetched ${formattedNotes.length} recently read notes for user ${userId}`);
    return formattedNotes;
    
  } catch (error) {
    console.error('Error fetching recent read posts from users collection:', error);
    return []; // Return empty array instead of throwing to prevent page crashes
  }
};