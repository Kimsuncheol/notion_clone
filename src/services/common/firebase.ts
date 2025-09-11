import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, onSnapshot, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { PublicNote, FileUploadProgress } from '@/types/firebase';
export type { PublicNote } from '@/types/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// const globalNoteRef = collection(db, 'notes');

// Get current user ID
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
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
      tags: [],
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

// Fetch public notes for dashboard
export const fetchPublicNotes = async (limitCount: number = 5): Promise<PublicNote[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = limitCount > 0
      ? query(
        notesRef,
        where('isPublic', '==', true),
        where('isPublished', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )
      : query(
        notesRef,
        where('isPublic', '==', true),
        where('isPublished', '==', true),
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
        tags: data.tags || [],
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

