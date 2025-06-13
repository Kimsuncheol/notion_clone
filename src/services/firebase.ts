import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Block } from '@/types/blocks';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export interface FirebaseFolder {
  id: string;
  name: string;
  isOpen: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebasePage {
  id: string;
  name: string;
  folderId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseNoteContent {
  id: string;
  pageId: string;
  title: string;
  blocks: Block[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

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

// Fetch note content for a specific page
export const fetchNoteContent = async (pageId: string): Promise<FirebaseNoteContent | null> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      const data = noteSnap.data();
      // Verify the note belongs to the current user
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to note');
      }
      
      return {
        id: noteSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FirebaseNoteContent;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching note content:', error);
    throw error;
  }
};

// Update note content
export const updateNoteContent = async (pageId: string, title: string, blocks: Block[]): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);
    const now = new Date();
    
    await setDoc(noteRef, {
      pageId,
      title,
      blocks,
      userId,
      updatedAt: now,
      createdAt: now, // Will only be set on first creation
    }, { merge: true });
  } catch (error) {
    console.error('Error updating note content:', error);
    throw error;
  }
};

// Add a new page
export const addNotePage = async (folderId: string, name: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();
    
    // Create the page document
    const pageRef = await addDoc(collection(db, 'pages'), {
      name,
      folderId,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create initial empty note content for the page
    await setDoc(doc(db, 'notes', pageRef.id), {
      pageId: pageRef.id,
      title: name,
      blocks: [],
      userId,
      createdAt: now,
      updatedAt: now,
    });
    
    return pageRef.id;
  } catch (error) {
    console.error('Error adding note page:', error);
    throw error;
  }
};

// Add a new folder
export const addFolder = async (name: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();
    
    const folderRef = await addDoc(collection(db, 'folders'), {
      name,
      isOpen: true,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    
    return folderRef.id;
  } catch (error) {
    console.error('Error adding folder:', error);
    throw error;
  }
};

// Update page name
export const updatePageName = async (pageId: string, name: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const pageRef = doc(db, 'pages', pageId);
    
    // Verify ownership before updating
    const pageSnap = await getDoc(pageRef);
    if (!pageSnap.exists() || pageSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to page');
    }
    
    await updateDoc(pageRef, {
      name,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating page name:', error);
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