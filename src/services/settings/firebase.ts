import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, getDoc, updateDoc, collection, where, query, getDocs } from 'firebase/firestore';
import { getCurrentUserId } from '../common/firebase';
import { EmailNotification, Appearance } from '@/types/firebase';
import toast from 'react-hot-toast';

const db = getFirestore(firebaseApp);

// fetchUserSettings - collection: 'users', field: 'email', 'github', 'emailNotification', 'appearance', 'myNotesTitle'
export const fetchUserSettings = async (): Promise<{
  email?: string;
  github?: string;
  myNotesTitle?: string;
  emailNotification?: EmailNotification;
  appearance?: Appearance;
  shortBio?: string;
  displayName?: string;
} | null> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    // return field 'userSettings' of 'users' collection
    return {
      email: data.email,
      github: data.userSettings.github,
      myNotesTitle: data.userSettings.myNotesTitle,
      emailNotification: data.userSettings.emailNotification,
      appearance: data.userSettings.appearance,
      shortBio: data.userSettings.shortBio,
      displayName: data.userSettings.displayName,
    };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

// updateUserGithub
export const updateUserGithub = async (github: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    // update 'gihub' key of field 'userSettings' of 'users' collection
    await updateDoc(userRef, {
      userSettings: {
        // update key 'github' of field 'userSettings' of 'users' collection
        // keep other keys of 'userSettings'
        ...(await getDoc(userRef)).data()?.userSettings,
        github,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user github:', error);
    throw error;
  }
};

// updateUserEmailNotification
export const updateUserEmailNotification = async (emailNotification: EmailNotification): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      userSettings: {
        // update key 'emailNotification' of field 'userSettings' of 'users' collection
        // keep other keys of 'userSettings'
        ...(await getDoc(userRef)).data()?.userSettings,
        emailNotification,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user email notification:', error);
    throw error;
  }
};

// updateUserAppearance
export const updateUserAppearance = async (appearance: Appearance): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      userSettings: {
        // update key 'appearance' of field 'userSettings' of 'users' collection
        // keep other keys of 'userSettings'
        ...(await getDoc(userRef)).data()?.userSettings,
        appearance,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user appearance:', error);
    throw error;
  }
};

// updateUserMyNotesTitle
export const updateUserMyNotesTitle = async (myNotesTitle: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      userSettings: {
        // update key 'myNotesTitle' of field 'userSettings' of 'users' collection
        // keep other keys of 'userSettings'
        ...(await getDoc(userRef)).data()?.userSettings,
        myNotesTitle,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user my notes title:', error);
    throw error;
  }
};

export const updateUserShortBioAndDisplayName = async (shortBio: string, displayName: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    const notesRef = collection(db, 'notes');
    const tagsRef = collection(db, 'tags');
    const q = query(notesRef, where('likeUsers', 'array-contains', { id: userId, displayName }));
    const tagsQ = query(tagsRef, where('notes', 'array-contains', { id: userId, displayName }));
    const snapshot = await getDocs(q);
    const tagsSnapshot = await getDocs(tagsQ);

    await updateDoc(userRef, {
      userSettings: {
        // update key 'shortBio' and 'displayName' of field 'userSettings' of 'users' collection
        // keep other keys of 'userSettings'
        ...(await getDoc(userRef)).data()?.userSettings,
        shortBio,
        displayName,
        updatedAt: new Date()
      }
    });

    // The 'likeUser' field(LikeUser[] type) of documents in 'notes' collection
    snapshot.docs.forEach(doc => {
      updateDoc(doc.ref, { likeUsers: [{ id: userId, displayName }] });
    });

    // The 'likeUser' field(LikeUser[] type) of every document in the 'notes' field of every document in the 'tags' collection.
    tagsSnapshot.docs.forEach(doc => {
      updateDoc(doc.ref, { notes: [{ id: userId, displayName }] });
    });

    toast.success('Short bio and display name updated');
  } catch (error) {
    console.error('Error updating user short bio and display name:', error);
    toast.error('Failed to update short bio and display name');
    throw error;
  }
};