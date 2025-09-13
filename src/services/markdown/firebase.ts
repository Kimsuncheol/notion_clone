import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { MySeries, TagType, FirebaseNoteContent, Comment, CustomUserProfile, LikeUser, TagTypeForTagsCollection, FileUploadProgress, InboxItem } from '@/types/firebase';
import { collection, deleteDoc, doc, getDoc, getFirestore, setDoc, Timestamp, updateDoc, onSnapshot, Unsubscribe, increment, arrayUnion, getDocs, where, query, FieldValue, addDoc } from 'firebase/firestore';
import { ngramSearchObjects, SearchConfig } from '@/utils/ngram';
import { getCurrentUserId } from '../common/firebase';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export interface SaveDraftParams {
  pageId?: string; // Optional for new drafts
  title: string;
  content: string;
  authorAvatar?: string;
  tags?: TagType[];
  series?: MySeries;
}

export interface PublishNoteParams {
  pageId?: string; // Optional for new notes
  isPublished?: boolean;
  title: string;
  content: string;
  description?: string; // Use content if not provided
  thumbnailUrl?: string;
  authorAvatar?: string;
  tags?: TagType[];
  series?: MySeries;

  setDescription?: (description: string) => void;
  setShowMarkdownPublishScreen?: (show: boolean) => void;
  setPublishContent?: (content: string) => void;
}

// Legacy interface for backward compatibility
export interface SaveNoteParams {
  pageId: string;
  title: string;
  content: string;
  description: string;
  isPublic?: boolean;
  isPublished?: boolean;
  authorAvatar?: string;
  series?: MySeries;
  thumbnailUrl?: string;
  updatedAt?: Date;
  tags?: TagType[];
}

export const updateNoteContent = async (pageId: string, title: string, publishTitle: string, content: string, description: string, isPublic?: boolean, isPublished?: boolean, thumbnail?: string, tags?: TagType[], series?: MySeries, viewCount?: number, likeCount?: number): Promise<void> => {
  // Validate pageId
  if (!pageId || pageId.trim() === '' || pageId === 'undefined') {
    throw new Error('Invalid pageId: cannot update note without a valid ID');
  }

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

    // Add tags to 'tags' collection
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        if (tag && tag.id && tag.name) {
          const tagRef = doc(db, 'tags', tag.id);
          const tagSnap = await getDoc(tagRef);

          if (tagSnap.exists()) {
            // Tag exists, increment post count and add note if not present
            const existingData = tagSnap.data() as TagTypeForTagsCollection;
            const noteExists = existingData.notes?.some(note => note.id === pageId);

            const updateData: { postCount: FieldValue; updatedAt: Date; notes?: FieldValue } = {
              postCount: increment(1),
              updatedAt: now,
            };

            if (!noteExists) {
              // Create minimal note data for tags collection
              const noteData: FirebaseNoteContent = {
                id: pageId,
                pageId,
                title: title || '',
                content: content || '',
                description: description || '',
                tags: tags || [],
                series: series || null,
                authorId: userId,
                authorEmail: user?.email || '',
                authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
                isPublic: isPublic || false,
                isPublished: isPublished || false,
                thumbnailUrl: thumbnail || '',
                viewCount: viewCount || 0,
                likeCount: likeCount || 0,
                createdAt: now,
                updatedAt: now,
                recentlyOpenDate: now,
              };
              updateData.notes = arrayUnion(noteData);
            }

            await updateDoc(tagRef, updateData);
          } else {
            // Tag doesn't exist, create it with postCount = 1 and note
            const noteData: FirebaseNoteContent = {
              id: pageId,
              pageId,
              title: title || '',
              content: content || '',
              description: description || '',
              tags: tags || [],
              series: series || null,
              authorId: userId,
              authorEmail: user?.email || '',
              authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',

              isPublic: isPublic || false,
              isPublished: isPublished || false,
              thumbnailUrl: thumbnail || '',
              viewCount: viewCount || 0,
              likeCount: likeCount || 0,
              createdAt: now,
              updatedAt: now,
              recentlyOpenDate: now,
            };

            const tagData: TagTypeForTagsCollection = {
              id: tag.id,
              userId: tag.userId || [userId],
              name: tag.name,
              postCount: 1,
              notes: [noteData],
              createdAt: tag.createdAt || now,
              updatedAt: now,
            };

            await setDoc(tagRef, tagData);
          }
        }
      }
    }

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
  params: SaveNoteParams
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  // Validate pageId
  if (!params.pageId || params.pageId.trim() === '' || params.pageId === 'undefined') {
    throw new Error('Invalid pageId: cannot save note without a valid ID');
  }

  const noteTitle = params.title;
  const noteContent = params.content;

  // Add validation for manual save
  if (!noteTitle.trim() || noteTitle.length === 0) {
    toast.error('Please enter a title');
    return;
  }
  if ((!noteContent.trim() || noteContent.length === 0) && !params.updatedAt) {
    toast.error('Content cannot be empty');
    return;
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

    toast.success('Note saved successfully!');
  } catch (error) {
    const errorMessage = 'Failed to save note';
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
  console.log('params: ', params);

  try {
    const authorId = getCurrentUserId();
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
      if (noteData.authorId !== authorId) {
        throw new Error('Unauthorized access to note');
      }

      // Update the existing draft
      await updateDoc(noteRef, {
        title: params.title,
        content: params.content,
        tags: params.tags || [],
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
        tags: params.tags || [],
        ...(params.series && { series: params.series }),
        authorId,
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

    // Add tags to 'tags' collection
    if (params.tags && params.tags.length > 0) {
      for (const tag of params.tags) {
        if (tag && tag.id && tag.name) {
          const tagRef = doc(db, 'tags', tag.id);
          const tagSnap = await getDoc(tagRef);

          if (tagSnap.exists()) {
            // Tag exists, increment post count and add note if not present
            const existingData = tagSnap.data() as TagTypeForTagsCollection;
            const noteExists = existingData.notes?.some(note => note.id === noteId);

            const updateData: { postCount: FieldValue; updatedAt: Date; notes?: FieldValue } = {
              postCount: increment(1),
              updatedAt: now,
            };

            if (!noteExists) {
              // Create note data for tags collection
              const noteData: FirebaseNoteContent = {
                id: noteId,
                pageId: noteId,
                title: params.title,
                content: params.content,
                description: '',
                tags: params.tags || [],
                series: params.series || null,
                authorId,
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
              updateData.notes = arrayUnion(noteData);
            }

            await updateDoc(tagRef, updateData);
          } else {
            // Tag doesn't exist, create it with postCount = 1 and note
            const noteData: FirebaseNoteContent = {
              id: noteId,
              pageId: noteId,
              title: params.title,
              content: params.content,
              description: '',
              tags: params.tags || [],
              series: params.series || null,
              authorId,
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

            const tagData: TagTypeForTagsCollection = {
              id: tag.id,
              userId: tag.userId || [authorId],
              name: tag.name,
              postCount: 1,
              notes: [noteData],
              createdAt: tag.createdAt || now,
              updatedAt: now,
            };

            await setDoc(tagRef, tagData);
          }
        }
      }
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
  console.log('params.series in publishNote', params.series);

  try {
    const authorId = getCurrentUserId();
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
      if (noteData.authorId !== authorId) {
        throw new Error('Unauthorized access to note');
      }

      console.log('params.tags in  in publishNote', params.tags);
      console.log('noteData in publishNote', noteData);

      // Update the existing note to published state
      await updateDoc(noteRef, {
        title: params.title,
        content: params.content,
        description: description,
        tags: params.tags || [],
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
      const userRef = doc(db, 'users', authorId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      noteId = noteRef.id;

      const noteData: FirebaseNoteContent = {
        id: noteId,
        pageId: noteId,
        title: params.title,
        content: params.content,
        description: description,
        tags: params.tags || [],
        ...(params.series && { series: params.series }),
        authorId,
        authorEmail: user.email || '',
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorAvatar: params.authorAvatar || '',
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
      await updateDoc(userRef, { postCount: increment(1) });
    }

    // Add tags to user's collection if provided
    if (params.tags && params.tags.length > 0) {
      const userRef = doc(db, 'users', authorId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentTags = userData.tags || [];

        // Add new tags that don't already exist
        const newTags = [...currentTags];
        params.tags.forEach(tag => {
          const existsInUserTags = currentTags.some((existingTag: TagType) => existingTag.id === tag.id);
          if (!existsInUserTags) {
            newTags.push(tag);
          }
        });

        await updateDoc(userRef, { tags: newTags });
      }

      // Add tags to 'tags' collection
      for (const tag of params.tags) {
        if (tag && tag.id && tag.name) {
          const tagRef = doc(db, 'tags', tag.id);
          const tagSnap = await getDoc(tagRef);

          if (tagSnap.exists()) {
            // Tag exists, increment post count and add note if not present
            const existingData = tagSnap.data() as TagTypeForTagsCollection;
            const noteExists = existingData.notes?.some(note => note.id === noteId);

            const updateData: { postCount: FieldValue; updatedAt: Date; notes?: FieldValue } = {
              postCount: increment(1),
              updatedAt: now,
            };

            if (!noteExists) {
              // Create note data for tags collection
              const noteData: FirebaseNoteContent = {
                id: noteId,
                pageId: noteId,
                title: params.title,
                content: params.content,
                description: description,
                tags: params.tags || [],
                series: params.series || null,
                authorId,
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
              updateData.notes = arrayUnion(noteData);
            }

            await updateDoc(tagRef, updateData);
          } else {
            // Tag doesn't exist, create it with postCount = 1 and note
            const noteData: FirebaseNoteContent = {
              id: noteId,
              pageId: noteId,
              title: params.title,
              content: params.content,
              description: description,
              tags: params.tags || [],
              series: params.series || null,
              authorId,
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

            const tagData: TagTypeForTagsCollection = {
              id: tag.id,
              userId: tag.userId || [authorId],
              name: tag.name,
              postCount: 1,
              notes: [noteData],
              createdAt: tag.createdAt || now,
              updatedAt: now,
            };

            await setDoc(tagRef, tagData);
          }
        }
      }
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
  series?: MySeries,

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
  series?: MySeries,
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

export const fetchNoteContent = async (pageId: string): Promise<FirebaseNoteContent | null> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated.");
    }

    // Create reference for the main note
    const noteRef = doc(db, 'notes', pageId);

    // Fetch the main note document
    const noteSnap = await getDoc(noteRef);

    // Handle the case where the main note does not exist
    if (!noteSnap.exists()) {
      console.log(`Note with pageId "${pageId}" not found.`);
      return null;
    }

    const noteData = noteSnap.data();

    // Perform authorization check
    if (!noteData.isPublic && noteData.userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    const noteContent = {
      id: noteSnap.id,
      ...noteData,
      createdAt: (noteData.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (noteData.updatedAt as Timestamp)?.toDate() || new Date(),
      recentlyOpenDate: (noteData.recentlyOpenDate as Timestamp)?.toDate(),
    } as FirebaseNoteContent;

    // Add note to user's recentlyReadNotes if it's not the user's own note
    // if (noteData.authorId !== userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentRecentlyRead = userData.recentlyReadNotes || [];

        // Check if note is already in recently read
        const noteExists = currentRecentlyRead.some((note: FirebaseNoteContent) => note.id === pageId);

        if (!noteExists) {
          // Create minimal note data for recently read to avoid large documents
          const minimalNoteData: FirebaseNoteContent = {
            id: noteContent.id,
            pageId: noteContent.pageId,
            title: noteContent.title,
            description: noteContent.description,
            authorId: noteContent.authorId,
            authorEmail: noteContent.authorEmail,
            authorName: noteContent.authorName,
            authorAvatar: noteContent.authorAvatar,
            thumbnailUrl: noteContent.thumbnailUrl,
            createdAt: noteContent.createdAt,
            updatedAt: noteContent.updatedAt,
            tags: noteContent.tags,
            // Exclude large fields to prevent document size issues
            content: '', // Don't store full content in recently read
            viewCount: noteContent.viewCount,
            likeCount: noteContent.likeCount,
            isPublic: noteContent.isPublic,
            isPublished: noteContent.isPublished,
            recentlyOpenDate: new Date(), // Set current time as recently opened
          };

          // Add to beginning of array and limit to last 20 items
          const updatedRecentlyRead = [minimalNoteData, ...currentRecentlyRead].slice(0, 20);

          await updateDoc(userRef, {
            recentlyReadNotes: updatedRecentlyRead,
            updatedAt: new Date()
          });
        } else {
          // Update the recentlyOpenDate for existing entry
          const updatedRecentlyRead = currentRecentlyRead.map((note: FirebaseNoteContent) =>
            note.id === pageId
              ? { ...note, recentlyOpenDate: new Date() }
              : note
          );

          // Move the recently accessed note to the front
          const noteIndex = updatedRecentlyRead.findIndex((note: FirebaseNoteContent) => note.id === pageId);
          if (noteIndex > 0) {
            const recentNote = updatedRecentlyRead.splice(noteIndex, 1)[0];
            updatedRecentlyRead.unshift(recentNote);
          }

          await updateDoc(userRef, {
            recentlyReadNotes: updatedRecentlyRead,
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      // Don't fail the main operation if recently read update fails
      console.warn('Failed to update recently read notes:', error);
    }
    // }

    // Return the note data
    return noteContent;

  } catch (error) {
    console.error('Error fetching note content:', error);
    // Re-throwing the error allows the calling function to handle it (e.g., show a UI message)
    throw error;
  }
};

export async function deleteNote(pageId: string, authorId: string): Promise<void> {
  console.log('deleteNote pageId: ', pageId);
  // 
  const noteRef = doc(db, 'notes', pageId);
  const userRef = doc(db, 'users', authorId);

  // decrease the 'postCount' field of the user document in 'users' collection

  try {
    const noteDoc = await getDoc(noteRef);
    if (!noteDoc.exists()) {
      throw new Error('Note not found');
    }
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    const postCount = userData.postCount || 0;
    if (postCount > 0) {
      await updateDoc(userRef, { postCount: increment(-1) });
    } else {
      throw new Error('Post count is already 0');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    return;
  }

  await deleteDoc(noteRef);
  console.log('note deleted');
}

export async function updateSeries(userId: string, seriesName: string, noteId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
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

export async function fetchSeries(): Promise<MySeries[]> {
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
    const newSeries: MySeries = {
      id: crypto.randomUUID(),
      title: seriesName,
      createdAt: new Date(),
    };
    console.log('createSeries series id: ', newSeries.id);

    // Initialize series array if it doesn't exist or is not an array
    if (!userData.series || !Array.isArray(userData.series)) {
      userData.series = [];
    }

    const isSeriesExists = userData.series.find((s: MySeries) => s.title === seriesName);
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
export function subscribeToSeries(onSeriesUpdate: (series: MySeries[]) => void): Unsubscribe | null {
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

export const updateLikeCount = async (pageId: string, userId: string, isLiked: boolean, authorId?: string): Promise<FirebaseNoteContent | null> => {
  // Validate required parameters
  if (!pageId || !userId || (authorId && !authorId)) {
    const errorMsg = `Invalid parameters: pageId=${pageId}, userId=${userId}, authorId=${authorId}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const noteRef = doc(db, 'notes', pageId);
  const userRef = doc(db, 'users', userId);
  const inboxRef = collection(db, 'inbox');

  try {
    // Get both note and user documents
    const [noteSnap, userSnap] = await Promise.all([
      getDoc(noteRef),
      getDoc(userRef)
    ]);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const userData = userSnap.data() as CustomUserProfile;

    const currentLikeUsers = noteData.likeUsers || [];
    const currentLikeCount = noteData.likeCount || 0;
    const currentUserLikedNotes = userData.likedNotes || [];

    let newLikeUsers: LikeUser[];
    let newLikeCount: number;
    let newUserLikedNotes: Partial<FirebaseNoteContent>[];

    // convert joinedAt to Date
    console.log('userData in updateLikeCount: ', userData.joinedAt instanceof Timestamp ? userData.joinedAt : new Date());

    const inboxData: InboxItem = {
      id: crypto.randomUUID(),
      userId: userId,
      type: 'like',
      title: noteData.title,
      message: `${userData.displayName} liked your note`,
      data: {
        noteId: noteData.id,
        userId: userId
      },
      isRead: false,
      createdAt: new Date(),
    }

    if (isLiked) {
      // User is liking the note
      const userAlreadyLiked = currentLikeUsers.some(user => user.uid === userId);
      if (!userAlreadyLiked) {
        // Create minimal user data for likes to avoid large documents
        const likeUser: LikeUser = {
          id: (userData.id && typeof userData.id === 'string') ? userData.id : userId,
          uid: (userData.uid && typeof userData.uid === 'string') ? userData.uid : userId,
          email: (userData.email && typeof userData.email === 'string') ? userData.email : '',
          displayName: (userData.userSettings?.displayName && typeof userData.userSettings?.displayName === 'string') ? userData.userSettings?.displayName : '',
          joinedAt: userData.joinedAt instanceof Timestamp ? userData.joinedAt.toDate() : new Date(),
        };

        console.log('likeUser: ', likeUser);

        // Add optional fields if they exist and are valid strings
        if (userData.photoURL && typeof userData.photoURL === 'string') {
          likeUser.photoURL = userData.photoURL;
        }
        if (userData.bio && typeof userData.bio === 'string') {
          likeUser.bio = userData.bio;
        }
        newLikeUsers = [...currentLikeUsers, likeUser];
        newLikeCount = currentLikeCount + 1;

        // Add note to user's liked notes if not already present
        const noteAlreadyLiked = currentUserLikedNotes.some(note => note.id === pageId);
        if (!noteAlreadyLiked) {
          // Store minimal note data to avoid large documents
          const minimalNoteData: Partial<FirebaseNoteContent> = {
            id: noteData.id,
            pageId: noteData.pageId,
            title: noteData.title,
            description: noteData.description,
            authorId: noteData.authorId,
            authorEmail: noteData.authorEmail,
            authorName: noteData.authorName,
            thumbnailUrl: noteData.thumbnailUrl,
            createdAt: noteData.createdAt,
            updatedAt: noteData.updatedAt,
            tags: noteData.tags,
            // Exclude large fields to prevent document size issues
            content: '', // Don't store full content in liked notes
            likeCount: newLikeCount,
            likeUsers: newLikeUsers,
            viewCount: noteData.viewCount,
            isPublic: noteData.isPublic,
            isPublished: noteData.isPublished,
          };
          newUserLikedNotes = [...currentUserLikedNotes, minimalNoteData];
        } else {
          newUserLikedNotes = currentUserLikedNotes;
        }
      } else {
        // User already liked, no change needed
        return noteData;
      }
    } else {
      // User is unliking the note
      const userHasLiked = currentLikeUsers.some(user => user.uid === userId);
      if (userHasLiked) {
        newLikeUsers = currentLikeUsers.filter(user => user.uid !== userId);
        newLikeCount = Math.max(0, currentLikeCount - 1);

        // Remove note from user's liked notes
        newUserLikedNotes = currentUserLikedNotes.filter(note => note.id !== pageId);
      } else {
        // User hasn't liked, no change needed
        return noteData;
      }
    }

    // Update note, user, and inbox documents simultaneously
    await Promise.all([
      updateDoc(noteRef, {
        likeCount: newLikeCount,
        likeUsers: newLikeUsers,
        updatedAt: new Date()
      }),
      updateDoc(userRef, {
        likedNotes: newUserLikedNotes,
        updatedAt: new Date()
      }),
      addDoc(inboxRef, inboxData)
    ]);

    // Return updated note data
    return {
      ...noteData,
      likeCount: newLikeCount,
      likeUsers: newLikeUsers,
      updatedAt: new Date()
    };

  } catch (error) {
    console.error('Error updating like count:', error);
    throw error;
  }
};

// Fetch comments for a specific note
export const fetchComments = async (noteId: string): Promise<Comment[]> => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    return noteData.comments || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Leave a comment on a note
export const leaveComment = async (
  noteId: string,
  content: string,
  parentCommentId?: string
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const noteRef = doc(db, 'notes', noteId);
    const userId = getCurrentUserId();
    const inboxRef = doc(db, 'inbox', userId);
    
    // Get note data to create inbox item
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }
    const noteData = noteSnap.data() as FirebaseNoteContent;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      noteId,
      author: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorEmail: user.email || '',
      content,
      createdAt: new Date(),
      ...(parentCommentId && { parentCommentId }),
    };

    const inboxData = {
      id: crypto.randomUUID(),
      userId: noteData.authorId, // Notify the note author
      type: 'comment',
      title: noteData.title,
      message: `${user.displayName || user.email?.split('@')[0] || 'Someone'} commented on your note`,
      data: {
        noteId: noteData.id,
        userId: userId,
        commentId: newComment.id
      },
      isRead: false,
      createdAt: new Date(),
    };

    await Promise.all([
      updateDoc(noteRef, {
        comments: arrayUnion(newComment)
      }),
      updateDoc(inboxRef, inboxData)
    ]);

    toast.success('Comment added successfully!');
    return newComment.id;
  } catch (error) {
    console.error('Error leaving comment:', error);
    toast.error('Failed to add comment');
    throw error;
  }
};

// Modify/Update a comment
export const modifyComment = async (
  noteId: string,
  commentId: string,
  newContent: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const comments = noteData.comments || [];

    const commentIndex = comments.findIndex(comment => comment.id === commentId);

    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const comment = comments[commentIndex];
    if (comment.authorEmail !== user.email) {
      throw new Error('Unauthorized to modify this comment');
    }

    // Create a new comments array with the updated comment
    const updatedComments = [
      ...comments.slice(0, commentIndex),
      { ...comment, content: newContent, updatedAt: new Date() },
      ...comments.slice(commentIndex + 1),
    ];

    await updateDoc(noteRef, { comments: updatedComments });

    toast.success('Comment updated successfully!');
  } catch (error) {
    console.error('Error modifying comment:', error);
    toast.error('Failed to update comment');
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (noteId: string, commentId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const comments = noteData.comments || [];

    const commentToDelete = comments.find(comment => comment.id === commentId);

    if (!commentToDelete) {
      throw new Error('Comment not found');
    }

    if (commentToDelete.authorEmail !== user.email) {
      throw new Error('Unauthorized to delete this comment');
    }

    const updatedComments = comments.filter(comment => comment.id !== commentId);

    await updateDoc(noteRef, { comments: updatedComments });

    toast.success('Comment deleted successfully!');
  } catch (error) {
    console.error('Error deleting comment:', error);
    toast.error('Failed to delete comment');
    throw error;
  }
};

// Reply to a comment
export const replyToComment = async (
  noteId: string,
  parentCommentId: string,
  content: string
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const comments = noteData.comments || [];
    const userId = getCurrentUserId();
    const inboxRef = doc(db, 'inbox', userId);

    // Recursive function to find and update the parent comment
    const addReplyToComment = (comments: Comment[], parentId: string, reply: Comment): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            comments: [...(comment.comments || []), reply],
          };
        }
        if (comment.comments) {
          return {
            ...comment,
            comments: addReplyToComment(comment.comments, parentId, reply),
          };
        }
        return comment;
      });
    };

    const newReply: Comment = {
      id: crypto.randomUUID(),
      noteId,
      parentCommentId,
      author: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorEmail: user.email || '',
      content,
      createdAt: new Date(),
    };

    const updatedComments = addReplyToComment(comments, parentCommentId, newReply);

    // Check if the comment was found and updated
    if (JSON.stringify(comments) === JSON.stringify(updatedComments)) {
      throw new Error('Parent comment not found');
    }

    const inboxData = {
      id: crypto.randomUUID(),
      userId: noteData.authorId, // Notify the note author
      type: 'reply',
      title: noteData.title,
      message: `${user.displayName || user.email?.split('@')[0] || 'Someone'} replied to a comment on your note`,
      data: {
        noteId: noteData.id,
        userId: userId,
        replyId: newReply.id,
        parentCommentId: parentCommentId
      },
      isRead: false,
      createdAt: new Date(),
    };

    await Promise.all([
      updateDoc(noteRef, { comments: updatedComments }),
      updateDoc(inboxRef, inboxData)
    ]);

    toast.success('Reply added successfully!');
    return newReply.id;
  } catch (error) {
    console.error('Error replying to comment:', error);
    toast.error('Failed to add reply');
    throw error;
  }
};

/**
 * Recursively converts Firestore Timestamps to JS Date objects in a comments array
 * @param comments - The array of comments to process
 * @returns A new array with Date objects
 */
const convertCommentTimestamps = (comments: Comment[]): Comment[] => {
  return comments.map(comment => {
    // Create a copy to avoid modifying the original object from cache
    const newComment = { ...comment };

    // Convert createdAt
    if (newComment.createdAt && typeof (newComment.createdAt as unknown as Timestamp).toDate === 'function') {
      newComment.createdAt = (newComment.createdAt as unknown as Timestamp).toDate();
    }

    // Convert updatedAt
    if (newComment.updatedAt && typeof (newComment.updatedAt as unknown as Timestamp).toDate === 'function') {
      newComment.updatedAt = (newComment.updatedAt as unknown as Timestamp).toDate();
    }

    // Recursively convert for nested comments
    if (newComment.comments && Array.isArray(newComment.comments)) {
      newComment.comments = convertCommentTimestamps(newComment.comments);
    }

    return newComment as Comment;
  });
};


/**
 * Subscribe to real-time comments updates for a specific note
 * @param noteId - The note ID to listen for comment updates
 * @param onCommentsUpdate - Callback function that receives updated comments array
 * @returns Unsubscribe function to stop listening, or null if note not found
 */
export function realtimeComments(
  noteId: string,
  onCommentsUpdate: (comments: Comment[]) => void
): Unsubscribe | null {
  if (!noteId || noteId.trim() === '') {
    console.error('Invalid noteId provided for comments subscription');
    return null;
  }

  try {
    const noteRef = doc(db, 'notes', noteId);

    const unsubscribe = onSnapshot(
      noteRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const noteData = docSnapshot.data() as FirebaseNoteContent;
          if (noteData) {
            // Ensure comments is always an array
            const comments = noteData.comments && Array.isArray(noteData.comments) ? noteData.comments : [];
            const convertedComments = convertCommentTimestamps(comments);
            onCommentsUpdate(convertedComments);
          } else {
            onCommentsUpdate([]);
          }
        } else {
          console.warn(`Note with ID ${noteId} not found for comments subscription`);
          onCommentsUpdate([]);
        }
      },
      (error) => {
        console.error('Error in comments subscription:', error);
        // Still call the callback with empty array to handle the error state
        onCommentsUpdate([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up comments subscription:', error);
    return null;
  }
}

// Helper function to find a comment/reply recursively
const findComment = (comments: Comment[], commentId: string): Comment | null => {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    if (comment.comments) {
      const found = findComment(comment.comments, commentId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const fetchReply = async (noteId: string, replyId: string): Promise<Comment | null> => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const comments = noteData.comments || [];

    return findComment(comments, replyId);
  } catch (error) {
    console.error('Error fetching reply:', error);
    throw error;
  }
};

// Helper function to modify a reply recursively
const modifyCommentRecursive = (comments: Comment[], commentId: string, newContent: string, userEmail: string): { updatedComments: Comment[], wasModified: boolean } => {
  let wasModified = false;
  const updatedComments = comments.map(comment => {
    if (comment.id === commentId) {
      if (comment.authorEmail !== userEmail) {
        throw new Error('Unauthorized to modify this comment');
      }
      wasModified = true;
      return {
        ...comment,
        content: newContent,
        updatedAt: new Date(),
      };
    }
    if (comment.comments) {
      const result = modifyCommentRecursive(comment.comments, commentId, newContent, userEmail);
      if (result.wasModified) {
        wasModified = true;
        return {
          ...comment,
          comments: result.updatedComments,
        };
      }
    }
    return comment;
  });
  return { updatedComments, wasModified };
};

export const modifyReply = async (noteId: string, replyId: string, newContent: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('User not authenticated');
    }

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const comments = noteData.comments || [];

    const { updatedComments, wasModified } = modifyCommentRecursive(comments, replyId, newContent, user.email);

    if (!wasModified) {
      throw new Error('Reply not found');
    }

    await updateDoc(noteRef, { comments: updatedComments });

    toast.success('Reply updated successfully!');
  } catch (error) {
    console.error('Error modifying reply:', error);
    toast.error((error as Error).message || 'Failed to update reply');
    throw error;
  }
};

// Helper function to delete a reply recursively
const deleteCommentRecursive = (comments: Comment[], commentId: string, userEmail: string): { updatedComments: Comment[], wasDeleted: boolean } => {
  let wasDeleted = false;
  const updatedComments = comments.reduce((acc, comment) => {
    if (comment.id === commentId) {
      if (comment.authorEmail !== userEmail) {
        throw new Error('Unauthorized to delete this comment');
      }
      wasDeleted = true;
      return acc; // Exclude the comment
    }

    if (comment.comments) {
      const result = deleteCommentRecursive(comment.comments, commentId, userEmail);
      if (result.wasDeleted) {
        wasDeleted = true;
        // Return the comment with updated (filtered) replies
        acc.push({ ...comment, comments: result.updatedComments });
        return acc;
      }
    }

    acc.push(comment); // Keep the comment
    return acc;
  }, [] as Comment[]);

  return { updatedComments, wasDeleted };
};

export const deleteReply = async (noteId: string, replyId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('User not authenticated');
    }

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data() as FirebaseNoteContent;
    const comments = noteData.comments || [];

    const { updatedComments, wasDeleted } = deleteCommentRecursive(comments, replyId, user.email);

    if (!wasDeleted) {
      throw new Error('Reply not found');
    }

    await updateDoc(noteRef, { comments: updatedComments });

    toast.success('Reply deleted successfully!');
  } catch (error) {
    console.error('Error deleting reply:', error);
    toast.error((error as Error).message || 'Failed to delete reply');
    throw error;
  }
};

export const fetchNoteBySeries = async (series: MySeries, authorEmail: string, authorId: string): Promise<FirebaseNoteContent[]> => {
  const notesCollectionRef = collection(db, 'notes');

  try {
    const q = query(
      notesCollectionRef,
      where('series', '==', series),
      where('authorEmail', '==', authorEmail),
      where('authorId', '==', authorId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as FirebaseNoteContent).filter((note: FirebaseNoteContent) => note.authorEmail === authorEmail && note.authorId === authorId);
  } catch (error) {
    console.error('Error fetching note by series:', error);
    throw error;
  }
};

/**
 * Fetches all unique tags from the global tags collection
 * @returns Promise<TagType[]> - Array of unique tags from global registry
 */
export const fetchTags = async (): Promise<TagType[]> => {
  try {
    // Fetch from global tags collection instead of scanning notes
    const tagsCollectionRef = collection(db, 'tags');
    const snapshot = await getDocs(tagsCollectionRef);

    const tags = snapshot.docs.map(doc => {
      const data = doc.data() as TagTypeForTagsCollection;

      // Convert Firestore Timestamps to Date objects and return basic TagType
      const tagType: TagType = {
        id: data.id,
        userId: data.userId,
        name: data.name,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };

      return tagType;
    });

    // Sort tags by name
    tags.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Fetched ${tags.length} unique tags from global collection`);
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Searches tags using n-gram analysis for intelligent matching
 * @param query - Search query string
 * @param tags - Array of tags to search through (optional, will fetch if not provided)
 * @param config - Search configuration options
 * @returns Promise<TagType[]> - Array of matching tags sorted by relevance
 */
export const searchTags = async (
  query: string,
  tags?: TagType[],
  config: SearchConfig = {}
): Promise<TagType[]> => {
  try {
    if (!query || !query.trim()) {
      return tags || [];
    }

    // Fetch tags if not provided
    const tagsToSearch = tags || await fetchTags();

    if (tagsToSearch.length === 0) {
      return [];
    }

    // Use n-gram search for intelligent matching
    const searchResults = ngramSearchObjects(
      query.trim(),
      tagsToSearch as unknown as Array<Record<string, unknown>>,
      ['name'], // Search in the name field
      {
        threshold: 0.2, // Lower threshold for more permissive matching
        maxResults: 20, // Allow more results for tags
        caseSensitive: false,
        algorithm: 'jaccard',
        n: 2, // Use 2-grams for better tag matching
        ...config
      }
    );

    return searchResults.map(result => result.item as unknown as TagType);
  } catch (error) {
    console.error('Error searching tags:', error);
    throw error;
  }
};

/**
 * Provides auto-completion suggestions for tag names
 * @param query - Current input string
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Promise<TagType[]> - Array of suggested tags
 */
export const getTagSuggestions = async (
  query: string,
  maxSuggestions: number = 5
): Promise<TagType[]> => {
  try {
    if (!query || query.length < 1) {
      // Return most popular tags when no query
      const allTags = await fetchTags();
      return allTags.slice(0, maxSuggestions);
    }

    const suggestions = await searchTags(query, undefined, {
      maxResults: maxSuggestions,
      threshold: 0.1, // Very permissive for suggestions
      n: 2,
    });

    return suggestions;
  } catch (error) {
    console.error('Error getting tag suggestions:', error);
    return [];
  }
};

/**
 * Creates a new tag or returns existing one from the global tags collection
 * Tags are unique globally and reused across users
 * @param tagName - Name of the tag to create
 * @returns Promise<TagType> - The created or existing tag
 */
export const createOrGetTag = async (tagName: string): Promise<TagType> => {
  try {
    if (!tagName || !tagName.trim()) {
      throw new Error('Tag name cannot be empty');
    }

    const normalizedName = tagName.trim().toLowerCase();

    // First, check the global tags collection for existing tag (case-insensitive)
    const tagsCollectionRef = collection(db, 'tags');
    const snapshot = await getDocs(tagsCollectionRef);

    let existingGlobalTag: TagTypeForTagsCollection | null = null;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as TagTypeForTagsCollection;
      if (data.name.toLowerCase() === normalizedName) {
        existingGlobalTag = {
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        } as TagTypeForTagsCollection;
        break;
      }
    }

    if (existingGlobalTag) {
      // Return the basic TagType structure (without notes array)
      const tagType: TagType = {
        id: existingGlobalTag.id,
        userId: existingGlobalTag.userId,
        name: existingGlobalTag.name,
        createdAt: existingGlobalTag.createdAt,
        updatedAt: existingGlobalTag.updatedAt,
      };
      console.log(`Reusing existing global tag: "${existingGlobalTag.name}"`);
      return tagType;
    }

    // If not found in global collection, create new tag
    const userId = getCurrentUserId();
    const newTag: TagType = {
      id: crypto.randomUUID(),
      userId: [userId],
      name: tagName.trim(), // Preserve original case
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Also create it in the global tags collection for future reuse
    const tagRef = doc(db, 'tags', newTag.id);
    const globalTagData: TagTypeForTagsCollection = {
      ...newTag,
      notes: [],
      postCount: 0,
    };

    await setDoc(tagRef, globalTagData);
    console.log(`Created new global tag: "${newTag.name}"`);

    return newTag;
  } catch (error) {
    console.error('Error creating or getting tag:', error);
    throw error;
  }
};

/**
 * Subscribes to real-time tag updates from the global tags collection
 * @param onTagsUpdate - Callback function that receives updated tags array
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToTags(onTagsUpdate: (tags: TagType[]) => void): Unsubscribe {
  try {
    // Subscribe to global tags collection instead of scanning notes
    const tagsCollectionRef = collection(db, 'tags');

    const unsubscribe = onSnapshot(
      tagsCollectionRef,
      (snapshot) => {
        const tags = snapshot.docs.map(doc => {
          const data = doc.data() as TagTypeForTagsCollection;

          // Convert Firestore Timestamps to Date objects and return basic TagType
          const tagType: TagType = {
            id: data.id,
            userId: data.userId,
            name: data.name,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          };

          return tagType;
        });

        // Sort tags by name
        tags.sort((a, b) => a.name.localeCompare(b.name));

        onTagsUpdate(tags);
      },
      (error) => {
        console.error('Error in tags subscription:', error);
        onTagsUpdate([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up tags subscription:', error);
    return () => { }; // Return empty function as fallback
  }
}


/**
 * Removes a tag from user's collection and optionally from a specific note
 * Updates the tags collection postCount accordingly
 * @param tagId - The ID of the tag to remove
 * @param noteId - Optional: specific note to remove tag from. If not provided, removes from all user's notes
 * @returns Promise<void>
 */
export const removeTagFromUserAndNotes = async (tagId: string, noteId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);

    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentTags = userData.tags || [];

    // Find the tag to remove
    const tagToRemove = currentTags.find((tag: TagType) => tag.id === tagId);
    if (!tagToRemove) {
      console.warn(`Tag with ID ${tagId} not found in user's tags`);
      return;
    }

    let removedNotesCount = 0;
    const notesCollectionRef = collection(db, 'notes');

    if (noteId) {
      // Remove tag from specific note only
      const noteRef = doc(db, 'notes', noteId);
      const noteDoc = await getDoc(noteRef);

      if (!noteDoc.exists()) {
        throw new Error('Note not found');
      }

      const noteData = noteDoc.data() as FirebaseNoteContent;
      if (noteData.authorId !== userId) {
        throw new Error('Unauthorized access to note');
      }

      const noteTags = noteData.tags || [];
      const hasTag = noteTags.some((tag: TagType) => tag.id === tagId);

      if (hasTag) {
        const updatedNoteTags = noteTags.filter((tag: TagType) => tag.id !== tagId);
        await updateDoc(noteRef, {
          tags: updatedNoteTags,
          updatedAt: new Date()
        });
        removedNotesCount = 1;

        // Check if user still has this tag in other notes
        const userNotesQuery = query(notesCollectionRef, where('authorId', '==', userId));
        const userNotesSnapshot = await getDocs(userNotesQuery);

        let tagStillInUse = false;
        userNotesSnapshot.docs.forEach(doc => {
          if (doc.id !== noteId) {
            const docData = doc.data() as FirebaseNoteContent;
            const docTags = docData.tags || [];
            if (docTags.some((tag: TagType) => tag.id === tagId)) {
              tagStillInUse = true;
            }
          }
        });

        // If tag is not used in any other notes, remove from user's tags array
        if (!tagStillInUse) {
          const updatedUserTags = currentTags.filter((tag: TagType) => tag.id !== tagId);
          await updateDoc(userRef, {
            tags: updatedUserTags,
            updatedAt: new Date()
          });
          console.log(`Tag "${tagToRemove.name}" also removed from user's tags (no longer in use)`);
        }
      }
    } else {
      // Remove tag from all user's notes
      const userNotesQuery = query(notesCollectionRef, where('authorId', '==', userId));
      const userNotesSnapshot = await getDocs(userNotesQuery);

      const noteUpdatePromises: Promise<void>[] = [];

      userNotesSnapshot.docs.forEach(noteDoc => {
        const noteData = noteDoc.data() as FirebaseNoteContent;
        const noteTags = noteData.tags || [];

        const hasTag = noteTags.some((tag: TagType) => tag.id === tagId);
        if (hasTag) {
          const updatedNoteTags = noteTags.filter((tag: TagType) => tag.id !== tagId);
          noteUpdatePromises.push(
            updateDoc(noteDoc.ref, {
              tags: updatedNoteTags,
              updatedAt: new Date()
            })
          );
        }
      });

      if (noteUpdatePromises.length > 0) {
        await Promise.all(noteUpdatePromises);
        removedNotesCount = noteUpdatePromises.length;
        console.log(`Removed tag "${tagToRemove.name}" from ${removedNotesCount} notes`);
      }

      // Remove from user's tags array
      const updatedUserTags = currentTags.filter((tag: TagType) => tag.id !== tagId);
      await updateDoc(userRef, {
        tags: updatedUserTags,
        updatedAt: new Date()
      });
    }

    // Update the tags collection - decrease postCount
    if (removedNotesCount > 0) {
      const tagRef = doc(db, 'tags', tagId);
      const tagDoc = await getDoc(tagRef);

      if (tagDoc.exists()) {
        const tagData = tagDoc.data() as TagTypeForTagsCollection;
        const currentPostCount = tagData.postCount || 0;
        const newPostCount = Math.max(0, currentPostCount - removedNotesCount);

        // Remove the affected notes from the tags collection's notes array
        const currentNotes = tagData.notes || [];
        let updatedNotes = currentNotes;

        if (noteId) {
          // Remove specific note
          updatedNotes = currentNotes.filter(note => note.id !== noteId);
        } else {
          // Remove all user's notes
          const userNotesQuery = query(notesCollectionRef, where('authorId', '==', userId));
          const userNotesSnapshot = await getDocs(userNotesQuery);
          const userNoteIds = userNotesSnapshot.docs.map(doc => doc.id);
          updatedNotes = currentNotes.filter(note => !userNoteIds.includes(note.id));
        }

        await updateDoc(tagRef, {
          postCount: newPostCount,
          notes: updatedNotes,
          updatedAt: new Date()
        });

        console.log(`Tag "${tagToRemove.name}" post count decreased to ${newPostCount}`);
      }
    }

    console.log(`Tag "${tagToRemove.name}" removed from user ${userId}${noteId ? ` (note: ${noteId})` : ' (all notes)'}`);
  } catch (error) {
    console.error('Error removing tag from user:', error);
    throw error;
  }
};

// Legacy function - use fetchTags and searchTags instead for new implementations
export const fetchTagNotes = async (tag: string): Promise<TagType[]> => {
  console.warn('fetchTagNotes is deprecated. Use fetchTags and searchTags instead.');

  try {
    const notesCollectionRef = collection(db, 'notes');
    const q = query(notesCollectionRef, where('tags', 'array-contains', tag));
    const snapshot = await getDocs(q);
    const tags = snapshot.docs.map(doc => doc.data().tags);
    return tags.map(tag => tag as TagType);
  } catch (error) {
    console.error('Error fetching tag notes:', error);
    throw error;
  }
};


// Fetch public note content (anyone can read public notes)
export const fetchPublicNoteContent = async (pageId: string): Promise<FirebaseNoteContent | null> => {
  try {
    const noteRef = doc(db, 'notes', pageId);
    const noteSnap = await getDoc(noteRef);

    if (noteSnap.exists()) {
      const data = noteSnap.data();
      // Only return if the note is public
      if (!data.isPublic) {
        throw new Error('Note is not public');
      }

      return {
        id: noteSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        recentlyOpenDate: data.recentlyOpenDate?.toDate(),
      } as FirebaseNoteContent;
    }

    return null;
  } catch (error) {
    console.error('Error fetching public note content:', error);
    throw error;
  }
};

// Upload file to Firebase Storage for markdown content
export const uploadFile = async (
  file: File,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `markdown/${userId}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({ progress });
        },
        (error) => {
          console.error('Error uploading file:', error);
          onProgress?.({ progress: 0, error: error.message });
          toast.error('Failed to upload file');
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.({ progress: 100, downloadUrl });
            toast.success('File uploaded successfully!');
            resolve(downloadUrl);
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to get file URL');
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error starting file upload:', error);
    toast.error('Failed to start file upload');
    throw error;
  }
};

// Upload thumbnail image to Firebase Storage and save URL to Firestore
export const uploadThumbnail = async (
  file: File,
  pageId: string,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<string> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = getCurrentUserId();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `thumbnails/${userId}/${fileName}`);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed for thumbnails');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Thumbnail file size must be less than 5MB');
    }

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({ progress });
        },
        (error) => {
          console.error('Error uploading thumbnail:', error);
          onProgress?.({ progress: 0, error: error.message });
          toast.error('Failed to upload thumbnail');
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update the note document with the thumbnail URL
            const noteRef = doc(db, 'notes', pageId);
            const noteSnap = await getDoc(noteRef);
            
            if (!noteSnap.exists()) {
              throw new Error('Note not found');
            }

            const noteData = noteSnap.data();
            if (noteData.authorId !== userId) {
              throw new Error('Unauthorized access to note');
            }

            await updateDoc(noteRef, {
              thumbnailUrl: downloadUrl,
              updatedAt: new Date()
            });

            // Also update the thumbnail in tags collection if note has tags
            const updatePromises: Promise<void>[] = [];

            if (noteData.tags && Array.isArray(noteData.tags)) {
              noteData.tags.forEach((tag: TagType) => {
                if (tag && tag.id) {
                  const tagUpdatePromise = async () => {
                    const tagRef = doc(db, 'tags', tag.id);
                    const tagSnap = await getDoc(tagRef);
                    
                    if (tagSnap.exists()) {
                      const tagData = tagSnap.data() as TagTypeForTagsCollection;
                      const updatedNotes = (tagData.notes || []).map((note: FirebaseNoteContent) => 
                        note.id === pageId 
                          ? { ...note, thumbnailUrl: downloadUrl, updatedAt: new Date() }
                          : note
                      );
                      
                      await updateDoc(tagRef, {
                        notes: updatedNotes,
                        updatedAt: new Date()
                      });
                    }
                  };
                  updatePromises.push(tagUpdatePromise());
                }
              });
            }

            // Update thumbnail in users' liked notes collections
            const usersCollectionRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollectionRef);
            
            usersSnapshot.docs.forEach((userDoc) => {
              const userData = userDoc.data() as CustomUserProfile;
              if (userData.likedNotes && Array.isArray(userData.likedNotes)) {
                const hasLikedNote = userData.likedNotes.some(
                  (likedNote: Partial<FirebaseNoteContent>) => likedNote.id === pageId
                );
                
                if (hasLikedNote) {
                  const userUpdatePromise = async () => {
                    const updatedLikedNotes = userData.likedNotes!.map((likedNote: Partial<FirebaseNoteContent>) => 
                      likedNote.id === pageId 
                        ? { ...likedNote, thumbnailUrl: downloadUrl, updatedAt: new Date() }
                        : likedNote
                    );
                    
                    await updateDoc(userDoc.ref, {
                      likedNotes: updatedLikedNotes,
                      updatedAt: new Date()
                    });
                  };
                  updatePromises.push(userUpdatePromise());
                }
              }

              // Also update recently read notes if they contain this note
              if (userData.recentlyReadNotes && Array.isArray(userData.recentlyReadNotes)) {
                const hasRecentlyReadNote = userData.recentlyReadNotes.some(
                  (recentNote: Partial<FirebaseNoteContent>) => recentNote.id === pageId
                );
                
                if (hasRecentlyReadNote) {
                  const recentUpdatePromise = async () => {
                    const updatedRecentlyReadNotes = userData.recentlyReadNotes!.map((recentNote: Partial<FirebaseNoteContent>) => 
                      recentNote.id === pageId 
                        ? { ...recentNote, thumbnailUrl: downloadUrl, updatedAt: new Date() }
                        : recentNote
                    );
                    
                    await updateDoc(userDoc.ref, {
                      recentlyReadNotes: updatedRecentlyReadNotes,
                      updatedAt: new Date()
                    });
                  };
                  updatePromises.push(recentUpdatePromise());
                }
              }
            });
            
            // Wait for all updates to complete
            if (updatePromises.length > 0) {
              await Promise.all(updatePromises);
            }

            onProgress?.({ progress: 100, downloadUrl });
            toast.success('Thumbnail uploaded and saved successfully!');
            resolve(downloadUrl);
          } catch (error) {
            console.error('Error saving thumbnail URL:', error);
            toast.error('Failed to save thumbnail URL');
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error starting thumbnail upload:', error);
    toast.error('Failed to start thumbnail upload');
    throw error;
  }
};