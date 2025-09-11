import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getCurrentUserId } from '../common/firebase';
import { CustomUserProfile, EmailNotification, Appearance } from '@/types/firebase';

const db = getFirestore(firebaseApp);

// fetchUserSettings - collection: 'users', field: 'email', 'github', 'emailNotification', 'appearance', 'myNotesTitle'
export const fetchUserSettings = async (): Promise<Partial<CustomUserProfile> | null> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    return {
      email: data.email,
      github: data.github,
      emailNotification: data.emailNotification,
      appearance: data.appearance,
      myNotesTitle: data.myNotesTitle
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
    await updateDoc(userRef, {
      github,
      updatedAt: new Date()
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
      emailNotification,
      updatedAt: new Date()
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
      appearance,
      updatedAt: new Date()
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
      myNotesTitle,
      updatedAt: new Date()
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
    await updateDoc(userRef, {
      shortBio,
      displayName,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user introduction:', error);
    throw error;
  }
};