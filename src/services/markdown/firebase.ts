import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { FirebaseNoteWithSubNotes, FirebaseSubNoteContent, SeriesType, TagType } from '@/types/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, Timestamp, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export interface SaveNoteParams {
  pageId: string;
  title: string;
  content: string;
  publishContent: string;
  isPublic?: boolean;
  isPublished?: boolean;
  thumbnailUrl?: string;
  updatedAt?: Date;
  onSaveTitle?: (title: string) => void;
  tags?: TagType[];
}

export interface SaveNoteOptions {
  isAutoSave?: boolean;
  data?: {
    title: string;
    content: string;
    updatedAt?: Date;
  };
}

export interface PublishNoteParams {
  pageId: string;
  title: string;
  content: string;
  publishContent: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  publishTitle?: string;
  publishContentFromPublishScreen?: string;
  tags?: TagType[];
  seriesId?: string;
  seriesTitle?: string;
  onSaveTitle?: (title: string) => void;
  setPublishContent?: (content: string) => void;
  setShowMarkdownPublishScreen?: (show: boolean) => void;
}

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

export const updateNoteContent = async (pageId: string, title: string, publishTitle: string, content: string, publishContent: string, isPublic?: boolean, isPublished?: boolean, thumbnail?: string, tags?: TagType[], seriesId?: string, seriesTitle?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const noteRef = doc(db, 'notes', pageId);
    const now = new Date();
    console.log('thumbnail: ', thumbnail);

    const noteData = {
      pageId,
      title: title || '',
      content: content || '',
      publishTitle: publishTitle || '',
      publishContent: publishContent || '',
      tags: tags || [],
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublic || false,
      isPublished: isPublished || false,
      seriesId: seriesId || '',
      seriesTitle: seriesTitle || '',
      thumbnail: thumbnail || '',
      updatedAt: now,
      createdAt: now, // Will only be set on first creation
      recentlyOpenDate: now,
    };

    await setDoc(noteRef, noteData, { merge: true });
  } catch (error) {
    console.error('Error updating note content:', error);
    throw error;
  }
};

export const handleSave = async (
  params: SaveNoteParams,
  options: SaveNoteOptions = {}
): Promise<void> => {
  const { isAutoSave = false, data } = options;

  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const noteTitle = isAutoSave && data ? data.title : params.title;
  const noteContent = isAutoSave && data ? data.content : params.content;

  // Add validation for manual save
  if (!isAutoSave) {
    if (!noteTitle.trim() || noteTitle.length === 0) {
      toast.error('Please enter a title');
      return;
    }
    if ((!noteContent.trim() || noteContent.length === 0) && !params.updatedAt) {
      toast.error('Content cannot be empty');
      return;
    }
  }

  try {
    await updateNoteContent(
      params.pageId,
      noteTitle || 'Untitled',
      noteTitle || 'Untitled', // publishTitle same as title
      noteContent,
      params.publishContent,
      params.isPublic,
      params.isPublished,
      params.thumbnailUrl, // No thumbnail for auto-save
      params.tags
    );

    // await updateFavoriteNoteTitle(params.pageId, noteTitle);

    if (params.onSaveTitle) {
      params.onSaveTitle(noteTitle);
    }

    if (!isAutoSave) {
      toast.success('Note saved successfully!');
    } else {
      console.log('Auto-saved successfully');
    }
  } catch (error) {
    const errorMessage = `Failed to save note${isAutoSave ? ' (auto-save)' : ''}`;
    console.error(`${errorMessage}:`, error);
    toast.error(errorMessage);
    throw error;
  }
};

export const handlePublish = async (params: PublishNoteParams): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // If publishContent is provided from modal, update the context
    if (params.publishContentFromPublishScreen && params.setPublishContent) {
      params.setPublishContent(params.publishContentFromPublishScreen);
    }

    await updateNoteContent(
      params.pageId,
      params.title,
      params.publishTitle || params.title,
      params.content,
      params.publishContentFromPublishScreen || params.publishContent,
      true, // isPublic for publishing
      params.isPublished,
      params.thumbnailUrl,
      params.tags
    );

    // Call the onSaveTitle callback if provided
    if (params.onSaveTitle) {
      params.onSaveTitle(params.title);
    }

    toast.success(params.isPublished ? 'Note published successfully!' : 'Note saved as draft!');

    if (params.setShowMarkdownPublishScreen) {
      params.setShowMarkdownPublishScreen(false);
    }
  } catch (error) {
    console.error('Error publishing note:', error);
    toast.error('Failed to publish note');
    throw error;
  }
};

export const createHandleSaveParams = (
  pageId: string,
  title: string,
  content: string,
  publishContent: string,
  isPublic?: boolean,
  isPublished?: boolean,
  thumbnailUrl?: string,
  updatedAt?: Date,
  onSaveTitle?: (title: string) => void
): SaveNoteParams => ({
  pageId,
  title,
  content,
  publishContent,
  isPublic,
  isPublished,
  thumbnailUrl,
  updatedAt,
  onSaveTitle,
});

export const createHandlePublishParams = (
  pageId: string,
  title: string,
  content: string,
  publishContent: string,
  thumbnailUrl?: string,
  isPublished?: boolean,
  publishTitle?: string,
  publishContentFromPublishScreen?: string,
  onSaveTitle?: (title: string) => void,
  setPublishContent?: (content: string) => void,
  setShowMarkdownPublishScreen?: (show: boolean) => void
): PublishNoteParams => ({
  pageId,
  title,
  content,
  publishContent,
  thumbnailUrl,
  isPublished,
  publishTitle,
  publishContentFromPublishScreen,
  onSaveTitle,
  setPublishContent,
  setShowMarkdownPublishScreen,
});

export const fetchNoteContent = async (pageId: string): Promise<FirebaseNoteWithSubNotes | null> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated.");
    }

    // 1. Create references for the main note and its subcollection
    const noteRef = doc(db, 'notes', pageId);
    const subNotesRef = collection(db, 'notes', pageId, 'subNotes');

    // 2. Fetch the main note document and all sub-note documents in parallel
    const [noteSnap, subNotesSnap] = await Promise.all([
      getDoc(noteRef),
      getDocs(subNotesRef) // Use getDocs for a collection
    ]);

    // 3. Handle the case where the main note does not exist
    if (!noteSnap.exists()) {
      console.log(`Note with pageId "${pageId}" not found.`);
      return null;
    }

    const noteData = noteSnap.data();

    // 4. Perform authorization check
    if (!noteData.isPublic && noteData.userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    // 5. Process the sub-notes. If the collection doesn't exist, subNotesSnap.docs will be an empty array.
    const subNotes = subNotesSnap.docs.map(docSnap => {
      const subNoteData = docSnap.data();
      return {
        id: docSnap.id,
        ...subNoteData,
        // Ensure Timestamps are converted to Dates for type safety
        createdAt: (subNoteData.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (subNoteData.updatedAt as Timestamp)?.toDate() || new Date(),
      } as FirebaseSubNoteContent;
    });

    // 6. Combine and return the final, structured data
    return {
      id: noteSnap.id,
      ...noteData,
      createdAt: (noteData.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (noteData.updatedAt as Timestamp)?.toDate() || new Date(),
      recentlyOpenDate: (noteData.recentlyOpenDate as Timestamp)?.toDate(),
      subNotes: subNotes, // Add the fetched sub-notes
    } as FirebaseNoteWithSubNotes;

  } catch (error) {
    console.error('Error fetching note content:', error);
    // Re-throwing the error allows the calling function to handle it (e.g., show a UI message)
    throw error;
  }
};

export async function deleteNote(pageId: string): Promise<void> {
  console.log('deleteNote pageId: ', pageId);
  const noteRef = doc(db, 'notes', pageId);
  try {
    const noteDoc = await getDoc(noteRef);
    if (!noteDoc.exists()) {
      throw new Error('Note not found');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    return;
  }

  await deleteDoc(noteRef);
  console.log('note deleted');
}

export async function updateSeries(userEmail: string, seriesName: string, noteId: string): Promise<void> {
  const userRef = doc(db, 'users', userEmail);
  const noteRef = doc(db, 'notes', noteId);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    if (!userData) {
      throw new Error('User data not found');
    }
    const noteDoc = await getDoc(noteRef);
    if (!noteDoc.exists()) {
      throw new Error('Note not found');
    }
    const noteData = noteDoc.data();
    if (!noteData) {
      throw new Error('Note data not found');
    }
    const seriesName = noteData.series;
    if (!seriesName) {
      throw new Error('Series not found');
    }
    // Initialize series array if it doesn't exist or is not an array
    if (!userData.series || !Array.isArray(userData.series)) {
      userData.series = [];
    }
    const series = userData.series;
    if (!series.includes(seriesName)) {
      throw new Error('Series not found');
    }
    series.push(noteId);
    await updateDoc(userRef, { series });
    await updateDoc(noteRef, { series });
    console.log('Series updated');
  } catch (error) {
    console.error('Error updating series:', error);
  }
}

// export async function updateSeries(userEmail: string, seriesName: string, noteId: string): Promise<void> {
//   const userRef = doc(db, 'users', userEmail);
//   const noteRef = doc(db, 'notes', noteId);
//   try {
//     const userDoc = await getDoc(userRef);
//     if (!userDoc.exists()) {
//       throw new Error('User not found');
//     }
//     const userData = userDoc.data();
//     if (!userData) {
//       throw new Error('User data not found');
//     }
//     const noteDoc = await getDoc(noteRef);
//     if (!noteDoc.exists()) {
//       throw new Error('Note not found');
//     }
//     const noteData = noteDoc.data();
//     if (!noteData) {
//       throw new Error('Note data not found');
//     }
//     const seriesName = noteData.series;
//     if (!seriesName) {
//       throw new Error('Series not found');
//     }
//     const series = userData.series;
//     if (!series.includes(seriesName)) {
//       throw new Error('Series not found');
//     }
//     series.push(noteId);
//     await updateDoc(userRef, { series });
//     console.log('Series updated');
//   } catch (error) {
//     console.error('Error updating series:', error);
//   }
// }

export async function fetchSeries(): Promise<SeriesType[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    if (!userData) {
      throw new Error('User data not found');
    }
    // Ensure series is always an array
    const series = userData.series && Array.isArray(userData.series) ? userData.series : [];
    return series;
  } catch (error) {
    console.error('Error fetching series:', error);
    throw error;
  }
}

export async function createSeries(seriesName: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  // fetch series from firebase
  // const series = await fetchSeries();
  // console.log('createSeries series: ', series);
  if (!userId) {
    throw new Error('User not authenticated');
  }
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    if (!userData) {
      throw new Error('User data not found');
    }
    const newSeries: SeriesType = {
      id: crypto.randomUUID(),
      title: seriesName,
      createdAt: new Date(),
    };
    console.log('createSeries series id: ', newSeries.id);
    
    // Initialize series array if it doesn't exist or is not an array
    if (!userData.series || !Array.isArray(userData.series)) {
      userData.series = [];
    }
    
    const isSeriesExists = userData.series.find((s: SeriesType) => s.title === seriesName);
    if (isSeriesExists) {
      toast.error('Series already exists');
      throw new Error('Series already exists');
    }
    userData.series.push(newSeries);
    await updateDoc(userRef, { series: userData.series });
    console.log('Series created');
  } catch (error) {
    console.error('Error creating series:', error);
  }
}

export async function deleteSeries(userEmail: string, seriesName: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userEmail);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    if (!userData) {
      throw new Error('User data not found');
    }
    // Initialize series array if it doesn't exist or is not an array
    if (!userData.series || !Array.isArray(userData.series)) {
      userData.series = [];
    }
    const series = userData.series;
    if (!series.includes(seriesName)) {
      throw new Error('Series not found');
    }
    series.splice(series.indexOf(seriesName), 1);
    await updateDoc(userRef, { series });
    console.log('Series deleted');
  } catch (error) {
    console.error('Error deleting series:', error);
  }
}

/**
 * Subscribe to real-time series updates for the current user
 * @param onSeriesUpdate - Callback function that receives updated series array
 * @returns Unsubscribe function to stop listening, or null if user not authenticated
 */
export function subscribeToSeries(onSeriesUpdate: (series: SeriesType[]) => void): Unsubscribe | null {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('User not authenticated for series subscription');
    return null;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          if (userData) {
            // Ensure series is always an array
            const series = userData.series && Array.isArray(userData.series) ? userData.series : [];
            onSeriesUpdate(series);
          } else {
            onSeriesUpdate([]);
          }
        } else {
          onSeriesUpdate([]);
        }
      },
      (error) => {
        console.error('Error in series subscription:', error);
        // Still call the callback with empty array to handle the error state
        onSeriesUpdate([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up series subscription:', error);
    return null;
  }
}

