import { firebaseApp } from '@/constants/firebase';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { getAuth, deleteUser as deleteAuthUser } from 'firebase/auth';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import { getCurrentUserId } from './common/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedAt: Date;
  scheduledDeletionAt: Date;
  status: 'pending' | 'cancelled' | 'completed';
  reason?: string;
  cancellationReason?: string;
}

/**
 * Request account deletion - marks account for deletion in 30 days
 */
export const requestAccountDeletion = async (reason?: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    
    if (!user) throw new Error('User not authenticated');

    const now = new Date();
    const scheduledDeletionAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if there's already a pending deletion request
    const deletionRequestsRef = collection(db, 'accountDeletionRequests');
    const existingQuery = query(
      deletionRequestsRef,
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error('Account deletion is already scheduled');
    }

    // Create deletion request
    const deletionData: Omit<AccountDeletionRequest, 'id'> = {
      userId,
      userEmail: user.email || '',
      userName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      requestedAt: now,
      scheduledDeletionAt,
      status: 'pending',
      reason,
    };

    const deletionRef = await setDoc(doc(deletionRequestsRef), deletionData);
    
    // Log the deletion request
    console.log(`Account deletion scheduled for user ${userId} on ${scheduledDeletionAt.toISOString()}`);
    
    return deletionRef.id;
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    throw error;
  }
};

/**
 * Cancel pending account deletion
 */
export const cancelAccountDeletion = async (cancellationReason?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    const deletionRequestsRef = collection(db, 'accountDeletionRequests');
    const pendingQuery = query(
      deletionRequestsRef,
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);

    if (pendingSnapshot.empty) {
      throw new Error('No pending deletion request found');
    }

    // Cancel the deletion request
    const deletionDoc = pendingSnapshot.docs[0];
    await updateDoc(deletionDoc.ref, {
      status: 'cancelled',
      cancellationReason,
      cancelledAt: new Date(),
    });

    console.log(`Account deletion cancelled for user ${userId}`);
  } catch (error) {
    console.error('Error cancelling account deletion:', error);
    throw error;
  }
};

/**
 * Get user's deletion request status
 */
export const getAccountDeletionStatus = async (): Promise<AccountDeletionRequest | null> => {
  try {
    const userId = getCurrentUserId();

    const deletionRequestsRef = collection(db, 'accountDeletionRequests');
    const userQuery = query(
      deletionRequestsRef,
      where('userId', '==', userId),
      where('status', 'in', ['pending', 'cancelled']),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(userQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      requestedAt: data.requestedAt?.toDate() || new Date(),
      scheduledDeletionAt: data.scheduledDeletionAt?.toDate() || new Date(),
    } as AccountDeletionRequest;
  } catch (error) {
    console.error('Error getting deletion status:', error);
    return null;
  }
};

/**
 * Delete all user files from Firebase Storage
 */
const deleteUserFiles = async (userId: string): Promise<void> => {
  try {
    const userFilesRef = ref(storage, `files/${userId}`);
    const filesList = await listAll(userFilesRef);

    // Delete all files
    const deletePromises = filesList.items.map(fileRef => deleteObject(fileRef));
    await Promise.all(deletePromises);

    console.log(`Deleted ${filesList.items.length} files for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting files for user ${userId}:`, error);
    // Don't throw error as files might not exist
  }
};

/**
 * Comprehensive data deletion across all collections
 */
export const deleteAllUserData = async (userId: string): Promise<void> => {
  try {
    console.log(`Starting comprehensive data deletion for user ${userId}`);

    // Create batches for efficient deletion
    const batches: ReturnType<typeof writeBatch>[] = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    const addToBatch = (docRef: any) => {
      if (operationCount >= 500) { // Firestore batch limit
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
      currentBatch.delete(docRef);
      operationCount++;
    };

    // 1. Delete from favorites collection
    const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', userId));
    const favoritesSnapshot = await getDocs(favoritesQuery);
    favoritesSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // 2. Delete from folders collection
    const foldersQuery = query(collection(db, 'folders'), where('userId', '==', userId));
    const foldersSnapshot = await getDocs(foldersQuery);
    foldersSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // 3. Delete from follows collection (both following and followers)
    const followingQuery = query(collection(db, 'follows'), where('followerId', '==', userId));
    const followingSnapshot = await getDocs(followingQuery);
    followingSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    const followersQuery = query(collection(db, 'follows'), where('followingId', '==', userId));
    const followersSnapshot = await getDocs(followersQuery);
    followersSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // 4. Delete from helpSupport collection and its subcollections
    const helpSupportQuery = query(collection(db, 'helpSupport'), where('userId', '==', userId));
    const helpSupportSnapshot = await getDocs(helpSupportQuery);
    
    for (const helpDoc of helpSupportSnapshot.docs) {
      // Delete messages subcollection
      const messagesRef = collection(db, 'helpSupport', helpDoc.id, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      messagesSnapshot.docs.forEach(msgDoc => addToBatch(msgDoc.ref));
      
      // Delete main help support document
      addToBatch(helpDoc.ref);
    }

    // 5. Delete from notes collection and all subcollections
    const notesQuery = query(collection(db, 'notes'), where('userId', '==', userId));
    const notesSnapshot = await getDocs(notesQuery);
    
    for (const noteDoc of notesSnapshot.docs) {
      // Delete main note document
      addToBatch(noteDoc.ref);
    }

    // 6. Delete from notifications collection
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // Also delete notifications by email
    const user = auth.currentUser;
    if (user?.email) {
      const emailNotificationsQuery = query(collection(db, 'notifications'), where('userEmail', '==', user.email));
      const emailNotificationsSnapshot = await getDocs(emailNotificationsQuery);
      emailNotificationsSnapshot.docs.forEach(doc => addToBatch(doc.ref));
    }

    // 7. Delete from pages collection
    const pagesQuery = query(collection(db, 'pages'), where('userId', '==', userId));
    const pagesSnapshot = await getDocs(pagesQuery);
    pagesSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // 8. Delete from userProfiles collection
    const userProfileRef = doc(db, 'userProfiles', userId);
    addToBatch(userProfileRef);

    // 9. Delete from users collection
    const userRef = doc(db, 'users', userId);
    addToBatch(userRef);

    // 10. Delete from workspaceInvitations collection
    const invitationsQuery = query(collection(db, 'workspaceInvitations'), where('inviterUserId', '==', userId));
    const invitationsSnapshot = await getDocs(invitationsQuery);
    invitationsSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // Also delete invitations by email
    if (user?.email) {
      const emailInvitationsQuery = query(collection(db, 'workspaceInvitations'), where('inviteeEmail', '==', user.email));
      const emailInvitationsSnapshot = await getDocs(emailInvitationsQuery);
      emailInvitationsSnapshot.docs.forEach(doc => addToBatch(doc.ref));
    }

    // 11. Delete from workspaceMembers collection
    const membersQuery = query(collection(db, 'workspaceMembers'), where('userId', '==', userId));
    const membersSnapshot = await getDocs(membersQuery);
    membersSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // 12. Delete from workspaces collection
    const workspacesQuery = query(collection(db, 'workspaces'), where('userId', '==', userId));
    const workspacesSnapshot = await getDocs(workspacesQuery);
    workspacesSnapshot.docs.forEach(doc => addToBatch(doc.ref));

    // Add the current batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Execute all batches
    console.log(`Executing ${batches.length} batches for user ${userId}`);
    await Promise.all(batches.map(batch => batch.commit()));

    // Delete user files from storage
    await deleteUserFiles(userId);

    console.log(`Successfully deleted all data for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting user data for ${userId}:`, error);
    throw error;
  }
};

/**
 * Process pending deletions (to be called by a scheduled function)
 * This would typically be run as a Cloud Function on a schedule
 */
export const processPendingDeletions = async (): Promise<void> => {
  try {
    const now = new Date();
    const deletionRequestsRef = collection(db, 'accountDeletionRequests');
    
    // Find all pending deletions that are due
    const dueQuery = query(
      deletionRequestsRef,
      where('status', '==', 'pending'),
      where('scheduledDeletionAt', '<=', Timestamp.fromDate(now))
    );
    
    const dueSnapshot = await getDocs(dueQuery);
    
    console.log(`Found ${dueSnapshot.size} accounts due for deletion`);

    for (const doc of dueSnapshot.docs) {
      const deletionRequest = doc.data() as AccountDeletionRequest;
      
      try {
        // Delete all user data
        await deleteAllUserData(deletionRequest.userId);
        
        // Mark deletion as completed
        await updateDoc(doc.ref, {
          status: 'completed',
          completedAt: now,
        });
        
        console.log(`Completed deletion for user ${deletionRequest.userId}`);
      } catch (error) {
        console.error(`Failed to delete user ${deletionRequest.userId}:`, error);
        
        // Mark as failed and reschedule for next run
        await updateDoc(doc.ref, {
          status: 'failed',
          failedAt: now,
          error: error instanceof Error ? error.message : 'Unknown error',
          // Reschedule for 1 day later
          scheduledDeletionAt: Timestamp.fromDate(new Date(now.getTime() + 24 * 60 * 60 * 1000))
        });
      }
    }
  } catch (error) {
    console.error('Error processing pending deletions:', error);
    throw error;
  }
};

/**
 * Get all pending deletions (admin function)
 */
export const getPendingDeletions = async (): Promise<AccountDeletionRequest[]> => {
  try {
    const deletionRequestsRef = collection(db, 'accountDeletionRequests');
    const pendingQuery = query(
      deletionRequestsRef,
      where('status', '==', 'pending'),
      orderBy('scheduledDeletionAt', 'asc')
    );
    
    const snapshot = await getDocs(pendingQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      requestedAt: doc.data().requestedAt?.toDate() || new Date(),
      scheduledDeletionAt: doc.data().scheduledDeletionAt?.toDate() || new Date(),
    })) as AccountDeletionRequest[];
  } catch (error) {
    console.error('Error getting pending deletions:', error);
    throw error;
  }
};

/**
 * Delete user's Firebase Auth account
 * This should be called after data deletion is complete
 */
export const deleteUserAuthAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await deleteAuthUser(user);
    console.log(`Deleted Firebase Auth account for user ${user.uid}`);
  } catch (error) {
    console.error('Error deleting user auth account:', error);
    throw error;
  }
};

/**
 * Immediate account deletion (for users who want immediate deletion)
 */
export const deleteAccountImmediately = async (reason?: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    
    if (!user) throw new Error('User not authenticated');

    // Create a completed deletion request for record keeping
    const deletionData: Omit<AccountDeletionRequest, 'id'> = {
      userId,
      userEmail: user.email || '',
      userName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      requestedAt: new Date(),
      scheduledDeletionAt: new Date(), // Immediate
      status: 'completed',
      reason,
    };

    const deletionRequestsRef = collection(db, 'accountDeletionRequests');
    await setDoc(doc(deletionRequestsRef), deletionData);

    // Delete all user data immediately
    await deleteAllUserData(userId);
    
    // Delete Firebase Auth account
    await deleteUserAuthAccount();
    
    toast.success('Account deleted successfully');
  } catch (error) {
    console.error('Error deleting account immediately:', error);
    toast.error('Failed to delete account');
    throw error;
  }
};

/**
 * Check if user has any dependent data that others rely on
 * (e.g., workspaces with other members, shared notes, etc.)
 */
export const checkAccountDeletionDependencies = async (): Promise<{
  hasWorkspaceMembers: boolean;
  workspaceCount: number;
  sharedNotesCount: number;
  canDeleteImmediately: boolean;
}> => {
  try {
    const userId = getCurrentUserId();

    // Check for workspaces with other members
    const workspacesQuery = query(collection(db, 'workspaces'), where('userId', '==', userId));
    const workspacesSnapshot = await getDocs(workspacesQuery);
    
    let hasWorkspaceMembers = false;
    for (const workspaceDoc of workspacesSnapshot.docs) {
      const membersQuery = query(
        collection(db, 'workspaceMembers'), 
        where('workspaceId', '==', workspaceDoc.id),
        where('isActive', '==', true)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      if (membersSnapshot.size > 0) {
        hasWorkspaceMembers = true;
        break;
      }
    }

    // Check for shared/public notes
    const sharedNotesQuery = query(
      collection(db, 'notes'), 
      where('userId', '==', userId),
      where('isPublic', '==', true)
    );
    const sharedNotesSnapshot = await getDocs(sharedNotesQuery);

    return {
      hasWorkspaceMembers,
      workspaceCount: workspacesSnapshot.size,
      sharedNotesCount: sharedNotesSnapshot.size,
      canDeleteImmediately: !hasWorkspaceMembers && sharedNotesSnapshot.size === 0,
    };
  } catch (error) {
    console.error('Error checking deletion dependencies:', error);
    return {
      hasWorkspaceMembers: false,
      workspaceCount: 0,
      sharedNotesCount: 0,
      canDeleteImmediately: true,
    };
  }
};