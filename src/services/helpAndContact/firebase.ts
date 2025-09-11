import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, updateDoc, addDoc, getDocs, query, where, orderBy, limit, onSnapshot, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { SupportConversation, SupportMessage, FileUploadProgress } from '@/types/firebase';
import { getCurrentUserId } from '../common/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

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

    // Create new conversation
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