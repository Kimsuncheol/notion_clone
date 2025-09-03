import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { FirebaseNoteWithSubNotes, FirebaseSubNoteContent, SeriesType, TagType, FirebaseNoteContent } from '@/types/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, Timestamp, updateDoc, onSnapshot, Unsubscribe, increment } from 'firebase/firestore';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export interface SaveDraftParams {
  pageId?: string; // Optional for new drafts
  title: string;
  content: string;
  tags?: TagType[];
  series?: SeriesType;

}

export interface PublishNoteParams {
  pageId?: string; // Optional for new notes
  isPublished?: boolean;
  title: string;
  content: string;
  description?: string; // Use content if not provided
  thumbnailUrl?: string;
  tags?: TagType[];
  series?: SeriesType;

  setDescription?: (description: string) => void;
  setShowMarkdownPublishScreen?: (show: boolean) => void;
}

export interface SaveNoteOptions {
  isAutoSave?: boolean;
  data?: {
    title: string;
    content: string;
    updatedAt?: Date;
  };
}

// Legacy interface for backward compatibility
export interface SaveNoteParams {
  pageId: string;
  title: string;
  content: string;
  description: string;
  isPublic?: boolean;
  isPublished?: boolean;
  thumbnailUrl?: string;
  updatedAt?: Date;

  tags?: TagType[];
}

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

export const updateNoteContent = async (pageId: string, title: string, publishTitle: string, content: string, description: string, isPublic?: boolean, isPublished?: boolean, thumbnail?: string, tags?: TagType[], series?: SeriesType, viewCount?: number, likeCount?: number): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const noteRef = doc(db, 'notes', pageId);
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    console.log('thumbnail: ', thumbnail);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    const noteData = {
      pageId,
      title: title || '',
      content: content || '',
      publishTitle: publishTitle || '',
      description: description || '',
      tags: tags || [],
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublic || false,
      isPublished: isPublished || false,
      series: series || null,
      viewCount: viewCount || 0,
      likeCount: likeCount || 0,
      thumbnail: thumbnail || '',
      updatedAt: now,
      createdAt: now, // Will only be set on first creation
      recentlyOpenDate: now,
    };

    // add tags to user
    await updateDoc(userRef, { tags: [...(userData?.tags || []), ...(tags || [])] });

    await setDoc(noteRef, noteData, { merge: true });
  } catch (error) {
    console.error('Error updating note content:', error);
    throw error;
  }
};

// Utility functions for note state management
export const getNoteState = (note: FirebaseNoteContent): 'draft' | 'published' => {
  return note.isPublished ? 'published' : 'draft';
};

export const isNoteDraft = (note: FirebaseNoteContent): boolean => {
  return !note.isPublished && !note.isPublic;
};

export const isNotePublished = (note: FirebaseNoteContent): boolean => {
  return Boolean(note.isPublished && note.isPublic);
};

// Legacy function - use saveDraft instead for new implementations
export const SaveDraftedNote = async (title: string = 'Untitled', content: string = '', tags: TagType[] = []): Promise<string> => {
  console.warn('SaveDraftedNote is deprecated. Use saveDraft instead.');
  
  const params: SaveDraftParams = {
    title: title || 'Untitled',
    content: content || '',
    tags: tags || [],
  };
  
  return await saveDraft(params);
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
      noteTitle || 'Untitled', // description same as title
      noteContent,
      params.description,
      params.isPublic,
      params.isPublished,
      params.thumbnailUrl, // No thumbnail for auto-save
      params.tags
    );

    // await updateFavoriteNoteTitle(params.pageId, noteTitle);



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

// Save or create a draft note
export const saveDraft = async (params: SaveDraftParams): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const now = new Date();

    // Validate input
    if (!params.title.trim()) {
      throw new Error('Title cannot be empty');
    }

    let noteId = params.pageId;
    let noteRef;

    if (noteId) {
      // Update existing draft
      noteRef = doc(db, 'notes', noteId);
      
      // Verify the note exists and user has permission
      const noteSnap = await getDoc(noteRef);
      if (!noteSnap.exists()) {
        throw new Error('Note not found');
      }
      
      const noteData = noteSnap.data();
      if (noteData.userId !== userId) {
        throw new Error('Unauthorized access to note');
      }

      // Update the existing draft
      await updateDoc(noteRef, {
        title: params.title,
        content: params.content,
        tags: params.tags?.map(tag => tag.name) || [],
        series: params.series || null,
        updatedAt: now,
        recentlyOpenDate: now,
      });
    } else {
      // Create new draft
      noteRef = doc(collection(db, 'notes'));
      noteId = noteRef.id;

      const noteData: FirebaseNoteContent = {
        id: noteId,
        pageId: noteId,
        title: params.title,
        content: params.content,
        description: '',
        tags: params.tags?.map(tag => tag.name) || [],
        series: params.series,
        userId,
        authorEmail: user.email || '',
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        isPublic: false, // Drafts are private
        isPublished: false, // Drafts are not published
        thumbnailUrl: '',
        viewCount: 0,
        likeCount: 0,
        likeUsers: [],
        comments: [],
        createdAt: now,
        updatedAt: now,
        recentlyOpenDate: now,
      };

      await setDoc(noteRef, noteData);
    }



    toast.success(params.pageId ? 'Draft updated successfully!' : 'Draft saved successfully!');
    return noteId;
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error('Failed to save draft');
    throw error;
  }
};

// Publish a note (create new or publish existing draft)
export const publishNote = async (params: PublishNoteParams): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  // print series
  console.log('params.series: ', params.series);

  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const now = new Date();

    // Validate input
    if (!params.title.trim()) {
      throw new Error('Title cannot be empty');
    }

    const description = params.description;
    let noteId = params.pageId;
    let noteRef;

    if (noteId) {
      // Update existing note (draft -> published or update published)
      noteRef = doc(db, 'notes', noteId);
      
      // Verify the note exists and user has permission
      const noteSnap = await getDoc(noteRef);
      if (!noteSnap.exists()) {
        throw new Error('Note not found');
      }
      
      const noteData = noteSnap.data();
      if (noteData.userId !== userId) {
        throw new Error('Unauthorized access to note');
      }

      // Update the existing note to published state
      await updateDoc(noteRef, {
        title: params.title,
        content: params.content,
        description: description,
        tags: params.tags?.map(tag => tag.name) || [],
        series: params.series || null,
        thumbnailUrl: params.thumbnailUrl || '',
        isPublic: true, // Published notes are public
        isPublished: true, // Mark as published
        updatedAt: now,
        recentlyOpenDate: now,
      });
    } else {
      // Create new published note directly
      noteRef = doc(collection(db, 'notes'));
      noteId = noteRef.id;

      const noteData: FirebaseNoteContent = {
        id: noteId,
        pageId: noteId,
        title: params.title,
        content: params.content,
        description: description,
        tags: params.tags?.map(tag => tag.name) || [],
        series: params.series,
        userId,
        authorEmail: user.email || '',
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        isPublic: true, // Published notes are public
        isPublished: true, // Mark as published
        thumbnailUrl: params.thumbnailUrl || '',
        viewCount: 0,
        likeCount: 0,
        likeUsers: [],
        comments: [],
        createdAt: now,
        updatedAt: now,
        recentlyOpenDate: now,
      };

      await setDoc(noteRef, noteData);
    }

    // Update publish content in context if callback provided
    if (params.setPublishContent) {
      params.setPublishContent(description || '');
    }

    // Call the title callback if provided


    // Close publish screen if callback provided
    if (params.setShowMarkdownPublishScreen) {
      params.setShowMarkdownPublishScreen(false);
    }

    toast.success('Note published successfully!');
    return noteId;
  } catch (error) {
    console.error('Error publishing note:', error);
    toast.error('Failed to publish note');
    throw error;
  }
};

// Legacy function for backward compatibility
export const handlePublish = async (params: PublishNoteParams): Promise<void> => {
  await publishNote(params);
};

// Helper functions to create parameter objects
export const createSaveDraftParams = (
  title: string,
  content: string,
  pageId?: string,
  tags?: TagType[],
  series?: SeriesType,

): SaveDraftParams => ({
  pageId,
  title,
  content,
  tags,
  series,

});

export const createPublishNoteParams = (
  title: string,
  content: string,
  pageId?: string,
  description?: string,
  thumbnailUrl?: string,
  tags?: TagType[],
  series?: SeriesType,
  setPublishContent?: (content: string) => void,
  setShowMarkdownPublishScreen?: (show: boolean) => void
): PublishNoteParams => ({
  pageId,
  title,
  content,
  description,
  thumbnailUrl,
  tags,
  series,

  setPublishContent,
  setShowMarkdownPublishScreen,
});

// Legacy helper functions for backward compatibility
export const createHandleSaveParams = (
  pageId: string,
  title: string,
  content: string,
  description: string,
  isPublic?: boolean,
  isPublished?: boolean,
  thumbnailUrl?: string,
  updatedAt?: Date,

): SaveNoteParams => ({
  pageId,
  title,
  content,
  description,
  isPublic,
  isPublished,
  thumbnailUrl,
  updatedAt,

});

export const createHandlePublishParams = (
  pageId: string,
  title: string,
  content: string,
  description: string,
  thumbnailUrl?: string,
  isPublished?: boolean,
  publishTitle?: string,
  publishContentFromPublishScreen?: string,
  setPublishContent?: (content: string) => void,
  setShowMarkdownPublishScreen?: (show: boolean) => void
): PublishNoteParams => ({
  pageId,
  title,
  content,
  description,
  thumbnailUrl,

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

// Toggle note public status
export const toggleNotePublic = async (pageId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);

    // Get current note to verify ownership
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    const currentIsPublic = noteSnap.data().isPublic || false;
    const newIsPublic = !currentIsPublic;

    await updateDoc(noteRef, {
      isPublic: newIsPublic,
      updatedAt: new Date(),
    });

    return newIsPublic;
  } catch (error) {
    console.error('Error toggling note public status:', error);
    throw error;
  }
};


export const increaseViewCount = async (pageId: string): Promise<void> => {
  const noteRef = doc(db, 'notes', pageId);
  // try catch
  try {
    await updateDoc(noteRef, { viewCount: increment(1) });
  } catch (error) {
    console.error('Error increasing view count:', error);
  }
};