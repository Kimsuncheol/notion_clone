import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { CustomUserProfile } from '@/types/firebase';
import { getCurrentUserId } from '../common/firebase';
import toast from 'react-hot-toast';

const db = getFirestore(firebaseApp);

// Fetch user introduction
export const fetchUserIntroduction = async (userId?: string): Promise<string> => {
  try {
    const targetUserId = userId || getCurrentUserId();
    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as CustomUserProfile;
      return (userData.introduction as string) || '';
    }
    
    return '';
  } catch (error) {
    console.error('Error fetching user introduction:', error);
    throw error;
  }
};

// Add or update user introduction
export const updateUserIntroduction = async (introduction: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      introduction: introduction,
      updatedAt: new Date()
    });
    toast.success('Introduction updated');
  } catch (error) {
    console.error('Error updating user introduction:', error);
    toast.error('Failed to update introduction');
    throw error;
  }
};