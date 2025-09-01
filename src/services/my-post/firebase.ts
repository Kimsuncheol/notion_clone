import { collection, query, where, orderBy, getDocs, getFirestore } from 'firebase/firestore';
import { MyPost, TagType, CustomUserProfile } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';
import { IdTokenResult } from 'firebase/auth';

const db = getFirestore(firebaseApp);

// Utility function to convert Firestore timestamp to Date
function convertTimestamp(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  return new Date();
}

export async function fetchUserPosts(userId: string, tagName: string = 'All'): Promise<MyPost[]> {
  try {
    const postsRef = collection(db, 'notes');
    // Simplified query to avoid composite index requirement

    const constraint = [
      where('authorEmail', '==', userId),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    ]

    if (tagName !== 'All') {
      constraint.push(where('tags', 'array-contains', tagName));
    }

    const q = query(
      postsRef,
      ...constraint
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      // Client-side filtering to avoid composite index requirement
      .filter(doc => {
        const data = doc.data();
        return (data.isTrashed === false);
        // return (data.isPublic === true) && (data.isTrashed === false);
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title || '',
          thumbnail: data.thumbnail || '',
          content: data.content || '',
          createdAt: convertTimestamp(data.createdAt),
          authorEmail: data.authorEmail || '',
          authorName: data.authorName || '',
          isTrashed: data.isTrashed || false,
          trashedAt: convertTimestamp(data.trashedAt),
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
          comments: data.comments || [],
          subNotes: (data.subNotes || []).map((subNote: Record<string, unknown>) => ({
            id: (subNote.id as string) || '',
            title: (subNote.title as string) || '',
            content: (subNote.content as string) || '',
            createdAt: convertTimestamp(subNote.createdAt),
            updatedAt: convertTimestamp(subNote.updatedAt),
          })),
        } as MyPost;
      });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}

export async function fetchUserTags(userEmail: string): Promise<TagType[]> {
  const userRef = collection(db, 'users');
  const q = query(userRef, where('email', '==', userEmail));
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const rawTags = userData?.tags || [];
    
    // Convert Firestore data to plain objects
    return rawTags.map((tag: Record<string, unknown>): TagType => ({
      id: (tag.id as string) || '',
      name: (tag.name as string) || '',
      createdAt: convertTimestamp(tag.createdAt),
      updatedAt: convertTimestamp(tag.updatedAt),
    }));
  } catch (error) {
    console.error('Error fetching user tags:', error);
    return [];
  }
}

export async function fetchUserProfile(userEmail: string): Promise<CustomUserProfile | null> {
  const userRef = collection(db, 'users');
  const q = query(userRef, where('email', '==', userEmail));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();
  
  return {
    id: userDoc.id,
    userId: userData.userId || '',
    email: userData.email || '',
    displayName: userData.displayName || '',
    bio: userData.bio,
    github: userData.github,
    website: userData.website,
    location: userData.location,
    skills: userData.skills || [],
    followersCount: userData.followersCount || 0,
    followingCount: userData.followingCount || 0,
    postsCount: userData.postsCount || 0,
    joinedAt: convertTimestamp(userData.joinedAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    uid: userData.uid || '',
    emailVerified: userData.emailVerified || false,
    isAnonymous: userData.isAnonymous || false,
    metadata: userData.metadata || { creationTime: null, lastSignInTime: null },
    providerData: userData.providerData || [],
    refreshToken: userData.refreshToken || '',
    tenantId: userData.tenantId || null,
    delete: userData.delete || (() => Promise.resolve()),
    getIdToken: userData.getIdToken || (() => Promise.resolve('')),
    getIdTokenResult: userData.getIdTokenResult || (() => Promise.resolve({} as IdTokenResult)),
    reload: userData.reload || (() => Promise.resolve()),
    toJSON: userData.toJSON || (() => ({})),
    phoneNumber: userData.phoneNumber || null,
    photoURL: userData.photoURL || null,
    providerId: userData.providerId || ''
  } as CustomUserProfile;
}