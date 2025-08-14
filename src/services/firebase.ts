import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, onSnapshot, startAfter, DocumentSnapshot, Unsubscribe, Timestamp, collectionGroup, DocumentData } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import type { FirebaseFolder, FirebasePage, FirebaseNoteContent, PublicNote, FavoriteNote, Workspace, FileUploadProgress, FirebaseSubNoteContent, FirebaseNoteForSubNote, TrashedSubNote, FirebaseNoteWithSubNotes } from '@/types/firebase';
export type { PublicNote } from '@/types/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// const globalNoteRef = collection(db, 'notes');

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Fetch all folders for the current user
export const fetchFolders = async (): Promise<FirebaseFolder[]> => {
  try {
    const userId = getCurrentUserId();
    const foldersRef = collection(db, 'folders');
    const q = query(
      foldersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirebaseFolder[];
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
};

// Fetch all pages for a specific folder
export const fetchPages = async (folderId: string): Promise<FirebasePage[]> => {
  try {
    const userId = getCurrentUserId();
    const pagesRef = collection(db, 'pages');
    const q = query(
      pagesRef,
      where('userId', '==', userId),
      where('folderId', '==', folderId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirebasePage[];
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

// Fetch all pages for the current user (for sidebar)
export const fetchAllPages = async (): Promise<FirebasePage[]> => {
  try {
    const userId = getCurrentUserId();
    const pagesRef = collection(db, 'pages');
    const q = query(
      pagesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirebasePage[];
  } catch (error) {
    console.error('Error fetching all pages:', error);
    throw error;
  }
};

// Fetch all notes with their public status for sidebar organization
export const fetchAllNotesWithStatus = async (): Promise<Array<{ pageId: string; title: string; isPublic: boolean; isTrashed: boolean; originalLocation?: { isPublic: boolean }; createdAt: Date; recentlyOpenDate?: Date }>> => {
  try {
    const userId = getCurrentUserId();
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        pageId: doc.id,
        title: data.title || 'Untitled',
        isPublic: data.isPublic || false,
        isTrashed: data.isTrashed || false,
        originalLocation: data.originalLocation || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        recentlyOpenDate: data.recentlyOpenDate?.toDate() || data.createdAt?.toDate(),
      };
    });
  } catch (error) {
    console.error('Error fetching notes with status:', error);
    throw error;
  }
};

// Fetch note content for a specific page
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
// export const fetchNoteContent = async (pageId: string): Promise<FirebaseNoteContent | null> => {
//   try {
//     const userId = getCurrentUserId();
//     const noteRef = doc(db, 'notes', pageId);
//     const noteSnap = await getDoc(noteRef);

//     if (noteSnap.exists()) {
//       const data = noteSnap.data();
//       // Allow access if the note is public, otherwise verify ownership
//       if (!data.isPublic && data.userId !== userId) {
//         throw new Error('Unauthorized access to note');
//       }

//       return {
//         id: noteSnap.id,
//         ...data,
//         createdAt: data.createdAt?.toDate() || new Date(),
//         updatedAt: data.updatedAt?.toDate() || new Date(),
//         recentlyOpenDate: data.recentlyOpenDate?.toDate(),
//       } as FirebaseNoteContent;
//     }

//     return null;
//   } catch (error) {
//     console.error('Error fetching note content:', error);
//     throw error;
//   }
// };

// Update note content
export const updateNoteContent = async (pageId: string, title: string, publishTitle: string, content: string, publishContent: string, isPublic?: boolean, isPublished?: boolean, thumbnail?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const noteRef = doc(db, 'notes', pageId);
    const now = new Date();

    console.log('updateNoteContent-1')

    const noteData = {
      pageId,
      title: title || '',
      content: content || '',
      publishTitle: publishTitle || '',
      publishContent: publishContent || '',
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublic || false,
      isPublished: isPublished || false,
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

// Add a new page
export const addNotePage = async (folderId: string, name: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const now = new Date();

    // Get folder info to determine if note should be public
    const folderRef = doc(db, 'folders', folderId);
    const folderSnap = await getDoc(folderRef);
    const folderData = folderSnap.data();
    const isPublicFolder = folderData?.folderType === 'public';

    // Create the page document
    const pageRef = await addDoc(collection(db, 'pages'), {
      name,
      folderId,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial empty note content for the page
    const initialNoteData = {
      pageId: pageRef.id,
      title: name || '',
      content: '',
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublicFolder || false, // Set public status based on folder type
      isTrashed: false,     // Set to false by default, Don't touch this when implementing another one.
      createdAt: now,
      updatedAt: now,
      recentlyOpenDate: now,
    };

    await setDoc(doc(db, 'notes', pageRef.id), initialNoteData);

    return pageRef.id;
  } catch (error) {
    console.error('Error adding note page:', error);
    throw error;
  }
};

export const addSubNotePage = async (parentId: string, userId: string, authorName: string): Promise<FirebaseSubNoteContent | string> => {
  if (!parentId || parentId.trim() === '') {
    throw new Error('parentId is required and cannot be empty');
  }

  if (!userId || userId.trim() === '') {
    throw new Error('userId is required and cannot be empty');
  }

  try {
    const subNotesCollectionRef = collection(db, 'notes', parentId, "subNotes");

    const newSubNoteRef = doc(subNotesCollectionRef);
    console.log('parentId in addSubNotePage functionality: ' + parentId);

    const newSubNoteData: FirebaseSubNoteContent = {
      id: newSubNoteRef.id,
      pageId: newSubNoteRef.id,
      parentId: parentId,
      title: "",
      content: "",
      userId,
      authorName,
      authorEmail: auth.currentUser?.email || '',
      createdAt: new Date(),
      updatedAt: null,
    };

    await setDoc(newSubNoteRef, newSubNoteData, { merge: true });

    console.log('new subnote data id: ' + newSubNoteData.id);

    // return newSubNoteRef.id;
    return newSubNoteData;
  } catch (error) {
    console.error('Error adding sub note page:', error);
    throw new Error(`Failed to add sub note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const updateSubNotePage = async (
  parentId: string,
  subNoteId: string,
  dataToUpdate: Partial<Omit<FirebaseSubNoteContent, "id" | "parentId" | "createdAt" | "userId" | "authorName" | "authorEmail" | "isPublic" | "isTrashed" | "trashedAt" | "originalLocation" | "comments" | "recentlyOpenDate" | "publishContent" | "thumbnail" | "pageId">>
): Promise<void> => {
  const subNoteRef = doc(db, 'notes', parentId, "subNotes", subNoteId);

  try {
    // First check if document exists
    const docSnap = await getDoc(subNoteRef);
    
    if (docSnap.exists()) {
      // Document exists, update it
      await updateDoc(subNoteRef, {
        ...dataToUpdate,
        updatedAt: new Date(),
      });
    } else {
      // Document doesn't exist, we can't update a non-existent document
      // This should be handled by creating the document first
      throw new Error(`Sub-note document with ID ${subNoteId} does not exist in parent ${parentId}. Create the document first before updating.`);
    }
  } catch (error) {
    console.error('Error updating sub note page:', error);
    throw new Error(`Failed to update sub note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create or update a sub-note (safer version that handles non-existing documents)
export const createOrUpdateSubNotePage = async (
  parentId: string,
  dataToUpdate: Partial<Omit<FirebaseSubNoteContent, "id" | "parentId" | "createdAt" | "userId" | "authorName" | "authorEmail" | "isPublic" | "isTrashed" | "trashedAt" | "originalLocation" | "comments" | "recentlyOpenDate" | "publishContent" | "thumbnail" | "pageId">>,
  userId: string,
  authorName: string,
  subNoteId?: string // Optional - if provided, update existing; if not, create new
): Promise<string> => {
  const subNotesCollectionRef = collection(db, 'notes', parentId, "subNotes");
  
  try {
    if (subNoteId) {
      // Update existing sub-note
      const subNoteRef = doc(subNotesCollectionRef, subNoteId);
      const docSnap = await getDoc(subNoteRef);
      
      if (docSnap.exists()) {
        // Document exists, update it
        const existingData = docSnap.data();
        const maybeAuthorEmail = existingData?.authorEmail ? {} : { authorEmail: auth.currentUser?.email || '' };
        await updateDoc(subNoteRef, {
          ...maybeAuthorEmail,
          ...dataToUpdate,
          updatedAt: new Date(),
        });
        return subNoteId;
      } else {
        // Document doesn't exist, create it with the provided ID
        const newSubNoteData: FirebaseSubNoteContent = {
          id: subNoteId,
          pageId: subNoteId,
          parentId: parentId,
          title: dataToUpdate.title || "",
          content: dataToUpdate.content || "",
          userId,
          authorName,
          authorEmail: auth.currentUser?.email || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...dataToUpdate, // Spread any additional data
        };

        await setDoc(subNoteRef, newSubNoteData, { merge: true });
        return subNoteId;
      }
    } else {
      // Create new sub-note with auto-generated ID
      const newSubNoteRef = doc(subNotesCollectionRef);
      const newSubNoteData: FirebaseSubNoteContent = {
        id: newSubNoteRef.id,
        pageId: newSubNoteRef.id,
        parentId: parentId,
        title: dataToUpdate.title || "",
        content: dataToUpdate.content || "",
        userId,
        authorName,
        authorEmail: auth.currentUser?.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...dataToUpdate, // Spread any additional data
      };

      await setDoc(newSubNoteRef, newSubNoteData, { merge: true });
      return newSubNoteRef.id;
    }
  } catch (error) {
    console.error('Error creating/updating sub note page:', error);
    throw new Error(`Failed to create/update sub note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const deleteSubNotePage = async (parentId: string, subNoteId: string): Promise<void> => {
  if (!parentId || parentId.trim() === '') {
    throw new Error('parentId is required and cannot be empty');
  }

  if (!subNoteId || subNoteId.trim() === '') {
    throw new Error('subNoteId is required and cannot be empty');
  }

  try {
    const subNoteRef = doc(db, 'notes', parentId, "subNotes", subNoteId);
    await deleteDoc(subNoteRef);

    const parentNoteRef = doc(db, 'notes', parentId);
    await updateDoc(parentNoteRef, {
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting sub note page:', error);
    throw new Error(`Failed to delete sub note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const fetchSubNotePage = async (parentId: string, subNoteId: string): Promise<FirebaseSubNoteContent | null> => {
  const subNoteRef = doc(db, 'notes', parentId, "subNotes", subNoteId);
  const docSnap = await getDoc(subNoteRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || null,
    } as FirebaseSubNoteContent;
  } else {
    console.warn(`Sub-note with ID ${subNoteId} not found in parent ${parentId}.`);
    return null;
  }
}

export const fetchNotesList = async (maxResults: number = 10): Promise<FirebaseNoteForSubNote[]> => {
  const userId = getCurrentUserId();
  const notesCollectionRef = collection(db, 'notes');
  const q = query(
    notesCollectionRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    orderBy('updatedAt', 'desc'),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const mapped: FirebaseNoteForSubNote = {
      id: doc.id,
      parentId: '',
      userId: data.userId,
      title: data.title || 'Untitled',
      content: data.content || '',
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: ((data.updatedAt as Timestamp)?.toDate?.() || (data.createdAt as Timestamp).toDate()) as Date,
      isTrashed: data.isTrashed ?? false,
      isPublic: data.isPublic ?? false,
    } as FirebaseNoteForSubNote;
    return mapped;
  });
}

export const fetchSubNotes = async (parentId: string): Promise<FirebaseSubNoteContent[]> => {
  const subNotesCollectionRef = collection(db, 'notes', parentId, "subNotes");
  const q = query(subNotesCollectionRef, orderBy('createdAt', 'desc'), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  const subNotes = snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || null,
    } as FirebaseSubNoteContent;
  });

  // Filter out trashed sub-notes
  return subNotes.filter(sn => !sn.isTrashed);
}

// Fetch trashed sub-notes belonging to the current user, optionally grouped by parent
export const fetchTrashedSubNotes = async (): Promise<TrashedSubNote[]> => {
  try {
    const userId = getCurrentUserId();
    // Query across all subNotes using collectionGroup
    const subNotesGroup = collectionGroup(db, 'subNotes');
    const q = query(subNotesGroup, where('userId', '==', userId), where('isTrashed', '==', true));
    const snapshot = await getDocs(q);

    const trashed: TrashedSubNote[] = [];

    for (const d of snapshot.docs) {
      const data = d.data() as DocumentData;
      // Extract parentId from path: notes/{noteId}/subNotes/{subNoteId}
      const parentId = d.ref.parent.parent?.id || data.parentId;
      // Get parent title for context
      let parentTitle = '';
      if (parentId) {
        const parentSnap = await getDoc(doc(db, 'notes', parentId));
        const pData = parentSnap.data() as DocumentData | undefined;
        parentTitle = (parentSnap.exists() ? (pData?.title as string) : '') || '';
      }
      trashed.push({
        id: d.id,
        title: (data.title as string) || 'Untitled',
        parentId: parentId || '',
        parentTitle,
        trashedAt: (data.trashedAt as Timestamp)?.toDate?.() || undefined,
      });
    }

    return trashed;
  } catch (error) {
    console.error('Error fetching trashed sub-notes:', error);
    throw error;
  }
}

// Permanently delete a specific sub-note in trash
export const permanentlyDeleteSubNote = async (parentId: string, subNoteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const subRef = doc(db, 'notes', parentId, 'subNotes', subNoteId);
    const snap = await getDoc(subRef);
    if (!snap.exists() || snap.data().userId !== userId) {
      throw new Error('Unauthorized access to sub-note');
    }
    if (!snap.data().isTrashed) {
      throw new Error('Sub-note must be in trash before permanent deletion');
    }
    await deleteDoc(subRef);
  } catch (error) {
    console.error('Error permanently deleting sub-note:', error);
    throw error;
  }
}

// Add a new folder
export const addFolder = async (name: string, folderType: 'private' | 'public' | 'custom' = 'custom'): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();

    const folderRef = await addDoc(collection(db, 'folders'), {
      name,
      isOpen: true,
      userId,
      folderType,
      createdAt: now,
      updatedAt: now,
    });

    return folderRef.id;
  } catch (error) {
    console.error('Error adding folder:', error);
    throw error;
  }
};

// Update folder name
export const updateFolderName = async (folderId: string, name: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const folderRef = doc(db, 'folders', folderId);

    // Verify ownership before updating
    const folderSnap = await getDoc(folderRef);
    if (!folderSnap.exists() || folderSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to folder');
    }

    await updateDoc(folderRef, {
      name,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating folder name:', error);
    throw error;
  }
};
// Fetch public notes for dashboard
export const fetchPublicNotes = async (limitCount: number = 5): Promise<PublicNote[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = limitCount > 0
      ? query(
        notesRef,
        where('isPublic', '==', true),
        where('isPublished', '==', true),
        where('isTrashed', '==', false),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )
      : query(
        notesRef,
        where('isPublic', '==', true),
        where('isPublished', '==', true),
        where('isTrashed', '==', false),
        orderBy('updatedAt', 'desc')
      );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title || 'Untitled',
        authorId: data.userId,
        authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishContent: data.publishContent || '',
        thumbnail: data.thumbnail || '',
        isPublished: data.isPublished || false,
      };
    }) as PublicNote[];
  } catch (error) {
    console.error('Error fetching public notes:', error);
    throw error;
  }
};

export const getNoteTitle = async (pageId: string): Promise<string> => {
  const noteRef = doc(db, 'notes', pageId);
  const noteSnap = await getDoc(noteRef);
  return noteSnap.data()?.title || 'Untitled';
}

export const changeNoteTitle = async (pageId: string, title: string): Promise<void> => {
  const noteRef = doc(db, 'notes', pageId);
  await updateDoc(noteRef, {
    title,
    updatedAt: new Date(),
  });
}

export const realTimeNoteTitle = async (pageId: string, setTitle: (title: string) => void): Promise<Unsubscribe> => {
  let unsubscribe: Unsubscribe = () => { };
  try {
    const noteRef = doc(db, 'notes', pageId);
    unsubscribe = onSnapshot(noteRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTitle(data?.title || '');
      }
    });
    return unsubscribe;
  } catch (e) {
    console.error('Error checking real-time note title:', e);
    toast.error('Error checking real-time note title');
    setTitle('');
    return unsubscribe;
  }
}

// Search public notes
export const searchPublicNotes = async (searchTerm: string, limit: number = 10): Promise<PublicNote[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('isTrashed', '==', false), // Exclude trashed notes
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    // Filter results by search term (client-side filtering since Firestore doesn't support full-text search)
    const results = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const preview = (data.content || '').substring(0, 150);

        return {
          id: doc.id,
          title: data.title || 'Untitled',
          authorId: data.userId,
          authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          preview: preview + (preview.length >= 150 ? '...' : ''),
        };
      })
      .filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, limit);

    return results as PublicNote[];
  } catch (error) {
    console.error('Error searching public notes:', error);
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

export const isNotePublic = async (pageId: string): Promise<boolean> => {
  const userId = getCurrentUserId();
  const noteRef = collection(db, 'notes');
  const q = query(noteRef, where('userId', '==', userId), where('id', '==', pageId));
  const snapshot = await getDocs(q);
  try {
    if (snapshot.empty) {
      return false;
    }

    const data = snapshot.docs[0].data();
    return data?.isPublic || false;
  } catch (e) {
    console.error('Error checking if note is public:', e);
    return false;
  }
}

export const realTimePublicStatus = async (pageId: string, setIsPublic: (isPublic: boolean) => void): Promise<Unsubscribe> => {
  let unsubscribe: Unsubscribe = () => { };
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);

    if (!userId || !pageId) {
      setIsPublic(false);
      return () => { };
    }

    unsubscribe = onSnapshot(noteRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsPublic(data?.isPublic || false);
      } else {
        setIsPublic(false);
      }
    });
    return unsubscribe;
  } catch (e) {
    console.error('Error checking real-time public status:', e);
    toast.error('Error checking real-time public status');
    setIsPublic(false);
    return unsubscribe;
  }
}

// Initialize default folders for new users
export const initializeDefaultFolders = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const foldersRef = collection(db, 'folders');
    const q = query(
      foldersRef,
      where('userId', '==', userId),
      where('folderType', 'in', ['private', 'public', 'trash'])
    );
    const snapshot = await getDocs(q);

    // Check if default folders already exist
    const existingTypes = snapshot.docs.map(doc => doc.data().folderType);

    const now = new Date();
    const foldersToCreate = [];

    if (!existingTypes.includes('private')) {
      foldersToCreate.push({
        name: 'Private',
        isOpen: true,
        userId,
        folderType: 'private',
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!existingTypes.includes('public')) {
      foldersToCreate.push({
        name: 'Public',
        isOpen: true,
        userId,
        folderType: 'public',
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!existingTypes.includes('trash')) {
      foldersToCreate.push({
        name: 'Trash',
        isOpen: true,
        userId,
        folderType: 'trash',
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create missing default folders
    for (const folderData of foldersToCreate) {
      await addDoc(foldersRef, folderData);
    }
  } catch (error) {
    console.error('Error initializing default folders:', error);
    throw error;
  }
};

// Workspace management functions

// Fetch all workspaces for the current user
export const fetchWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const userId = getCurrentUserId();
    const workspacesRef = collection(db, 'workspaces');
    const q = query(
      workspacesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Workspace[];
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

// Create a new workspace
export const createWorkspace = async (name: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();

    // First, set all existing workspaces to inactive
    const existingWorkspaces = await fetchWorkspaces();
    const updatePromises = existingWorkspaces.map(workspace =>
      updateDoc(doc(db, 'workspaces', workspace.id), { isActive: false, updatedAt: now })
    );
    await Promise.all(updatePromises);

    // Create the new workspace as active
    const workspaceRef = await addDoc(collection(db, 'workspaces'), {
      name,
      userId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize default folders for the new workspace
    await initializeDefaultFolders();

    return workspaceRef.id;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
};

// Switch to a different workspace
export const switchWorkspace = async (workspaceId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();

    // Verify the workspace belongs to the current user
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (!workspaceSnap.exists() || workspaceSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to workspace');
    }

    // Set all workspaces to inactive
    const existingWorkspaces = await fetchWorkspaces();
    const updatePromises = existingWorkspaces.map(workspace =>
      updateDoc(doc(db, 'workspaces', workspace.id), {
        isActive: workspace.id === workspaceId,
        updatedAt: now
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error switching workspace:', error);
    throw error;
  }
};

// Get the current active workspace
export const getCurrentWorkspace = async (): Promise<Workspace | null> => {
  try {
    const userId = getCurrentUserId();
    const workspacesRef = collection(db, 'workspaces');
    const q = query(
      workspacesRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Workspace;
  } catch (error) {
    console.error('Error getting current workspace:', error);
    throw error;
  }
};

// Update workspace name
export const updateWorkspaceName = async (workspaceId: string, name: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const workspaceRef = doc(db, 'workspaces', workspaceId);

    // Verify ownership before updating
    const workspaceSnap = await getDoc(workspaceRef);
    if (!workspaceSnap.exists() || workspaceSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to workspace');
    }

    await updateDoc(workspaceRef, {
      name,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating workspace name:', error);
    throw error;
  }
};

// Initialize default workspace for new users
export const initializeDefaultWorkspace = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const workspacesRef = collection(db, 'workspaces');
    const q = query(workspacesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    // If no workspaces exist, create a default one
    if (snapshot.empty) {
      const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
      await createWorkspace(`${userName}'s Workspace`);
    }
  } catch (error) {
    console.error('Error initializing default workspace:', error);
    throw error;
  }
};

// Member management interfaces and functions
export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  invitedBy: string;
  isActive: boolean;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'workspace_invitation' | 'member_added' | 'member_removed' | 'role_changed';
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// Get workspace members
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  try {
    const membersRef = collection(db, 'workspaceMembers');
    const q = query(
      membersRef,
      where('workspaceId', '==', workspaceId),
      where('isActive', '==', true),
      orderBy('joinedAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date(),
    })) as WorkspaceMember[];
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    throw error;
  }
};

// Check if user is workspace owner
export const isWorkspaceOwner = async (workspaceId: string, userId?: string): Promise<boolean> => {
  try {
    const currentUserId = userId || getCurrentUserId();
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (!workspaceSnap.exists()) {
      return false;
    }

    return workspaceSnap.data().userId === currentUserId;
  } catch (error) {
    console.error('Error checking workspace ownership:', error);
    return false;
  }
};

// Get user's workspace role
export const getUserWorkspaceRole = async (workspaceId: string, userId?: string): Promise<'owner' | 'editor' | 'viewer' | null> => {
  try {
    const currentUserId = userId || getCurrentUserId();

    // Check if user is owner
    if (await isWorkspaceOwner(workspaceId, currentUserId)) {
      return 'owner';
    }

    // Check if user is a member
    const membersRef = collection(db, 'workspaceMembers');
    const q = query(
      membersRef,
      where('workspaceId', '==', workspaceId),
      where('userId', '==', currentUserId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data().role as 'editor' | 'viewer';
  } catch (error) {
    console.error('Error getting user workspace role:', error);
    return null;
  }
};

// Send workspace invitation
export const sendWorkspaceInvitation = async (
  workspaceId: string,
  inviteeEmail: string,
  role: 'editor' | 'viewer'
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    // Verify user is workspace owner
    if (!(await isWorkspaceOwner(workspaceId, userId))) {
      throw new Error('Only workspace owners can send invitations');
    }

    // Get workspace info
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    if (!workspaceSnap.exists()) {
      throw new Error('Workspace not found');
    }
    const workspaceData = workspaceSnap.data();

    // Check if user is already a member
    const existingMembers = await getWorkspaceMembers(workspaceId);
    const isAlreadyMember = existingMembers.some(member => member.email === inviteeEmail);
    if (isAlreadyMember) {
      throw new Error('User is already a member of this workspace');
    }

    // Check if invitation already exists
    const invitationsRef = collection(db, 'workspaceInvitations');
    const existingInvitationQuery = query(
      invitationsRef,
      where('workspaceId', '==', workspaceId),
      where('inviteeEmail', '==', inviteeEmail),
      where('status', '==', 'pending')
    );
    const existingInvitationSnap = await getDocs(existingInvitationQuery);
    if (!existingInvitationSnap.empty) {
      throw new Error('Invitation already sent to this user');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitationData = {
      workspaceId,
      workspaceName: workspaceData.name,
      inviterUserId: userId,
      inviterName: user?.displayName || user?.email?.split('@')[0] || 'Unknown',
      inviterEmail: user?.email || '',
      inviteeEmail,
      role,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    const invitationRef = await addDoc(invitationsRef, invitationData);

    // Send notification to invitee (if they have an account)
    await createNotificationForEmail(inviteeEmail, {
      type: 'workspace_invitation',
      title: 'Workspace Invitation',
      message: `${invitationData.inviterName} invited you to join "${workspaceData.name}" workspace`,
      data: {
        workspaceId,
        workspaceName: workspaceData.name,
        inviterName: invitationData.inviterName,
        role,
        invitationId: invitationRef.id,
      },
    });

    return invitationRef.id;
  } catch (error) {
    console.error('Error sending workspace invitation:', error);
    throw error;
  }
};

// Get pending invitations for user
export const getUserInvitations = async (): Promise<WorkspaceInvitation[]> => {
  try {
    const user = auth.currentUser;
    if (!user?.email) {
      return [];
    }

    const invitationsRef = collection(db, 'workspaceInvitations');
    const q = query(
      invitationsRef,
      where('inviteeEmail', '==', user.email),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate() || new Date(),
    })) as WorkspaceInvitation[];
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    throw error;
  }
};

// Accept workspace invitation
export const acceptWorkspaceInvitation = async (invitationId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    // Get invitation
    const invitationRef = doc(db, 'workspaceInvitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const invitationData = invitationSnap.data();

    // Verify invitation is for current user
    if (invitationData.inviteeEmail !== user?.email) {
      throw new Error('Unauthorized to accept this invitation');
    }

    // Check if invitation is still valid
    if (invitationData.status !== 'pending') {
      throw new Error('Invitation is no longer valid');
    }

    if (new Date() > invitationData.expiresAt?.toDate()) {
      throw new Error('Invitation has expired');
    }

    const now = new Date();

    // Add user as workspace member
    const memberData = {
      workspaceId: invitationData.workspaceId,
      userId,
      email: user?.email || '',
      name: user?.displayName || user?.email?.split('@')[0] || 'Unknown',
      role: invitationData.role,
      joinedAt: now,
      invitedBy: invitationData.inviterUserId,
      isActive: true,
    };

    await addDoc(collection(db, 'workspaceMembers'), memberData);

    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
      updatedAt: now,
    });

    // Send notification to workspace owner
    await createNotification(invitationData.inviterUserId, {
      type: 'member_added',
      title: 'Member Joined',
      message: `${memberData.name} accepted your invitation to join "${invitationData.workspaceName}"`,
      data: {
        workspaceId: invitationData.workspaceId,
        workspaceName: invitationData.workspaceName,
        memberName: memberData.name,
        memberEmail: memberData.email,
      },
    });
  } catch (error) {
    console.error('Error accepting workspace invitation:', error);
    throw error;
  }
};

// Decline workspace invitation
export const declineWorkspaceInvitation = async (invitationId: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    // Get invitation
    const invitationRef = doc(db, 'workspaceInvitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const invitationData = invitationSnap.data();

    // Verify invitation is for current user
    if (invitationData.inviteeEmail !== user?.email) {
      throw new Error('Unauthorized to decline this invitation');
    }

    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'declined',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error declining workspace invitation:', error);
    throw error;
  }
};

// Change member role (owner only)
export const changeMemberRole = async (
  workspaceId: string,
  memberId: string,
  newRole: 'editor' | 'viewer'
): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    // Verify user is workspace owner
    if (!(await isWorkspaceOwner(workspaceId, userId))) {
      throw new Error('Only workspace owners can change member roles');
    }

    const memberRef = doc(db, 'workspaceMembers', memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      throw new Error('Member not found');
    }

    const memberData = memberSnap.data();

    // Update member role
    await updateDoc(memberRef, {
      role: newRole,
      updatedAt: new Date(),
    });

    // Send notification to member
    await createNotification(memberData.userId, {
      type: 'role_changed',
      title: 'Role Updated',
      message: `Your role has been changed to ${newRole} in the workspace`,
      data: {
        workspaceId,
        newRole,
      },
    });
  } catch (error) {
    console.error('Error changing member role:', error);
    throw error;
  }
};

// Remove member from workspace (owner only)
export const removeMemberFromWorkspace = async (
  workspaceId: string,
  memberId: string
): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    // Verify user is workspace owner
    if (!(await isWorkspaceOwner(workspaceId, userId))) {
      throw new Error('Only workspace owners can remove members');
    }

    const memberRef = doc(db, 'workspaceMembers', memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      throw new Error('Member not found');
    }

    const memberData = memberSnap.data();

    // Mark member as inactive instead of deleting
    await updateDoc(memberRef, {
      isActive: false,
      removedAt: new Date(),
    });

    // Send notification to member
    await createNotification(memberData.userId, {
      type: 'member_removed',
      title: 'Removed from Workspace',
      message: `You have been removed from the workspace`,
      data: {
        workspaceId,
      },
    });
  } catch (error) {
    console.error('Error removing member from workspace:', error);
    throw error;
  }
};

// Notification functions
export const createNotification = async (
  userId: string,
  notification: Omit<NotificationItem, 'id' | 'userId' | 'isRead' | 'createdAt'>
): Promise<string> => {
  try {
    const notificationData = {
      userId,
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };

    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification for email (find user by email)
export const createNotificationForEmail = async (
  email: string,
  notification: Omit<NotificationItem, 'id' | 'userId' | 'isRead' | 'createdAt'>
): Promise<void> => {
  try {
    // In a real implementation, you would have a way to find users by email
    // For now, we'll just create a notification with the email as identifier
    const notificationData = {
      userEmail: email, // Temporary field for email-based notifications
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification for email:', error);
    // Don't throw error as this is optional
  }
};

// Get user notifications
export const getUserNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Also get email-based notifications
    const emailQuery = user?.email ? query(
      notificationsRef,
      where('userEmail', '==', user.email),
      orderBy('createdAt', 'desc'),
      limit(50)
    ) : null;

    const [snapshot, emailSnapshot] = await Promise.all([
      getDocs(q),
      emailQuery ? getDocs(emailQuery) : Promise.resolve(null)
    ]);

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as NotificationItem[];

    // Merge email-based notifications
    if (emailSnapshot) {
      const emailNotifications = emailSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId, // Set the userId for email-based notifications
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as NotificationItem[];

      // Update email-based notifications to have userId
      for (const emailDoc of emailSnapshot.docs) {
        const emailNotificationData = emailDoc.data();
        if (!emailNotificationData.userId && emailNotificationData.userEmail) {
          await updateDoc(emailDoc.ref, {
            userId,
            userEmail: emailNotificationData.userEmail, // Keep for reference
          });
        }
      }

      notifications.push(...emailNotifications);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        isRead: true,
        readAt: new Date(),
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (!notificationSnap.exists()) {
      throw new Error('Notification not found');
    }

    const notificationData = notificationSnap.data();

    // Verify notification belongs to current user
    if (notificationData.userId !== userId) {
      throw new Error('Unauthorized to delete this notification');
    }

    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const userId = getCurrentUserId();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Favorites management functions

// Add note to favorites
export const addToFavorites = async (noteId: string, subNoteId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    // Check if already in favorites
    const favoritesRef = collection(db, 'favorites');
    const existingQuery = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    // Prevent duplicates: for sub-note, avoid duplicate for same subNoteId; for note-level, ensure no note-level already exists
    const hasDuplicate = existingSnapshot.docs.some((d) => {
      const data = d.data() as { subNoteId?: string | null };
      if (subNoteId) {
        return data.subNoteId === subNoteId;
      }
      return data.subNoteId === undefined || data.subNoteId === null;
    });
    if (hasDuplicate) throw new Error('Already in favorites');

    // Get note and optional sub-note data for validation and titles
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) throw new Error('Note not found');
    const noteData = noteSnap.data();
    const noteTitle = noteData.title || 'Untitled';

    let subNoteTitle: string | undefined;
    if (subNoteId) {
      const subNoteRef = doc(db, 'notes', noteId, 'subNotes', subNoteId);
      const subNoteSnap = await getDoc(subNoteRef);
      if (!subNoteSnap.exists()) throw new Error('Sub-note not found');
      const subData = subNoteSnap.data();
      if (!subData.content || !String(subData.content).trim()) {
        throw new Error('Cannot add an empty sub-note to favorites.');
      }
      subNoteTitle = subData.title || 'Untitled';
    } else {
      if (!noteData.content || !String(noteData.content).trim()) {
        throw new Error('Cannot add an empty note to favorites.');
      }
    }

    // Add to favorites
    const favoriteData = {
      userId,
      noteId,
      noteTitle,
      subNoteId: subNoteId || null,
      ...(subNoteId ? { subNoteTitle } : {}),
      addedAt: new Date(),
    };

    await addDoc(favoritesRef, favoriteData);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove note from favorites
export const removeFromFavorites = async (noteId: string, subNoteId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const snapshot = await getDocs(q);

    const targets = snapshot.docs.filter((docSnap) => {
      const data = docSnap.data() as { subNoteId?: string | null };
      if (subNoteId) {
        return data.subNoteId === subNoteId;
      }
      return data.subNoteId === undefined || data.subNoteId === null;
    });

    if (targets.length === 0) throw new Error('Not in favorites');

    const deletePromises = targets.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Check if note is in favorites
export const isNoteFavorite = async (noteId: string, subNoteId?: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.some((docSnap) => {
      const data = docSnap.data() as { subNoteId?: string | null };
      if (subNoteId) return data.subNoteId === subNoteId;
      return data.subNoteId === undefined || data.subNoteId === null;
    });
  } catch (error) {
    console.error('Error checking if note is favorite:', error);
    return false;
  }
};

export const realTimeFavoriteStatus = async (noteId: string, setIsFavorite: (isFavorite: boolean) => void, subNoteId?: string): Promise<Unsubscribe> => {
  let unsubscribe: Unsubscribe = () => { };
  try {
    const userId = getCurrentUserId();
    const favoritesRef = collection(db, "favorites");
    const q = query(favoritesRef, where('noteId', '==', noteId), where('userId', '==', userId));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const anyMatch = snapshot.docs.some((docSnap) => {
        const data = docSnap.data() as { subNoteId?: string | null };
        if (subNoteId) return data.subNoteId === subNoteId;
        return data.subNoteId === undefined || data.subNoteId === null;
      });
      setIsFavorite(anyMatch);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error checking real-time favorite status:', error);
    toast.error('Error checking real-time favorite status');
    setIsFavorite(false);
    return unsubscribe;
  }
}

// Get user's favorite notes
export const getUserFavorites = async (): Promise<FavoriteNote[]> => {
  try {
    const userId = getCurrentUserId();

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as FavoriteNote[];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
};

// Duplicate note function
export const duplicateNote = async (noteId: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    // Get the original note content
    const originalNoteRef = doc(db, 'notes', noteId);
    const originalNoteSnap = await getDoc(originalNoteRef);

    if (!originalNoteSnap.exists()) {
      throw new Error('Original note not found');
    }

    const originalNoteData = originalNoteSnap.data();

    // Verify the user owns the note
    if (originalNoteData.userId !== userId) {
      throw new Error('Unauthorized to duplicate this note');
    }

    // Get the original page to determine folder
    const originalPageRef = doc(db, 'pages', noteId);
    const originalPageSnap = await getDoc(originalPageRef);
    let folderId = '';

    if (originalPageSnap.exists()) {
      folderId = originalPageSnap.data().folderId;
    } else {
      // If page doesn't exist, put in Private folder
      const folders = await fetchFolders();
      const privateFolder = folders.find(f => f.folderType === 'private');
      if (privateFolder) {
        folderId = privateFolder.id;
      } else {
        throw new Error('No folder found for duplicate note');
      }
    }

    // Generate duplicate title with (n) suffix
    let duplicateTitle = originalNoteData.title || 'Untitled';
    const baseTitle = duplicateTitle;

    // Check for existing duplicates and find the next number
    const allPages = await fetchAllPages();
    const existingTitles = allPages.map(p => p.name);

    let counter = 1;
    while (existingTitles.includes(duplicateTitle)) {
      duplicateTitle = `${baseTitle} (${counter})`;
      counter++;
    }

    const now = new Date();

    // Create new page
    const newPageRef = await addDoc(collection(db, 'pages'), {
      name: duplicateTitle,
      folderId,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create duplicate note content
    const duplicateNoteData = {
      pageId: newPageRef.id,
      title: duplicateTitle,
      blocks: originalNoteData.blocks || [],
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: false, // Always make duplicates private
      createdAt: now,
      updatedAt: now,
      recentlyOpenDate: now,
    };

    await setDoc(doc(db, 'notes', newPageRef.id), duplicateNoteData);

    return newPageRef.id;
  } catch (error) {
    console.error('Error duplicating note:', error);
    throw error;
  }
};

// Move note to trash
export const moveToTrash = async (noteId: string, subNoteId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    console.log("moveToTrash in firebase", noteId, subNoteId);
    const noteRef = subNoteId ? doc(db, 'notes', noteId, 'subNotes', subNoteId) : doc(db, 'notes', noteId);
    console.log("noteRef in firebase", noteRef);

    // Get current note to verify ownership and save original location
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    const currentNote = noteSnap.data();
    const now = new Date();

    // Update note to mark as trashed
    await updateDoc(noteRef, {
      isTrashed: true,
      trashedAt: now,
      originalLocation: { isPublic: currentNote.isPublic || false },
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error moving note to trash:', error);
    throw error;
  }
};

// Don't remove the functionality below
export const updateFavoriteNoteTitle = async (noteId: string, title: string, subNoteId?: string, subNoteTitle?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const favoritesRef = collection(db, 'favorites');
    const q = subNoteId
      ? query(favoritesRef, where('userId', '==', userId), where('noteId', '==', noteId), where('subNoteId', '==', subNoteId))
      : query(favoritesRef, where('userId', '==', userId), where('noteId', '==', noteId), where('subNoteId', '==', null));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return;
    }
    const favoriteDoc = snapshot.docs[0];
    const updateData: { [k: string]: string } = { noteTitle: title };
    if (subNoteId && subNoteTitle !== undefined) {
      updateData.subNoteTitle = subNoteTitle;
    }
    await updateDoc(favoriteDoc.ref, updateData as Record<string, string>);
  } catch (error) {
    console.error('Error updating favorite note:', error);
    throw error;
  }
};

// Restore note from trash
export const restoreFromTrash = async (noteId: string, subNoteId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = subNoteId ? doc(db, 'notes', noteId, 'subNotes', subNoteId) : doc(db, 'notes', noteId);

    // Get current note to verify ownership and restore original location
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    const currentNote = noteSnap.data();
    const now = new Date();

    // Restore note to original location
    await updateDoc(noteRef, {
      isTrashed: false,
      trashedAt: null,
      // For page notes, restore original public status; sub-notes may not use this field
      ...(subNoteId ? {} : { isPublic: currentNote.originalLocation?.isPublic || false }),
      originalLocation: null,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error restoring note from trash:', error);
    throw error;
  }
};

// Permanently delete note from trash
// Permanently delete note from trash
export const permanentlyDeleteNote = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', noteId);
    const pageRef = doc(db, 'pages', noteId);

    // Verify ownership before deleting
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    // Only allow permanent deletion if the note is trashed
    if (!noteSnap.data().isTrashed) {
      throw new Error('Note must be in trash before permanent deletion');
    }

    // Delete subNotes collection if it exists
    const subNotesRef = collection(noteRef, 'subNotes');
    const subNotesSnapshot = await getDocs(subNotesRef);
    
    const subNotesDeletionPromises = subNotesSnapshot.docs.map(subDoc => 
      deleteDoc(subDoc.ref)
    );
    
    // Wait for all subNotes to be deleted first
    if (subNotesDeletionPromises.length > 0) {
      await Promise.all(subNotesDeletionPromises);
    }

    // Clear all comments before deletion
    await updateDoc(noteRef, {
      comments: [],
      updatedAt: new Date(),
    });

    // Also clean up any favorites that reference this note
    const favoritesRef = collection(db, 'favorites');
    const favoritesQuery = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);

    // Delete both the note, its page document, and any favorites
    const deletionPromises = [
      deleteDoc(noteRef),
      deleteDoc(pageRef),
      // Delete all favorite documents that reference this note
      ...favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    ];

    await Promise.all(deletionPromises);
  } catch (error) {
    console.error('Error permanently deleting note:', error);
    throw error;
  }
};
// export const permanentlyDeleteNote = async (noteId: string): Promise<void> => {
//   try {
//     const userId = getCurrentUserId();
//     const noteRef = doc(db, 'notes', noteId);
//     const pageRef = doc(db, 'pages', noteId);

//     // Verify ownership before deleting
//     const noteSnap = await getDoc(noteRef);
//     if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
//       throw new Error('Unauthorized access to note');
//     }
    
//     // Only allow permanent deletion if the note is trashed
//     if (!noteSnap.data().isTrashed) {
//       throw new Error('Note must be in trash before permanent deletion');
//     }

//     // If the note has 'subNotes' collection in the note document, delete them first
//     const subNotesRef = collection(noteRef, 'subNotes');
//     const subNotesSnapshot = await getDocs(subNotesRef);

//     const subNotesDeletionPromises = subNotesSnapshot.docs.map(doc => deleteDoc(doc.ref));

//     if (subNotesDeletionPromises.length > 0) await Promise.all(subNotesDeletionPromises);

//     // Also clean up any favorites that reference this note
//     const favoritesRef = collection(db, 'favorites');
//     const favoritesQuery = query(
//       favoritesRef,
//       where('userId', '==', userId),
//       where('noteId', '==', noteId)
//     );
//     const favoritesSnapshot = await getDocs(favoritesQuery);

//     // Delete both the note, its page document, and any favorites
//     const deletionPromises = [
//       deleteDoc(noteRef),
//       deleteDoc(pageRef),
//       // Delete all favorite documents that reference this note
//       ...favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref))
//     ];

//     await Promise.all(deletionPromises);
//   } catch (error) {
//     console.error('Error permanently deleting note:', error);
//     throw error;
//   }
// };

// Help & Support system interfaces and functions
export interface SupportConversation {
  id: string;
  type: 'contact' | 'bug' | 'feedback';
  userEmail: string;
  userName: string;
  userId: string;
  status: 'active' | 'closed';
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  unreadCount: number; // For admin to track unread messages
  typing?: string[]; // user emails
  adminPresent?: boolean;
  adminLastSeen?: Date;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  senderEmail: string;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
}

// Create or get an existing support conversation
export const createOrGetSupportConversation = async (
  type: 'contact' | 'bug' | 'feedback'
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    // Check if user already has an active conversation of this type
    const conversationsRef = collection(db, 'helpSupport');
    const existingQuery = query(
      conversationsRef,
      where('userId', '==', userId),
      where('type', '==', type),
      where('status', '==', 'active')
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      // Return existing conversation ID
      return existingSnapshot.docs[0].id;
    }

    // Create new conversationtion
    const now = new Date();
    const conversationData = {
      type,
      userEmail: user.email || '',
      userName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
      userId,
      status: 'active',
      lastMessage: '',
      lastMessageAt: now,
      createdAt: now,
      unreadCount: 0,
    };

    const conversationRef = await addDoc(conversationsRef, conversationData);
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating support conversation:', error);
    throw error;
  }
};

// Send a support message
export const sendSupportMessage = async (
  conversationId: string,
  text: string,
  sender: 'user' | 'admin' = 'user'
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const now = new Date();

    // Add message to subcollection
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    await addDoc(messagesRef, {
      text,
      sender,
      senderEmail: user.email || '',
      senderName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      timestamp: now,
      isRead: sender === 'admin', // Admin messages are read by default
    });

    // Update conversation with last message and conditionally increment unread count
    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const currentData = conversationSnap.data();
      let newUnreadCount = currentData.unreadCount || 0;

      if (sender === 'user') {
        // Only increment count if the admin is not currently present in the chat room
        if (!currentData.adminPresent) {
          newUnreadCount++;
        }
      } else { // sender is 'admin'
        // Reset unread count when admin sends a message
        newUnreadCount = 0;
      }

      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageAt: now,
        unreadCount: newUnreadCount,
      });
    }
  } catch (error) {
    console.error('Error sending support message:', error);
    throw error;
  }
};

// Get support conversations for admin (grouped by type)
export const getAdminSupportConversations = async (
  type?: 'contact' | 'bug' | 'feedback',
  sortBy: 'newest' | 'oldest' | 'unread' | 'name' = 'newest'
): Promise<SupportConversation[]> => {
  try {
    const conversationsRef = collection(db, 'helpSupport');

    let q;
    if (type) {
      // First query by type and status
      if (sortBy === 'name') {
        q = query(
          conversationsRef,
          where('type', '==', type),
          orderBy('userName', 'asc')
        );
      } else {
        q = query(
          conversationsRef,
          where('type', '==', type),
          orderBy('lastMessageAt', sortBy === 'newest' ? 'desc' : 'asc')
        );
      }
    } else {
      if (sortBy === 'name') {
        q = query(
          conversationsRef,
          orderBy('userName', 'asc')
        );
      } else {
        q = query(
          conversationsRef,
          orderBy('lastMessageAt', sortBy === 'newest' ? 'desc' : 'asc')
        );
      }
    }

    const snapshot = await getDocs(q);

    let conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as SupportConversation[];

    // Client-side sorting for unread count since Firestore doesn't support complex sorting
    if (sortBy === 'unread') {
      conversations = conversations.sort((a, b) => {
        // First sort by unread count (descending), then by date (newest first)
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      });
    }

    return conversations;
  } catch (error) {
    console.error('Error fetching admin support conversations:', error);
    throw error;
  }
};

// Get user's support conversations
export const getUserSupportConversations = async (
  sortBy: 'newest' | 'oldest' | 'type' = 'newest'
): Promise<SupportConversation[]> => {
  try {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, 'helpSupport');

    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);

    let conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as SupportConversation[];

    // Client-side sorting
    if (sortBy === 'oldest') {
      conversations = conversations.sort((a, b) => a.lastMessageAt.getTime() - b.lastMessageAt.getTime());
    } else if (sortBy === 'type') {
      conversations = conversations.sort((a, b) => {
        // First sort by type, then by newest date
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      });
    }

    return conversations;
  } catch (error) {
    console.error('Error fetching user support conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getSupportMessages = async (conversationId: string): Promise<SupportMessage[]> => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      conversationId,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as SupportMessage[];
  } catch (error) {
    console.error('Error fetching support messages:', error);
    throw error;
  }
};

// Mark messages as read (for admin)
export const markSupportMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get all unread user messages
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('sender', '==', 'user'),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    // Mark all as read
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);

    // Reset unread count in conversation
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, { unreadCount: 0 });
  } catch (error) {
    console.error('Error marking support messages as read:', error);
    throw error;
  }
};

// Mark admin messages as read (for users)
export const markAdminMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get all unread admin messages
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('sender', '==', 'admin'),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    // Mark all as read
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking admin messages as read:', error);
    throw error;
  }
};

// Close support conversation
export const closeSupportConversation = async (conversationId: string): Promise<void> => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, {
      status: 'closed',
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Error closing support conversation:', error);
    throw error;
  }
};

// Get total unread support messages count for admin
export const getAdminUnreadSupportCount = async (): Promise<{
  contact: number;
  bug: number;
  feedback: number;
  total: number;
}> => {
  try {
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('status', '==', 'active'),
      where('unreadCount', '>', 0)
    );
    const snapshot = await getDocs(q);

    const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type as 'contact' | 'bug' | 'feedback';
      const unreadCount = data.unreadCount || 0;

      counts[type] += unreadCount;
      counts.total += unreadCount;
    });

    return counts;
  } catch (error) {
    console.error('Error getting admin unread support count:', error);
    return { contact: 0, bug: 0, feedback: 0, total: 0 };
  }
};

// Real-time listener for admin unread support counts
export const subscribeToAdminUnreadCounts = (
  callback: (counts: { contact: number; bug: number; feedback: number; total: number }) => void
): (() => void) => {
  try {
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type as 'contact' | 'bug' | 'feedback';
        const unreadCount = data.unreadCount || 0;

        if (unreadCount > 0) {
          counts[type] += unreadCount;
          counts.total += unreadCount;
        }
      });

      callback(counts);
    }, (error) => {
      console.error('Error in admin unread counts listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up admin unread counts listener:', error);
    return () => { };
  }
};

// Real-time listener for user's unread counts by type
export const subscribeToUserUnreadCounts = (
  callback: (counts: { contact: number; bug: number; feedback: number; total: number }) => void
): (() => void) => {
  try {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type as 'contact' | 'bug' | 'feedback';
        // For users, we need to count messages where sender is 'admin' and isRead is false
        // This is more complex as we need to query the subcollection
        // For now, we'll use a simplified approach - you might want to restructure this
        const unreadCount = 0; // We'll implement proper counting below

        counts[type] += unreadCount;
        counts.total += unreadCount;
      });

      callback(counts);
    }, (error) => {
      console.error('Error in user unread counts listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up user unread counts listener:', error);
    return () => { };
  }
};

// Real-time listener for specific conversation unread count
export const subscribeToConversationUnreadCount = (
  conversationId: string,
  isAdmin: boolean,
  callback: (unreadCount: number) => void
): (() => void) => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);

    const unsubscribe = onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        if (isAdmin) {
          // For admin, unreadCount field tracks user messages
          callback(data.unreadCount || 0);
        } else {
          // For users, we need to count unread admin messages
          // This requires querying the messages subcollection
          const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
          const unreadQuery = query(
            messagesRef,
            where('sender', '==', 'admin'),
            where('isRead', '==', false)
          );

          getDocs(unreadQuery).then((msgSnapshot) => {
            callback(msgSnapshot.size);
          }).catch((error) => {
            console.error('Error counting unread admin messages:', error);
            callback(0);
          });
        }
      } else {
        callback(0);
      }
    }, (error) => {
      console.error('Error in conversation unread count listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversation unread count listener:', error);
    return () => { };
  }
};

// Real-time listener for user's unread admin messages across all conversations
export const subscribeToUserUnreadAdminMessages = (
  callback: (counts: { contact: number; bug: number; feedback: number; total: number }) => void
): (() => void) => {
  try {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

      // Get unread admin messages for each conversation
      const countPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const type = data.type as 'contact' | 'bug' | 'feedback';

        const messagesRef = collection(db, 'helpSupport', doc.id, 'messages');
        const unreadQuery = query(
          messagesRef,
          where('sender', '==', 'admin'),
          where('isRead', '==', false)
        );

        try {
          const msgSnapshot = await getDocs(unreadQuery);
          const unreadCount = msgSnapshot.size;

          counts[type] += unreadCount;
          counts.total += unreadCount;
        } catch (error) {
          console.error(`Error counting unread messages for conversation ${doc.id}:`, error);
        }
      });

      await Promise.all(countPromises);
      callback(counts);
    }, (error) => {
      console.error('Error in user unread admin messages listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up user unread admin messages listener:', error);
    return () => { };
  }
};

// Real-time listener for messages in a conversation
export const subscribeToConversationMessages = (
  conversationId: string,
  callback: (messages: SupportMessage[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        conversationId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as SupportMessage[];

      callback(messages);
    }, (error) => {
      console.error('Error in conversation messages listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversation messages listener:', error);
    return () => { };
  }
};

// Track admin presence in chat rooms
export const updateAdminPresence = async (conversationId: string, isPresent: boolean): Promise<void> => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, {
      adminPresent: isPresent,
      adminLastSeen: new Date(),
    });
  } catch (error) {
    console.error('Error updating admin presence:', error);
  }
};

// Check if admin is currently present in chat room
export const checkAdminPresence = async (conversationId: string): Promise<boolean> => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      const adminPresent = data.adminPresent || false;
      const adminLastSeen = data.adminLastSeen?.toDate();

      // Consider admin present if they were active in the last 5 minutes
      if (adminLastSeen) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return adminPresent && adminLastSeen > fiveMinutesAgo;
      }

      return adminPresent;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin presence:', error);
    return false;
  }
};

// Send an automatic system message
export const sendSystemMessage = async (
  conversationId: string,
  text: string
): Promise<void> => {
  try {
    const now = new Date();

    // Add message to subcollection with system sender
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    await addDoc(messagesRef, {
      text,
      sender: 'system',
      senderEmail: 'system@notionclone.com',
      senderName: 'System',
      timestamp: now,
      isRead: true, // System messages are considered read
    });

    // Update conversation with last message but don't increment unread count for system messages
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageAt: now,
    });
  } catch (error) {
    console.error('Error sending system message:', error);
    throw error;
  }
};

// Typing indicator functions
export const setTypingStatus = async (
  conversationId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data();
      let typingUsers: string[] = conversationData.typing || [];

      if (isTyping) {
        if (!typingUsers.includes(user.email)) {
          typingUsers.push(user.email);
        }
      } else {
        typingUsers = typingUsers.filter((email) => email !== user.email);
      }

      await updateDoc(conversationRef, { typing: typingUsers });
    }
  } catch (error) {
    console.error('Error setting typing status:', error);
  }
};

export const subscribeToTypingStatus = (
  conversationId: string,
  callback: (typingEmails: string[]) => void
): (() => void) => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);

    const unsubscribe = onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.typing || []);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to typing status:', error);
    return () => { };
  }
};

// Get messages for a specific conversation with pagination
export const getSupportMessagesPaginated = async (
  conversationId: string,
  limitCount: number,
  startAfterDoc: DocumentSnapshot | null = null
): Promise<{ messages: SupportMessage[]; lastVisible: DocumentSnapshot | null }> => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    let q;

    if (startAfterDoc) {
      q = query(messagesRef, orderBy('timestamp', 'desc'), startAfter(startAfterDoc), limit(limitCount));
    } else {
      q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    }

    const snapshot = await getDocs(q);

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      conversationId,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as SupportMessage[];

    return {
      messages,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Error fetching paginated support messages:', error);
    throw error;
  }
};

// Real-time listener for NEW messages in a conversation
export const subscribeToNewConversationMessages = (
  conversationId: string,
  latestMessageTimestamp: Date | null,
  callback: (messages: SupportMessage[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    let q;

    if (latestMessageTimestamp) {
      q = query(messagesRef, where('timestamp', '>', latestMessageTimestamp), orderBy('timestamp', 'asc'));
    } else {
      // If no messages exist, this will listen for the very first one.
      q = query(messagesRef, orderBy('timestamp', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        conversationId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as SupportMessage[];

      callback(newMessages);
    }, (error) => {
      console.error('Error in new conversation messages listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up new conversation messages listener:', error);
    return () => { };
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (
  file: File,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `files/${userId}/${fileName}`);

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
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.({ progress: 100, downloadUrl });
            resolve(downloadUrl);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error starting file upload:', error);
    throw error;
  }
};

// Delete file from Firebase Storage
export const deleteFile = async (downloadUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, downloadUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get file info from URL
export const getFileInfoFromUrl = (url: string): { name: string; extension: string } => {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const decodedFileName = decodeURIComponent(fileName.split('?')[0]);
    const nameParts = decodedFileName.split('_');
    const originalName = nameParts.slice(1).join('_'); // Remove timestamp prefix
    const extension = originalName.split('.').pop() || '';

    return {
      name: originalName,
      extension: extension.toLowerCase()
    };
  } catch (error) {
    console.error('Error parsing file URL:', error);
    return { name: 'Unknown file', extension: '' };
  }
};

// Check if file type is supported
export const isSupportedFileType = (file: File): boolean => {
  const supportedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Images (if not using ImageBlock)
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Code files
    'text/javascript',
    'text/css',
    'text/html',
    'application/json',
    'text/xml',
  ];

  return supportedTypes.includes(file.type) || file.size <= 10 * 1024 * 1024; // 10MB limit
};

// Update note recently opened date
export const updateNoteRecentlyOpen = async (pageId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);

    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    await updateDoc(noteRef, {
      recentlyOpenDate: new Date(),
    });
  } catch (error) {
    console.error('Error updating note recently open date:', error);
    throw error;
  }
};

// Note-level comment management functions

// Add a comment to a note
export const addNoteComment = async (noteId: string, text: string, parentCommentId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data();

    // Check if user can comment (either owner or note is public)
    if (noteData.userId !== userId && !noteData.isPublic) {
      throw new Error('Unauthorized to comment on this note');
    }

    const newComment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      author: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorEmail: user.email || '',
      timestamp: new Date(),
    };

    const currentComments = noteData.comments || [];
    let updatedComments;

    if (parentCommentId) {
      // Adding a reply to an existing comment
      updatedComments = currentComments.map((comment: unknown) => {
        const c = comment as { id: string; comments?: Array<unknown> };
        if (c.id === parentCommentId) {
          const replies = c.comments || [];
          return {
            ...c,
            comments: [...replies, newComment]
          };
        }
        return c;
      });
    } else {
      // Adding a main comment
      const mainComment = {
        ...newComment,
        comments: [] // Initialize empty replies array
      };
      updatedComments = [...currentComments, mainComment];
    }

    await updateDoc(noteRef, {
      comments: updatedComments,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding note comment:', error);
    throw error;
  }
};

// Add a reply to a specific comment
export const addCommentReply = async (noteId: string, parentCommentId: string, text: string): Promise<void> => {
  return addNoteComment(noteId, text, parentCommentId);
};

export const deleteNoteAllComments = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data();

    if (noteData.userId !== userId) {
      throw new Error('Unauthorized to delete comments on this note');
    }

    await updateDoc(noteRef, {
      comments: [],
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting note all comments:', error);
    throw error;
  }
};

// Delete a comment from a note
export const deleteNoteComment = async (noteId: string, commentId: string, parentCommentId?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data();
    const currentComments = noteData.comments || [];

    let updatedComments;
    let commentToDelete;

    if (parentCommentId) {
      // Deleting a reply
      updatedComments = currentComments.map((comment: unknown) => {
        const c = comment as { id: string; comments?: Array<unknown> };
        if (c.id === parentCommentId) {
          const replies = c.comments || [];
          commentToDelete = replies.find((reply: unknown) => {
            const r = reply as { id: string; authorEmail: string };
            return r.id === commentId;
          });

          const updatedReplies = replies.filter((reply: unknown) => {
            const r = reply as { id: string };
            return r.id !== commentId;
          });

          return {
            ...c,
            comments: updatedReplies
          };
        }
        return c;
      });
    } else {
      // Deleting a main comment
      commentToDelete = currentComments.find((comment: unknown) => {
        const c = comment as { id: string; authorEmail: string };
        return c.id === commentId;
      });

      updatedComments = currentComments.filter((comment: unknown) => {
        const c = comment as { id: string };
        return c.id !== commentId;
      });
    }

    if (!commentToDelete) {
      throw new Error('Comment not found');
    }

    // Check if user can delete (either note owner or comment author)
    const typedComment = commentToDelete as { id: string; authorEmail: string };
    if (noteData.userId !== userId && typedComment.authorEmail !== user.email) {
      throw new Error('Unauthorized to delete this comment');
    }

    await updateDoc(noteRef, {
      comments: updatedComments,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting note comment:', error);
    throw error;
  }
};

// Sub-note level comment management functions

export const addSubNoteComment = async (
  parentId: string,
  subNoteId: string,
  text: string,
  parentCommentId?: string
): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const subNoteRef = doc(db, 'notes', parentId, 'subNotes', subNoteId);
    const subNoteSnap = await getDoc(subNoteRef);

    if (!subNoteSnap.exists()) {
      throw new Error('Sub-note not found');
    }

    const subNoteData = subNoteSnap.data();

    // Only owner can comment on sub-note for now
    if (subNoteData.userId !== userId) {
      throw new Error('Unauthorized to comment on this sub-note');
    }

    const newComment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      author: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorEmail: user.email || '',
      timestamp: new Date(),
    };

    const currentComments = subNoteData.comments || [];
    let updatedComments;

    if (parentCommentId) {
      // Reply to existing comment
      updatedComments = currentComments.map((comment: unknown) => {
        const c = comment as { id: string; comments?: Array<unknown> };
        if (c.id === parentCommentId) {
          const replies = c.comments || [];
          return {
            ...c,
            comments: [...replies, newComment]
          };
        }
        return c;
      });
    } else {
      // Main comment
      const mainComment = {
        ...newComment,
        comments: [] as Array<unknown>
      };
      updatedComments = [...currentComments, mainComment];
    }

    await updateDoc(subNoteRef, {
      comments: updatedComments,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding sub-note comment:', error);
    throw error;
  }
};

export const getSubNoteComments = async (
  parentId: string,
  subNoteId: string
): Promise<Array<{
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Timestamp;
  }>;
}>> => {
  try {
    const subNoteRef = doc(db, 'notes', parentId, 'subNotes', subNoteId);
    const subNoteSnap = await getDoc(subNoteRef);

    if (!subNoteSnap.exists()) {
      throw new Error('Sub-note not found');
    }

    const data = subNoteSnap.data();
    const comments = data.comments || [];

  const toJsDate = (value: unknown): Date => {
    type WithToDate = { toDate?: () => Date };
    const v = value as WithToDate | Date | string | number | undefined | null;
    if (!v) return new Date(0);
    if (v instanceof Date) return v;
    if (typeof (v as WithToDate).toDate === 'function') return (v as WithToDate).toDate!();
    const d = new Date(v as string | number);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  return comments
      .map((comment: unknown) => {
        const c = comment as {
          id: string;
          text: string;
          author: string;
          authorEmail: string;
          timestamp: Date;
          comments?: Array<{
            id: string;
            text: string;
            author: string;
            authorEmail: string;
            timestamp: Date;
          }>;
        };

        const processedComment = {
          ...c,
          timestamp: toJsDate(c.timestamp),
          comments: c.comments ? c.comments.map((reply: unknown) => {
            const r = reply as {
              id: string;
              text: string;
              author: string;
              authorEmail: string;
              timestamp: Date;
            };
            return {
              ...r,
              timestamp: toJsDate(r.timestamp),
            };
          }).sort((a: { timestamp: Date }, b: { timestamp: Date }) => a.timestamp.getTime() - b.timestamp.getTime()) : []
        };

        return processedComment;
      })
      .sort((a: { timestamp: Date }, b: { timestamp: Date }) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    // console.error('Error getting sub-note comments:', error);
    toast.error('Error getting sub-note comments');
    throw error;
  }
};

export const deleteSubNoteComment = async (
  parentId: string,
  subNoteId: string,
  commentId: string,
  parentCommentId?: string
): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const subNoteRef = doc(db, 'notes', parentId, 'subNotes', subNoteId);
    const subNoteSnap = await getDoc(subNoteRef);
    if (!subNoteSnap.exists()) {
      throw new Error('Sub-note not found');
    }

    const data = subNoteSnap.data();
    const currentComments = data.comments || [];

    let updatedComments;
    let commentToDelete;

    if (parentCommentId) {
      updatedComments = currentComments.map((comment: unknown) => {
        const c = comment as { id: string; comments?: Array<unknown> };
        if (c.id === parentCommentId) {
          const replies = c.comments || [];
          commentToDelete = replies.find((reply: unknown) => {
            const r = reply as { id: string; authorEmail: string };
            return r.id === commentId;
          });
          const updatedReplies = replies.filter((reply: unknown) => {
            const r = reply as { id: string };
            return r.id !== commentId;
          });
          return { ...c, comments: updatedReplies };
        }
        return c;
      });
    } else {
      commentToDelete = currentComments.find((comment: unknown) => {
        const c = comment as { id: string; authorEmail: string };
        return c.id === commentId;
      });
      updatedComments = currentComments.filter((comment: unknown) => {
        const c = comment as { id: string };
        return c.id !== commentId;
      });
    }

    if (!commentToDelete) {
      throw new Error('Comment not found');
    }

    const typedComment = commentToDelete as { id: string; authorEmail: string };
    if (data.userId !== userId && typedComment.authorEmail !== user.email) {
      throw new Error('Unauthorized to delete this comment');
    }

    await updateDoc(subNoteRef, {
      comments: updatedComments,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting sub-note comment:', error);
    throw error;
  }
};

export const deleteSubNoteAllComments = async (parentId: string, subNoteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const subNoteRef = doc(db, 'notes', parentId, 'subNotes', subNoteId);
    const subNoteSnap = await getDoc(subNoteRef);
    if (!subNoteSnap.exists()) {
      throw new Error('Sub-note not found');
    }
    const data = subNoteSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized to delete comments');
    }
    await updateDoc(subNoteRef, { comments: [], updatedAt: new Date() });
  } catch (error) {
    console.error('Error deleting sub-note all comments:', error);
    throw error;
  }
};

// Get note comments with nested structure
export const getNoteComments = async (noteId: string): Promise<Array<{
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
  }>;
}>> => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
      throw new Error('Note not found');
    }

    const noteData = noteSnap.data();
    const comments = noteData.comments || [];

    // Convert timestamps and sort by newest first
    return comments
      .map((comment: unknown) => {
        const c = comment as {
          id: string;
          text: string;
          author: string;
          authorEmail: string;
          timestamp: Date;
          comments?: Array<{
            id: string;
            text: string;
            author: string;
            authorEmail: string;
            timestamp: Date;
          }>;
        };

        const processedComment = {
          ...c,
          timestamp: c.timestamp instanceof Date ? c.timestamp : new Date(c.timestamp),
          comments: c.comments ? c.comments.map((reply: unknown) => {
            const r = reply as {
              id: string;
              text: string;
              author: string;
              authorEmail: string;
              timestamp: Date;
            };
            return {
              ...r,
              timestamp: r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp),
            };
          }).sort((a: { timestamp: Date }, b: { timestamp: Date }) => a.timestamp.getTime() - b.timestamp.getTime()) : []
        };

        return processedComment;
      })
      .sort((a: { timestamp: Date }, b: { timestamp: Date }) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error getting note comments:', error);
    throw error;
  }
};

// User Management

export interface User {
  email: string;
  isBeginner: boolean;
  registeredDate: Date;
}

// Create or get user document
export const createOrGetUser = async (): Promise<User | null> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return null;

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        email: data.email,
        isBeginner: data.isBeginner,
        registeredDate: data.registeredDate?.toDate() || new Date(),
      } as User;
    }

    // Create new user document
    const now = new Date();
    const newUser: User = {
      email: user.email,
      isBeginner: true,
      registeredDate: now,
    };

    await setDoc(userRef, {
      email: user.email,
      isBeginner: true,
      registeredDate: now,
    });

    return newUser;
  } catch (error) {
    console.error('Error creating or getting user:', error);
    throw error;
  }
};

// Update user's beginner status
export const updateUserBeginnerStatus = async (isBeginner: boolean): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      isBeginner,
    });
  } catch (error) {
    console.error('Error updating user beginner status:', error);
    throw error;
  }
};

// Get user's beginner status
export const getUserBeginnerStatus = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return true; // Default to beginner if not authenticated

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.isBeginner !== undefined ? data.isBeginner : true;
    }

    return true; // Default to beginner if no document exists
  } catch (error) {
    console.error('Error getting user beginner status:', error);
    return true; // Default to beginner on error
  }
};

// User Profile Management

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  github?: string;
  website?: string;
  location?: string;
  skills?: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: Date;
  updatedAt: Date;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

// Get or create user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        id: profileSnap.id,
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Create or update user profile
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const profileRef = doc(db, 'userProfiles', userId);
    const now = new Date();

    // Get current profile to preserve counts
    const currentProfile = await getUserProfile(userId);

    const updateData = {
      userId,
      email: user.email || '',
      displayName: profileData.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous',
      bio: profileData.bio || '',
      avatar: profileData.avatar || user.photoURL || '',
      github: profileData.github || '',
      website: profileData.website || '',
      location: profileData.location || '',
      skills: profileData.skills || [],
      followersCount: currentProfile?.followersCount || 0,
      followingCount: currentProfile?.followingCount || 0,
      postsCount: currentProfile?.postsCount || 0,
      joinedAt: currentProfile?.joinedAt || now,
      updatedAt: now,
    };

    await setDoc(profileRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Follow a user
export const followUser = async (targetUserId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    if (userId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const followsRef = collection(db, 'follows');
    const existingQuery = query(
      followsRef,
      where('followerId', '==', userId),
      where('followingId', '==', targetUserId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error('Already following this user');
    }

    // Create follow relationship
    await addDoc(followsRef, {
      followerId: userId,
      followingId: targetUserId,
      createdAt: new Date(),
    });

    // Update follower count for target user
    const targetProfileRef = doc(db, 'userProfiles', targetUserId);
    const targetProfile = await getDoc(targetProfileRef);
    if (targetProfile.exists()) {
      const currentCount = targetProfile.data().followersCount || 0;
      await updateDoc(targetProfileRef, {
        followersCount: currentCount + 1,
      });
    }

    // Update following count for current user
    const currentProfileRef = doc(db, 'userProfiles', userId);
    const currentProfile = await getDoc(currentProfileRef);
    if (currentProfile.exists()) {
      const currentCount = currentProfile.data().followingCount || 0;
      await updateDoc(currentProfileRef, {
        followingCount: currentCount + 1,
      });
    }
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (targetUserId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followerId', '==', userId),
      where('followingId', '==', targetUserId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Not following this user');
    }

    // Remove follow relationship
    await deleteDoc(snapshot.docs[0].ref);

    // Update follower count for target user
    const targetProfileRef = doc(db, 'userProfiles', targetUserId);
    const targetProfile = await getDoc(targetProfileRef);
    if (targetProfile.exists()) {
      const currentCount = targetProfile.data().followersCount || 0;
      await updateDoc(targetProfileRef, {
        followersCount: Math.max(0, currentCount - 1),
      });
    }

    // Update following count for current user
    const currentProfileRef = doc(db, 'userProfiles', userId);
    const currentProfile = await getDoc(currentProfileRef);
    if (currentProfile.exists()) {
      const currentCount = currentProfile.data().followingCount || 0;
      await updateDoc(currentProfileRef, {
        followingCount: Math.max(0, currentCount - 1),
      });
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Check if current user is following another user
export const isFollowingUser = async (targetUserId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();

    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followerId', '==', userId),
      where('followingId', '==', targetUserId)
    );
    const snapshot = await getDocs(q);

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Get user's public posts
export const getUserPublicPosts = async (userId: string, limitCount: number = 12): Promise<PublicNote[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('userId', '==', userId),
      where('isPublic', '==', true),
      where('isTrashed', '==', false),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Create preview from content
      const preview = (data.content || '').substring(0, 150);

      return {
        id: doc.id,
        title: data.title || 'Untitled',
        authorId: data.userId,
        authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        preview: preview + (preview.length >= 150 ? '...' : ''),
      };
    }) as PublicNote[];
  } catch (error) {
    console.error('Error fetching user public posts:', error);
    throw error;
  }
};

// Update posts count for user
export const updateUserPostsCount = async (userId: string): Promise<void> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('userId', '==', userId),
      where('isPublic', '==', true),
      where('isTrashed', '==', false)
    );
    const snapshot = await getDocs(q);

    const profileRef = doc(db, 'userProfiles', userId);
    await updateDoc(profileRef, {
      postsCount: snapshot.size,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user posts count:', error);
    // Don't throw error as this is optional
  }
};

// Get followers list
export const getUserFollowers = async (userId: string): Promise<UserProfile[]> => {
  try {
    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followingId', '==', userId)
    );
    const snapshot = await getDocs(q);

    const followerIds = snapshot.docs.map(doc => doc.data().followerId);

    // Get profiles for all followers
    const followers: UserProfile[] = [];
    for (const followerId of followerIds) {
      const profile = await getUserProfile(followerId);
      if (profile) {
        followers.push(profile);
      }
    }

    return followers;
  } catch (error) {
    console.error('Error fetching user followers:', error);
    throw error;
  }
};

// Get following list
export const getUserFollowing = async (userId: string): Promise<UserProfile[]> => {
  try {
    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followerId', '==', userId)
    );
    const snapshot = await getDocs(q);

    const followingIds = snapshot.docs.map(doc => doc.data().followingId);

    // Get profiles for all following
    const following: UserProfile[] = [];
    for (const followingId of followingIds) {
      const profile = await getUserProfile(followingId);
      if (profile) {
        following.push(profile);
      }
    }

    return following;
  } catch (error) {
    console.error('Error fetching user following:', error);
    throw error;
  }
};

// Search users by display name or email
export const searchUsers = async (searchTerm: string, limit: number = 10): Promise<UserProfile[]> => {
  try {
    const profilesRef = collection(db, 'userProfiles');
    const q = query(profilesRef, orderBy('displayName', 'asc'));
    const snapshot = await getDocs(q);

    // Client-side filtering since Firestore doesn't support full-text search
    const results = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }) as UserProfile)
      .filter(profile =>
        profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.bio && profile.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Real-time listener for user's favorite notes
export const subscribeToFavorites = (
  callback: (favorites: FavoriteNote[]) => void
): (() => void) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return () => { };
    }
    const userId = user.uid;

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favorites = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          addedAt: doc.data().addedAt?.toDate() || new Date(),
        })) as FavoriteNote[];
      callback(favorites);
    }, (error) => {
      console.error('Error in favorites listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up favorites listener:', error);
    return () => { };
  }
};