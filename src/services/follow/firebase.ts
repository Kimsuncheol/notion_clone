import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, updateDoc, addDoc, getDocs, deleteDoc, query, where, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getCurrentUserId } from '../common/firebase';
import type { FollowRelationship } from '@/types/firebase';
import toast from 'react-hot-toast';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Follow a user
export const followUser = async (targetUserId: string): Promise<void> => {
  try {
    const currentUserId = getCurrentUserId();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Prevent users from following themselves
    if (currentUserId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const isAlreadyFollowing = await isFollowingUser(targetUserId);
    if (isAlreadyFollowing) {
      throw new Error('Already following this user');
    }

    // Get target user info
    const targetUserRef = doc(db, 'users', targetUserId);
    const targetUserSnap = await getDoc(targetUserRef);

    if (!targetUserSnap.exists()) {
      throw new Error('User to follow not found');
    }

    const targetUserData = targetUserSnap.data();
    const currentUserRef = doc(db, 'users', currentUserId);

    // Create follow relationship document
    const followData: FollowRelationship = {
      followerId: currentUserId,
      followingId: targetUserId,
      followerEmail: currentUser.email || '',
      followingEmail: targetUserData.email || '',
      followerName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
      followingName: targetUserData.displayName || targetUserData.email?.split('@')[0] || 'Anonymous',
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'follows'), followData);

    // Update follower count for target user (increment)
    await updateDoc(targetUserRef, {
      followersCount: increment(1),
      updatedAt: new Date(),
    });

    // Update following count for current user (increment)
    await updateDoc(currentUserRef, {
      followingCount: increment(1),
      updatedAt: new Date(),
    });

    toast.success(`Now following ${followData.followingName}`);
  } catch (error) {
    console.error('Error following user:', error);
    toast.error((error as Error).message || 'Failed to follow user');
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (targetUserId: string): Promise<void> => {
  try {
    const currentUserId = getCurrentUserId();

    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if currently following
    const isCurrentlyFollowing = await isFollowingUser(targetUserId);
    if (!isCurrentlyFollowing) {
      throw new Error('Not following this user');
    }

    // Find and delete the follow relationship
    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Follow relationship not found');
    }

    // Delete the follow relationship document(s)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Get user references
    const targetUserRef = doc(db, 'users', targetUserId);
    const currentUserRef = doc(db, 'users', currentUserId);

    // Verify users exist before updating counts
    const [targetUserSnap, currentUserSnap] = await Promise.all([
      getDoc(targetUserRef),
      getDoc(currentUserRef)
    ]);

    if (!targetUserSnap.exists()) {
      throw new Error('Target user not found');
    }

    if (!currentUserSnap.exists()) {
      throw new Error('Current user profile not found');
    }

    const targetUserData = targetUserSnap.data();
    const userName = targetUserData.displayName || targetUserData.email?.split('@')[0] || 'User';

    // Update follower count for target user (decrement)
    await updateDoc(targetUserRef, {
      followersCount: increment(-1),
      updatedAt: new Date(),
    });

    // Update following count for current user (decrement)
    await updateDoc(currentUserRef, {
      followingCount: increment(-1),
      updatedAt: new Date(),
    });

    toast.success(`Unfollowed ${userName}`);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    toast.error((error as Error).message || 'Failed to unfollow user');
    throw error;
  }
};

// Check if current user is following a specific user
export const isFollowingUser = async (targetUserId: string): Promise<boolean> => {
  try {
    const currentUserId = getCurrentUserId();

    if (!auth.currentUser) {
      return false;
    }

    // Don't allow users to follow themselves
    if (currentUserId === targetUserId) {
      return false;
    }

    // Query the follows collection
    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followerId', '==', currentUserId),
      where('followingId', '==', targetUserId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Get users that the current user is following
export const getFollowing = async (userId?: string): Promise<FollowRelationship[]> => {
  try {
    const targetUserId = userId || getCurrentUserId();

    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followerId', '==', targetUserId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FollowRelationship[];
  } catch (error) {
    console.error('Error fetching following list:', error);
    throw error;
  }
};

// Get users that follow the current user
export const getFollowers = async (userId?: string): Promise<FollowRelationship[]> => {
  try {
    const targetUserId = userId || getCurrentUserId();

    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followingId', '==', targetUserId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FollowRelationship[];
  } catch (error) {
    console.error('Error fetching followers list:', error);
    throw error;
  }
};

// Get follow stats for a user
export const getFollowStats = async (userId?: string): Promise<{ followersCount: number; followingCount: number }> => {
  try {
    const targetUserId = userId || getCurrentUserId();

    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { followersCount: 0, followingCount: 0 };
    }

    const userData = userSnap.data();
    return {
      followersCount: userData.followersCount || 0,
      followingCount: userData.followingCount || 0,
    };
  } catch (error) {
    console.error('Error fetching follow stats:', error);
    return { followersCount: 0, followingCount: 0 };
  }
};