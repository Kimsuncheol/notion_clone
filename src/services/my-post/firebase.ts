import { collection, query, where, orderBy, getDocs, getFirestore, doc, getDoc } from 'firebase/firestore';
import { MyPost, MyPostSeries } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

export async function fetchUserSeries(userEmail: string): Promise<MyPostSeries[]> {
  console.log('fetchUserSeries userEmail: ', userEmail);
  
  try {
    // Query users collection by email field
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    // Get the first matching user document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const series = userData?.series || [];
    
    return series;
  } catch (error) {
    console.error('Error fetching user series:', error);
    return [];
  }
}

export async function fetchUserPosts(userId: string): Promise<MyPost[]> {
  try {
    const postsRef = collection(db, 'notes');
    // Simplified query to avoid composite index requirement
    const q = query(
      postsRef,
      where('authorEmail', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      // Client-side filtering to avoid composite index requirement
      .filter(doc => {
        const data = doc.data();
        return (data.isTrashed === false);
        // return (data.isPublic === true) && (data.isTrashed === false);
      })
      .map(doc => {
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
    console.error('Error fetching user posts:', error);
    return [];
  }
}