import { collection, query, where, orderBy, getDocs, getFirestore, limit, Timestamp } from 'firebase/firestore';
import { TrendingItem } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

export async function fetchTrendingItems(timeframe: string, limitCount: number = 20): Promise<TrendingItem[]> {
  try {
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('updatedAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('updatedAt', 'desc'),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        description: data.description || '',
        imageUrl: data.thumbnail || undefined,
        category: data.category || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        authorId: data.userId || '',
        authorName: data.authorName || 'Anonymous',
        authorEmail: data.authorEmail || '',
        tags: data.tags || [],
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
      } as TrendingItem;
    });
  } catch (error) {
    console.error('Error fetching trending items:', error);
    return [];
  }
}

// Alternative query for trending by different metrics
export async function fetchTrendingItemsByMetric(
  timeframe: string, 
  metric: 'viewCount' | 'likeCount' | 'commentCount' = 'viewCount',
  limitCount: number = 20
): Promise<TrendingItem[]> {
  try {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('updatedAt', '>=', Timestamp.fromDate(startDate)),
      orderBy(metric, 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        description: data.description || '',
        imageUrl: data.thumbnail || undefined,
        category: data.category || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        authorId: data.userId || '',
        authorName: data.authorName || 'Anonymous',
        authorEmail: data.authorEmail || '',
        tags: data.tags || [],
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
      } as TrendingItem;
    });
  } catch (error) {
    console.error('Error fetching trending items by metric:', error);
    return [];
  }
}
