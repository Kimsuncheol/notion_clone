import { firebaseApp } from '@/constants/firebase';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { CustomUserProfile } from '@/types/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Create or get an existing user profile
export const createOrGetUser = async (): Promise<CustomUserProfile> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    // If user profile exists, return it
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        id: userSnap.id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        phoneNumber: user.phoneNumber,
        providerId: user.providerId,
        bio: userData.bio || '',
        github: userData.github || '',
        website: userData.website || '',
        location: userData.location || '',
        skills: userData.skills || [],
        likedNotes: userData.likedNotes || [],
        recentlyReadNotes: userData.recentlyReadNotes || [],
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0,
        postsCount: userData.postsCount || 0,
        joinedAt: userData.joinedAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || null,
        providerData: user.providerData,
        refreshToken: user.refreshToken,
        tenantId: user.tenantId,
        delete: user.delete,
        getIdToken: user.getIdToken,
        getIdTokenResult: user.getIdTokenResult,
        reload: user.reload,
        toJSON: user.toJSON,
        metadata: user.metadata
      } as CustomUserProfile;
    }

    // If user profile doesn't exist, create a new one
    const now = new Date();
    const newUserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified || false,
      isAnonymous: user.isAnonymous || false,
      phoneNumber: user.phoneNumber || null,
      bio: '',
      github: '',
      website: '',
      location: '',
      skills: [],
      likedNotes: [],
      recentlyReadNotes: [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      joinedAt: now,
      updatedAt: now,
    };

    // Save the new user profile to Firestore
    await setDoc(userRef, newUserProfile);

    // Return the complete user profile
    return {
      id: userId,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
      bio: '',
      github: '',
      website: '',
      location: '',
      skills: [],
      likedNotes: [],
      recentlyReadNotes: [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      joinedAt: now,
      updatedAt: now,
      providerData: user.providerData,
      refreshToken: user.refreshToken,
      tenantId: user.tenantId,
      delete: user.delete,
      getIdToken: user.getIdToken,
      getIdTokenResult: user.getIdTokenResult,
      reload: user.reload,
      toJSON: user.toJSON,
      metadata: user.metadata
    } as CustomUserProfile;

  } catch (error) {
    console.error('Error creating or getting user:', error);
    throw error;
  }
};