import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, onSnapshot, startAfter, DocumentSnapshot, Unsubscribe } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import type { PublicNote, FavoriteNote, FileUploadProgress } from '@/types/firebase';
export type { PublicNote } from '@/types/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// const globalNoteRef = collection(db, 'notes');

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};


// Add a new page
export const addNotePage = async (folderId: string, name: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const now = new Date();

    // Get folder info to determine if note should be public
    const folderRef = doc(db, 'folders', folderId);
    const folderSnap = await getDoc(folderRef);
    const folderData = folderSnap.data();
    const isPublicFolder = folderData?.folderType === 'public';

    // Create the page document
    const pageRef = await addDoc(collection(db, 'pages'), {
      name,
      folderId,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial empty note content for the page
    const initialNoteData = {
      pageId: pageRef.id,
      title: name || '',
      content: '',
      tags: [],
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublicFolder || false, // Set public status based on folder type
      isTrashed: false,     // Set to false by default, Don't touch this when implementing another one.
      createdAt: now,
      updatedAt: now,
      recentlyOpenDate: now,
    };

    await setDoc(doc(db, 'notes', pageRef.id), initialNoteData);

    return pageRef.id;
  } catch (error) {
    console.error('Error adding note page:', error);
    throw error;
  }
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




export const getNoteTitle = async (pageId: string): Promise<string> => {
  const noteRef = doc(db, 'notes', pageId);
  const noteSnap = await getDoc(noteRef);
  return noteSnap.data()?.title || 'Untitled';
}

export const changeNoteTitle = async (pageId: string, title: string): Promise<void> => {
  const noteRef = doc(db, 'notes', pageId);
  await updateDoc(noteRef, {
    title,
    updatedAt: new Date(),
  });
}
export interface NotificationItem {
  id: string;
  userId: string;
  type: 'workspace_invitation' | 'member_added' | 'member_removed' | 'role_changed';
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}


// Check if user is workspace owner
export const isWorkspaceOwner = async (workspaceId: string, userId?: string): Promise<boolean> => {
  try {
    const currentUserId = userId || getCurrentUserId();
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);

    if (!workspaceSnap.exists()) {
      return false;
    }

    return workspaceSnap.data().userId === currentUserId;
  } catch (error) {
    console.error('Error checking workspace ownership:', error);
    return false;
  }
};

// Notification functions
export const createNotification = async (
  userId: string,
  notification: Omit<NotificationItem, 'id' | 'userId' | 'isRead' | 'createdAt'>
): Promise<string> => {
  try {
    const notificationData = {
      userId,
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };

    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification for email (find user by email)
export const createNotificationForEmail = async (
  email: string,
  notification: Omit<NotificationItem, 'id' | 'userId' | 'isRead' | 'createdAt'>
): Promise<void> => {
  try {
    // In a real implementation, you would have a way to find users by email
    // For now, we'll just create a notification with the email as identifier
    const notificationData = {
      userEmail: email, // Temporary field for email-based notifications
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification for email:', error);
    // Don't throw error as this is optional
  }
};

// Get user notifications
export const getUserNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Also get email-based notifications
    const emailQuery = user?.email ? query(
      notificationsRef,
      where('userEmail', '==', user.email),
      orderBy('createdAt', 'desc'),
      limit(50)
    ) : null;

    const [snapshot, emailSnapshot] = await Promise.all([
      getDocs(q),
      emailQuery ? getDocs(emailQuery) : Promise.resolve(null)
    ]);

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as NotificationItem[];

    // Merge email-based notifications
    if (emailSnapshot) {
      const emailNotifications = emailSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId, // Set the userId for email-based notifications
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as NotificationItem[];

      // Update email-based notifications to have userId
      for (const emailDoc of emailSnapshot.docs) {
        const emailNotificationData = emailDoc.data();
        if (!emailNotificationData.userId && emailNotificationData.userEmail) {
          await updateDoc(emailDoc.ref, {
            userId,
            userEmail: emailNotificationData.userEmail, // Keep for reference
          });
        }
      }

      notifications.push(...emailNotifications);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        isRead: true,
        readAt: new Date(),
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (!notificationSnap.exists()) {
      throw new Error('Notification not found');
    }

    const notificationData = notificationSnap.data();

    // Verify notification belongs to current user
    if (notificationData.userId !== userId) {
      throw new Error('Unauthorized to delete this notification');
    }

    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const userId = getCurrentUserId();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Favorites management functions

// Add note to favorites
export const addToFavorites = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    // Check if already in favorites
    const favoritesRef = collection(db, 'favorites');
    const existingQuery = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error('Already in favorites');
    }

    // Get note data for validation and titles
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) throw new Error('Note not found');
    const noteData = noteSnap.data();
    const noteTitle = noteData.title || 'Untitled';

    if (!noteData.content || !String(noteData.content).trim()) {
      throw new Error('Cannot add an empty note to favorites.');
    }

    // Add to favorites
    const favoriteData = {
      userId,
      noteId,
      noteTitle,
      addedAt: new Date(),
    };

    await addDoc(favoritesRef, favoriteData);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove note from favorites
export const removeFromFavorites = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Not in favorites');
    }

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Check if note is in favorites
export const isNoteFavorite = async (noteId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const snapshot = await getDocs(q);

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if note is favorite:', error);
    return false;
  }
};

export const realTimeFavoriteStatus = async (noteId: string, setIsFavorite: (isFavorite: boolean) => void): Promise<Unsubscribe> => {
  let unsubscribe: Unsubscribe = () => { };
  try {
    const userId = getCurrentUserId();
    const favoritesRef = collection(db, "favorites");
    const q = query(favoritesRef, where('noteId', '==', noteId), where('userId', '==', userId));
    unsubscribe = onSnapshot(q, (snapshot) => {
      setIsFavorite(!snapshot.empty);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error checking real-time favorite status:', error);
    toast.error('Error checking real-time favorite status');
    setIsFavorite(false);
    return unsubscribe;
  }
}

// Get user's favorite notes
export const getUserFavorites = async (): Promise<FavoriteNote[]> => {
  try {
    const userId = getCurrentUserId();

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as FavoriteNote[];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
};

// Move note to trash
export const moveToTrash = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    console.log("moveToTrash in firebase", noteId);
    const noteRef = doc(db, 'notes', noteId);
    console.log("noteRef in firebase", noteRef);

    // Get current note to verify ownership and save original location
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    const currentNote = noteSnap.data();
    const now = new Date();

    // Update note to mark as trashed
    await updateDoc(noteRef, {
      isTrashed: true,
      trashedAt: now,
      originalLocation: { isPublic: currentNote.isPublic || false },
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error moving note to trash:', error);
    throw error;
  }
};

// Don't remove the functionality below
export const updateFavoriteNoteTitle = async (noteId: string, title: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId), where('noteId', '==', noteId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return;
    }
    const favoriteDoc = snapshot.docs[0];
    await updateDoc(favoriteDoc.ref, { noteTitle: title });
  } catch (error) {
    console.error('Error updating favorite note:', error);
    throw error;
  }
};

// Restore note from trash
export const restoreFromTrash = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', noteId);

    // Get current note to verify ownership and restore original location
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    const currentNote = noteSnap.data();
    const now = new Date();

    // Restore note to original location
    await updateDoc(noteRef, {
      isTrashed: false,
      trashedAt: null,
      isPublic: currentNote.originalLocation?.isPublic || false,
      originalLocation: null,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error restoring note from trash:', error);
    throw error;
  }
};

// Permanently delete note from trash
// Permanently delete note from trash
export const permanentlyDeleteNote = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', noteId);
    const pageRef = doc(db, 'pages', noteId);

    // Verify ownership before deleting
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }

    // Only allow permanent deletion if the note is trashed
    if (!noteSnap.data().isTrashed) {
      throw new Error('Note must be in trash before permanent deletion');
    }


    // Clear all comments before deletion
    await updateDoc(noteRef, {
      comments: [],
      updatedAt: new Date(),
    });

    // Also clean up any favorites that reference this note
    const favoritesRef = collection(db, 'favorites');
    const favoritesQuery = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', noteId)
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);

    // Delete both the note, its page document, and any favorites
    const deletionPromises = [
      deleteDoc(noteRef),
      deleteDoc(pageRef),
      // Delete all favorite documents that reference this note
      ...favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    ];

    await Promise.all(deletionPromises);
  } catch (error) {
    console.error('Error permanently deleting note:', error);
    throw error;
  }
};
// Help & Support system interfaces and functions
export interface SupportConversation {
  id: string;
  type: 'contact' | 'bug' | 'feedback';
  userEmail: string;
  userName: string;
  userId: string;
  status: 'active' | 'closed';
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  unreadCount: number; // For admin to track unread messages
  typing?: string[]; // user emails
  adminPresent?: boolean;
  adminLastSeen?: Date;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  senderEmail: string;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
}

// Create or get an existing support conversation
export const createOrGetSupportConversation = async (
  type: 'contact' | 'bug' | 'feedback'
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    // Check if user already has an active conversation of this type
    const conversationsRef = collection(db, 'helpSupport');
    const existingQuery = query(
      conversationsRef,
      where('userId', '==', userId),
      where('type', '==', type),
      where('status', '==', 'active')
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      // Return existing conversation ID
      return existingSnapshot.docs[0].id;
    }

    // Create new conversationtion
    const now = new Date();
    const conversationData = {
      type,
      userEmail: user.email || '',
      userName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
      userId,
      status: 'active',
      lastMessage: '',
      lastMessageAt: now,
      createdAt: now,
      unreadCount: 0,
    };

    const conversationRef = await addDoc(conversationsRef, conversationData);
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating support conversation:', error);
    throw error;
  }
};

// Send a support message
export const sendSupportMessage = async (
  conversationId: string,
  text: string,
  sender: 'user' | 'admin' = 'user'
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    const now = new Date();

    // Add message to subcollection
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    await addDoc(messagesRef, {
      text,
      sender,
      senderEmail: user.email || '',
      senderName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      timestamp: now,
      isRead: sender === 'admin', // Admin messages are read by default
    });

    // Update conversation with last message and conditionally increment unread count
    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const currentData = conversationSnap.data();
      let newUnreadCount = currentData.unreadCount || 0;

      if (sender === 'user') {
        // Only increment count if the admin is not currently present in the chat room
        if (!currentData.adminPresent) {
          newUnreadCount++;
        }
      } else { // sender is 'admin'
        // Reset unread count when admin sends a message
        newUnreadCount = 0;
      }

      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageAt: now,
        unreadCount: newUnreadCount,
      });
    }
  } catch (error) {
    console.error('Error sending support message:', error);
    throw error;
  }
};

// Get support conversations for admin (grouped by type)
export const getAdminSupportConversations = async (
  type?: 'contact' | 'bug' | 'feedback',
  sortBy: 'newest' | 'oldest' | 'unread' | 'name' = 'newest'
): Promise<SupportConversation[]> => {
  try {
    const conversationsRef = collection(db, 'helpSupport');

    let q;
    if (type) {
      // First query by type and status
      if (sortBy === 'name') {
        q = query(
          conversationsRef,
          where('type', '==', type),
          orderBy('userName', 'asc')
        );
      } else {
        q = query(
          conversationsRef,
          where('type', '==', type),
          orderBy('lastMessageAt', sortBy === 'newest' ? 'desc' : 'asc')
        );
      }
    } else {
      if (sortBy === 'name') {
        q = query(
          conversationsRef,
          orderBy('userName', 'asc')
        );
      } else {
        q = query(
          conversationsRef,
          orderBy('lastMessageAt', sortBy === 'newest' ? 'desc' : 'asc')
        );
      }
    }

    const snapshot = await getDocs(q);

    let conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as SupportConversation[];

    // Client-side sorting for unread count since Firestore doesn't support complex sorting
    if (sortBy === 'unread') {
      conversations = conversations.sort((a, b) => {
        // First sort by unread count (descending), then by date (newest first)
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      });
    }

    return conversations;
  } catch (error) {
    console.error('Error fetching admin support conversations:', error);
    throw error;
  }
};

// Get user's support conversations
export const getUserSupportConversations = async (
  sortBy: 'newest' | 'oldest' | 'type' = 'newest'
): Promise<SupportConversation[]> => {
  try {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, 'helpSupport');

    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);

    let conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as SupportConversation[];

    // Client-side sorting
    if (sortBy === 'oldest') {
      conversations = conversations.sort((a, b) => a.lastMessageAt.getTime() - b.lastMessageAt.getTime());
    } else if (sortBy === 'type') {
      conversations = conversations.sort((a, b) => {
        // First sort by type, then by newest date
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      });
    }

    return conversations;
  } catch (error) {
    console.error('Error fetching user support conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getSupportMessages = async (conversationId: string): Promise<SupportMessage[]> => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      conversationId,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as SupportMessage[];
  } catch (error) {
    console.error('Error fetching support messages:', error);
    throw error;
  }
};

// Mark messages as read (for admin)
export const markSupportMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get all unread user messages
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('sender', '==', 'user'),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    // Mark all as read
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);

    // Reset unread count in conversation
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, { unreadCount: 0 });
  } catch (error) {
    console.error('Error marking support messages as read:', error);
    throw error;
  }
};

// Mark admin messages as read (for users)
export const markAdminMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get all unread admin messages
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('sender', '==', 'admin'),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);

    // Mark all as read
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking admin messages as read:', error);
    throw error;
  }
};

// Close support conversation
export const closeSupportConversation = async (conversationId: string): Promise<void> => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, {
      status: 'closed',
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Error closing support conversation:', error);
    throw error;
  }
};

// Get total unread support messages count for admin
export const getAdminUnreadSupportCount = async (): Promise<{
  contact: number;
  bug: number;
  feedback: number;
  total: number;
}> => {
  try {
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('status', '==', 'active'),
      where('unreadCount', '>', 0)
    );
    const snapshot = await getDocs(q);

    const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type as 'contact' | 'bug' | 'feedback';
      const unreadCount = data.unreadCount || 0;

      counts[type] += unreadCount;
      counts.total += unreadCount;
    });

    return counts;
  } catch (error) {
    console.error('Error getting admin unread support count:', error);
    return { contact: 0, bug: 0, feedback: 0, total: 0 };
  }
};

// Real-time listener for admin unread support counts
export const subscribeToAdminUnreadCounts = (
  callback: (counts: { contact: number; bug: number; feedback: number; total: number }) => void
): (() => void) => {
  try {
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type as 'contact' | 'bug' | 'feedback';
        const unreadCount = data.unreadCount || 0;

        if (unreadCount > 0) {
          counts[type] += unreadCount;
          counts.total += unreadCount;
        }
      });

      callback(counts);
    }, (error) => {
      console.error('Error in admin unread counts listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up admin unread counts listener:', error);
    return () => { };
  }
};

// Real-time listener for user's unread counts by type
export const subscribeToUserUnreadCounts = (
  callback: (counts: { contact: number; bug: number; feedback: number; total: number }) => void
): (() => void) => {
  try {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type as 'contact' | 'bug' | 'feedback';
        // For users, we need to count messages where sender is 'admin' and isRead is false
        // This is more complex as we need to query the subcollection
        // For now, we'll use a simplified approach - you might want to restructure this
        const unreadCount = 0; // We'll implement proper counting below

        counts[type] += unreadCount;
        counts.total += unreadCount;
      });

      callback(counts);
    }, (error) => {
      console.error('Error in user unread counts listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up user unread counts listener:', error);
    return () => { };
  }
};

// Real-time listener for specific conversation unread count
export const subscribeToConversationUnreadCount = (
  conversationId: string,
  isAdmin: boolean,
  callback: (unreadCount: number) => void
): (() => void) => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);

    const unsubscribe = onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        if (isAdmin) {
          // For admin, unreadCount field tracks user messages
          callback(data.unreadCount || 0);
        } else {
          // For users, we need to count unread admin messages
          // This requires querying the messages subcollection
          const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
          const unreadQuery = query(
            messagesRef,
            where('sender', '==', 'admin'),
            where('isRead', '==', false)
          );

          getDocs(unreadQuery).then((msgSnapshot) => {
            callback(msgSnapshot.size);
          }).catch((error) => {
            console.error('Error counting unread admin messages:', error);
            callback(0);
          });
        }
      } else {
        callback(0);
      }
    }, (error) => {
      console.error('Error in conversation unread count listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversation unread count listener:', error);
    return () => { };
  }
};

// Real-time listener for user's unread admin messages across all conversations
export const subscribeToUserUnreadAdminMessages = (
  callback: (counts: { contact: number; bug: number; feedback: number; total: number }) => void
): (() => void) => {
  try {
    const userId = getCurrentUserId();
    const conversationsRef = collection(db, 'helpSupport');
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const counts = { contact: 0, bug: 0, feedback: 0, total: 0 };

      // Get unread admin messages for each conversation
      const countPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const type = data.type as 'contact' | 'bug' | 'feedback';

        const messagesRef = collection(db, 'helpSupport', doc.id, 'messages');
        const unreadQuery = query(
          messagesRef,
          where('sender', '==', 'admin'),
          where('isRead', '==', false)
        );

        try {
          const msgSnapshot = await getDocs(unreadQuery);
          const unreadCount = msgSnapshot.size;

          counts[type] += unreadCount;
          counts.total += unreadCount;
        } catch (error) {
          console.error(`Error counting unread messages for conversation ${doc.id}:`, error);
        }
      });

      await Promise.all(countPromises);
      callback(counts);
    }, (error) => {
      console.error('Error in user unread admin messages listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up user unread admin messages listener:', error);
    return () => { };
  }
};

// Real-time listener for messages in a conversation
export const subscribeToConversationMessages = (
  conversationId: string,
  callback: (messages: SupportMessage[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        conversationId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as SupportMessage[];

      callback(messages);
    }, (error) => {
      console.error('Error in conversation messages listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversation messages listener:', error);
    return () => { };
  }
};

// Track admin presence in chat rooms
export const updateAdminPresence = async (conversationId: string, isPresent: boolean): Promise<void> => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, {
      adminPresent: isPresent,
      adminLastSeen: new Date(),
    });
  } catch (error) {
    console.error('Error updating admin presence:', error);
  }
};

// Check if admin is currently present in chat room
export const checkAdminPresence = async (conversationId: string): Promise<boolean> => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      const adminPresent = data.adminPresent || false;
      const adminLastSeen = data.adminLastSeen?.toDate();

      // Consider admin present if they were active in the last 5 minutes
      if (adminLastSeen) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return adminPresent && adminLastSeen > fiveMinutesAgo;
      }

      return adminPresent;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin presence:', error);
    return false;
  }
};

// Send an automatic system message
export const sendSystemMessage = async (
  conversationId: string,
  text: string
): Promise<void> => {
  try {
    const now = new Date();

    // Add message to subcollection with system sender
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    await addDoc(messagesRef, {
      text,
      sender: 'system',
      senderEmail: 'system@notionclone.com',
      senderName: 'System',
      timestamp: now,
      isRead: true, // System messages are considered read
    });

    // Update conversation with last message but don't increment unread count for system messages
    const conversationRef = doc(db, 'helpSupport', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageAt: now,
    });
  } catch (error) {
    console.error('Error sending system message:', error);
    throw error;
  }
};

// Typing indicator functions
export const setTypingStatus = async (
  conversationId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data();
      let typingUsers: string[] = conversationData.typing || [];

      if (isTyping) {
        if (!typingUsers.includes(user.email)) {
          typingUsers.push(user.email);
        }
      } else {
        typingUsers = typingUsers.filter((email) => email !== user.email);
      }

      await updateDoc(conversationRef, { typing: typingUsers });
    }
  } catch (error) {
    console.error('Error setting typing status:', error);
  }
};

export const subscribeToTypingStatus = (
  conversationId: string,
  callback: (typingEmails: string[]) => void
): (() => void) => {
  try {
    const conversationRef = doc(db, 'helpSupport', conversationId);

    const unsubscribe = onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.typing || []);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to typing status:', error);
    return () => { };
  }
};

// Get messages for a specific conversation with pagination
export const getSupportMessagesPaginated = async (
  conversationId: string,
  limitCount: number,
  startAfterDoc: DocumentSnapshot | null = null
): Promise<{ messages: SupportMessage[]; lastVisible: DocumentSnapshot | null }> => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    let q;

    if (startAfterDoc) {
      q = query(messagesRef, orderBy('timestamp', 'desc'), startAfter(startAfterDoc), limit(limitCount));
    } else {
      q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    }

    const snapshot = await getDocs(q);

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      conversationId,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as SupportMessage[];

    return {
      messages,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Error fetching paginated support messages:', error);
    throw error;
  }
};

// Real-time listener for NEW messages in a conversation
export const subscribeToNewConversationMessages = (
  conversationId: string,
  latestMessageTimestamp: Date | null,
  callback: (messages: SupportMessage[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, 'helpSupport', conversationId, 'messages');
    let q;

    if (latestMessageTimestamp) {
      q = query(messagesRef, where('timestamp', '>', latestMessageTimestamp), orderBy('timestamp', 'asc'));
    } else {
      // If no messages exist, this will listen for the very first one.
      q = query(messagesRef, orderBy('timestamp', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        conversationId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as SupportMessage[];

      callback(newMessages);
    }, (error) => {
      console.error('Error in new conversation messages listener:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up new conversation messages listener:', error);
    return () => { };
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (
  file: File,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `files/${userId}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({ progress });
        },
        (error) => {
          console.error('Error uploading file:', error);
          onProgress?.({ progress: 0, error: error.message });
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.({ progress: 100, downloadUrl });
            resolve(downloadUrl);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error starting file upload:', error);
    throw error;
  }
};

