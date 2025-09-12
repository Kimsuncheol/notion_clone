import { collection, query, where, orderBy, getDocs, getFirestore, limit, Timestamp } from 'firebase/firestore';
import { MyPost } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

export async function fetchRecentPosts(limitCount: number = 20): Promise<MyPost[]> {
  try {
    const notesRef = collection(db, 'notes');
    const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    // Query for posts where updatedAt is not null
    const qUpdated = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      where('updatedAt', '!=', null),
      where('updatedAt', '>=', thirtyDaysAgo),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    // Query for posts where updatedAt is null
    const qCreated = query(
      notesRef,
      where('isPublic', '==', true),
      where('isPublished', '==', true),
      where('updatedAt', '==', null),
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const [updatedSnapshot, createdSnapshot] = await Promise.all([
      getDocs(qUpdated),
      getDocs(qCreated)
    ]);
    
    const allDocs = [...updatedSnapshot.docs, ...createdSnapshot.docs];
    
    return allDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title || '',
        thumbnailUrl: data.thumbnailUrl || '',
        content: data.content || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        authorEmail: data.authorEmail || '',
        authorName: data.authorName || '',
        isTrashed: data.isTrashed || false,
        authorId: data.authorId || '',
        description: data.description || '',
        isPublished: data.isPublished || false,
        trashedAt: data.trashedAt?.toDate() || new Date(),
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        comments: data.comments || [],
        updatedAt: data.updatedAt?.toDate() || null,
      } as MyPost;
    }).slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}
