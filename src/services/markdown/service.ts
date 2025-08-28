import { updateFavoriteNoteTitle } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { FirebaseNoteWithSubNotes, FirebaseSubNoteContent, TagType } from '@/types/firebase';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc, Timestamp } from 'firebase/firestore';

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
      ...(thumbnail && { thumbnail }), // Only include thumbnail if it has a value
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

    await updateFavoriteNoteTitle(params.pageId, noteTitle);

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
