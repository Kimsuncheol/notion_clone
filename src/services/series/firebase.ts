import { collection, query, where, getDocs, getFirestore, deleteDoc, doc } from 'firebase/firestore';
import { MySeries, Comment } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

type UserDocumentData = {
  series?: unknown[];
  updatedAt?: Date;
  [key: string]: unknown;
};

type SeriesDocumentEntry = Record<string, unknown>;

// Utility function to convert Firestore timestamp to Date
function convertTimestamp(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const firestoreTimestamp = timestamp as { seconds: number; nanoseconds?: number };
    const seconds = firestoreTimestamp.seconds;
    const nanoseconds = firestoreTimestamp.nanoseconds || 0;
    return new Date(seconds * 1000 + nanoseconds / 1000000);
  }
  return new Date();
}

// Helper function to get user document by email
async function getUserDocumentByEmail(userEmail: string): Promise<UserDocumentData> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', userEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('User not found');
  }

  const userDoc = querySnapshot.docs[0];
  return {
    ...userDoc.data(),
    updatedAt: userDoc.data().updatedAt ? convertTimestamp(userDoc.data().updatedAt) : undefined,
  } as UserDocumentData;
}

/**
 * Fetch user series with SeriesType interface (lightweight operation)
 */
export async function fetchUserSeriesTitle(userEmail: string): Promise<MySeries[]> {
  console.log('fetchUserSeriesTitle userEmail: ', userEmail);
  
  try {
    const userData = await getUserDocumentByEmail(userEmail);
    const rawSeries = Array.isArray(userData.series) ? (userData.series as SeriesDocumentEntry[]) : [];

    return rawSeries
      .map((seriesItem: SeriesDocumentEntry): MySeries => ({
        id: (seriesItem.id as string) || '',
        title: (seriesItem.title as string) || '',
        thumbnailUrl: (seriesItem.thumbnailUrl as string) || undefined,
        viewCount: (seriesItem.viewCount as number) || undefined,
        likeCount: (seriesItem.likeCount as number) || undefined,
        createdAt: convertTimestamp(seriesItem.createdAt),
        updatedAt: seriesItem.updatedAt ? convertTimestamp(seriesItem.updatedAt) : undefined,
      }))
      .filter((series: MySeries) => series.title !== '');
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
    const rawSeries = Array.isArray(userData.series) ? (userData.series as SeriesDocumentEntry[]) : [];

    // Convert Firestore data to plain objects
    const series: MySeries[] = rawSeries.map((seriesItem: SeriesDocumentEntry) => ({
      id: (seriesItem.id as string) || '',
      title: (seriesItem.title as string) || '',
      thumbnailUrl: (seriesItem.thumbnailUrl as string) || '',
      userId: (seriesItem.userId as string) || '',
      authorEmail: (seriesItem.authorEmail as string) || '',
      authorName: (seriesItem.authorName as string) || '',
      isTrashed: Boolean(seriesItem.isTrashed) || false,
      trashedAt: seriesItem.trashedAt ? convertTimestamp(seriesItem.trashedAt) : undefined,
      viewCount: (seriesItem.viewCount as number) || 0,
      likeCount: (seriesItem.likeCount as number) || 0,
      commentCount: (seriesItem.commentCount as number) || 0,
      comments: Array.isArray(seriesItem.comments) ? (seriesItem.comments as Comment[]) : [],
      createdAt: convertTimestamp(seriesItem.createdAt),
      updatedAt: seriesItem.updatedAt ? convertTimestamp(seriesItem.updatedAt) : undefined,
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

/**
 * Delete notes permanently from Firestore
 */
export async function deleteNotesFromSeries(
  userEmail: string,
  seriesId: string,
  noteIds: string[]
): Promise<void> {
  console.log('deleteNotesFromSeries userEmail:', userEmail, 'seriesId:', seriesId, 'noteIds:', noteIds);

  if (!noteIds || noteIds.length === 0) {
    console.log('No notes to delete');
    return;
  }

  try {
    // Delete each note permanently
    const deletePromises = noteIds.map(async (noteId) => {
      const noteSnap = await getDocs(query(collection(db, 'notes'), where('id', '==', noteId)));

      if (!noteSnap.empty) {
        const noteDocRef = doc(db, 'notes', noteSnap.docs[0].id);
        await deleteDoc(noteDocRef);
        console.log(`Deleted note ${noteId}`);
      }
    });

    await Promise.all(deletePromises);
    console.log('Successfully deleted all notes');
  } catch (error) {
    console.error('Error deleting notes:', error);
    throw error;
  }
}
