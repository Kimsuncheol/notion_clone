import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  serverTimestamp,
  getFirestore 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { DraftedNote } from '@/types/firebase';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const collectionName = 'notes';

// Get all saved notes for the current user
export const getDraftedNotes = async (): Promise<DraftedNote[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const draftedNotesRef = collection(db, collectionName);
    const q = query(
      draftedNotesRef,
      where('userId', '==', user.uid),
      where('isPublished', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const draftedNotes: DraftedNote[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      draftedNotes.push({
        id: doc.id,
        title: data.title || '',
        content: data.content || '',
        userId: data.userId || '',
        authorEmail: data.authorEmail || '',
        authorName: data.authorName || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || null,
        tags: data.tags || [],
      });
    });

    return draftedNotes;
  } catch (error) {
    console.error('Error fetching saved notes:', error);
    throw error;
  }
};

// Save a new note
export const saveDraftedNote = async (title: string, content: string, tags?: string[]): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const draftedNotesRef = collection(db, collectionName);
    const newDraftedData = {
      title,
      content,
      userId: user.uid,
      savedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: tags || [],
    };

    const docRef = await addDoc(draftedNotesRef, newDraftedData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

// Update a saved note
export const updateDraftedNote = async (id: string, title: string, content: string, tags?: string[]): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const draftedNoteRef = doc(db, collectionName, id);
    await updateDoc(draftedNoteRef, {
      title,
      content,
      tags: tags || [],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating saved note:', error);
    throw error;
  }
};

// Delete a saved note
export const deleteDraftedNote = async (id: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const draftedNoteRef = doc(db, collectionName, id);
    await deleteDoc(draftedNoteRef);
  } catch (error) {
    console.error('Error deleting saved note:', error);
    throw error;
  }
};
