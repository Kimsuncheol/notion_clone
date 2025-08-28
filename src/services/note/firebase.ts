import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore';

const db = getFirestore(firebaseApp);


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