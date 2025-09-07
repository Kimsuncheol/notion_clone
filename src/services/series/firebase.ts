import { collection, query, where,  getDocs, getFirestore } from 'firebase/firestore';
import {  MySeries } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

// Utility function to convert Firestore timestamp to Date
function convertTimestamp(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  return new Date();
}

// Helper function to get user document by email
async function getUserDocumentByEmail(userEmail: string) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', userEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('User not found');
  }

  const userDoc = querySnapshot.docs[0];
  return userDoc.data();
}

/**
 * Fetch user series with SeriesType interface (lightweight operation)
 */
export async function fetchUserSeriesTitle(userEmail: string): Promise<MySeries[]> {
  console.log('fetchUserSeriesTitle userEmail: ', userEmail);
  
  try {
    const userData = await getUserDocumentByEmail(userEmail);
    const rawSeries = userData?.series || [];
    
    return rawSeries.map((seriesItem: Record<string, unknown>): MySeries => ({
      id: (seriesItem.id as string) || '',
      title: (seriesItem.title as string) || '',
      thumbnailUrl: (seriesItem.thumbnailUrl as string) || undefined,
      viewCount: (seriesItem.viewCount as number) || undefined,
      likeCount: (seriesItem.likeCount as number) || undefined,
      createdAt: convertTimestamp(seriesItem.createdAt),
    })).filter((series: MySeries) => series.title !== '');
  } catch (error) {
    console.error('Error fetching user series titles:', error);
    return [];
  }
}

/**
 * Fetch full series contents including all metadata
 */
export async function fetchUserSeriesContents(userEmail: string): Promise<MySeries[]> {
  console.log('fetchUserSeriesContents userEmail: ', userEmail);
  
  try {
    const userData = await getUserDocumentByEmail(userEmail);
    const rawSeries = userData?.series || [];
    
    // Convert Firestore data to plain objects
    const series: MySeries[] = rawSeries.map((seriesItem: Record<string, unknown>) => ({
      id: (seriesItem.id as string) || '',
      title: (seriesItem.title as string) || '',
      thumbnailUrl: (seriesItem.thumbnailUrl as string) || '',
      userId: (seriesItem.userId as string) || '',
      authorEmail: (seriesItem.authorEmail as string) || '',
      authorName: (seriesItem.authorName as string) || '',
      isTrashed: Boolean(seriesItem.isTrashed) || false,
      trashedAt: convertTimestamp(seriesItem.trashedAt),
      viewCount: (seriesItem.viewCount as number) || 0,
      likeCount: (seriesItem.likeCount as number) || 0,
      commentCount: (seriesItem.commentCount as number) || 0,
      comments: (seriesItem.comments as unknown[]) || [],
      createdAt: convertTimestamp(seriesItem.createdAt),
      updatedAt: convertTimestamp(seriesItem.updatedAt),
    }));
    
    return series;
  } catch (error) {
    console.error('Error fetching user series contents:', error);
    return [];
  }
}

/**
 * @deprecated Use fetchUserSeriesContents() for full data or fetchUserSeriesTitle() for titles only
 */
export async function fetchUserSeries(userEmail: string): Promise<MySeries[]> {
  console.log('fetchUserSeries (deprecated) - redirecting to fetchUserSeriesContents');
  return fetchUserSeriesContents(userEmail);
}

export async function fetchSeriesByName(userEmail: string, seriesName: string): Promise<MySeries | null> {
  console.log('fetchSeriesByName userEmail: ', userEmail, 'seriesName:', seriesName);
  
  try {
    const series = await fetchUserSeriesContents(userEmail);
    const foundSeries = series.find(s => 
      s.title === decodeURIComponent(seriesName) || 
      s.id === seriesName ||
      s.title.replace(/\s+/g, '-').toLowerCase() === seriesName.toLowerCase()
    );
    
    return foundSeries || null;
  } catch (error) {
    console.error('Error fetching series by name:', error);
    return null;
  }
}


