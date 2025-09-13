import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { FirebaseNoteContent, LikeUser } from '@/types/firebase';

const db = getFirestore(firebaseApp);

export const fetchUserInfo = async (userEmail: string): Promise<{id: string, joinedAt: Date, displayName: string}> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const snapshot = await getDocs(q);

    // return id, joinedAt
    
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        joinedAt: snapshot.docs[0].data().joinedAt?.toDate() || new Date(),
        displayName: snapshot.docs[0].data().userSettings?.displayName || '',
      };
    }
    
    return {id: '', joinedAt: new Date(), displayName: ''}; // Return empty string if user not found
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return {id: '', joinedAt: new Date(), displayName: ''}; // Return empty string on error
  }
};

export const fetchLikedPosts = async (likedUser: LikeUser, limitCount: number = 12): Promise<FirebaseNoteContent[]> => {
  try {
    // Memory optimization: limit results and only fetch necessary fields
    console.log('likedUser in fetchLikedPosts: ', likedUser);
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      where('likeUsers', 'array-contains', likedUser),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    
    const snapshot = await getDocs(q);
    
    // Memory optimization: map only once and return minimal required data
    return snapshot.docs.map(doc => {
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
        authorAvatar: data.authorAvatar || '',
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
    });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return []; // Return empty array instead of throwing to prevent page crashes
  }
};
