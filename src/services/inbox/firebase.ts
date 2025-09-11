import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, updateDoc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { NotificationItem } from '@/types/firebase';
import { getCurrentUserId } from '../common/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);


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