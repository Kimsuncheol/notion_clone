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


