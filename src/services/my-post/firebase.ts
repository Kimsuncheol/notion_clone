import { collection, query, where, orderBy, getDocs, getFirestore, getDoc, doc, limit, startAfter, QueryConstraint, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { MyPost, TagType, CustomUserProfile, MySeries } from '@/types/firebase';
import { firebaseApp } from '@/constants/firebase';

const db = getFirestore(firebaseApp);

// Utility function to convert Firestore timestamp to Date
function convertTimestamp(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    // Handle Firestore Timestamp object directly
    const firestoreTimestamp = timestamp as { seconds: number; nanoseconds?: number };
    const seconds = firestoreTimestamp.seconds;
    const nanoseconds = firestoreTimestamp.nanoseconds || 0;
    return new Date(seconds * 1000 + nanoseconds / 1000000);
  }
  return new Date();
}

function serializeUserSettings(userSettings: unknown) {
  if (!userSettings || typeof userSettings !== 'object') {
    return null;
  }

  const settings = userSettings as Record<string, unknown>;

  return {
    ...settings,
    updatedAt: settings.updatedAt ? convertTimestamp(settings.updatedAt) : undefined,
  };
}

// Utility function to convert comment from Firebase format to MyPost format
function convertFirebaseComment(comment: Record<string, unknown>): {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
} {
  return {
    id: (comment.id as string) || '',
    text: (comment.content as string) || '',
    author: (comment.author as string) || '',
    authorEmail: (comment.authorEmail as string) || '',
    timestamp: convertTimestamp(comment.createdAt)
  };
}

// Utility function to convert tag timestamps
function convertTag(tag: Record<string, unknown>): TagType {
  return {
    id: (tag.id as string) || '',
    name: (tag.name as string) || '',
    userId: (tag.userId as string[]) || [],
    createdAt: tag.createdAt? convertTimestamp(tag.createdAt) : undefined,
    updatedAt: tag.updatedAt ? convertTimestamp(tag.updatedAt) : undefined
  };
}

// Utility function to convert series timestamps
function convertSeries(series: Record<string, unknown> | null): MySeries | null {
  if (!series) return null;

  return {
    ...series,
    createdAt: convertTimestamp(series.createdAt),
    updatedAt: series.updatedAt ? convertTimestamp(series.updatedAt) : undefined
  } as MySeries;
}

function buildMyPostFromSnapshot(docSnap: QueryDocumentSnapshot<DocumentData>): MyPost {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId,
    title: data.title || '',
    thumbnailUrl: data.thumbnailUrl || '',
    content: data.content || '',
    createdAt: convertTimestamp(data.createdAt),
    authorId: data.authorId || '',
    authorEmail: data.authorEmail || '',
    authorName: data.authorName || '',
    isPublished: data.isPublished || false,
    trashedAt: convertTimestamp(data.trashedAt),
    viewCount: data.viewCount || 0,
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    comments: (data.comments || []).map(convertFirebaseComment),
    tags: (data.tags || []).map(convertTag),
    series: convertSeries(data.series),
    description: data.description || ''
  } as MyPost;
}

interface FetchUserPostsOptions {
  limitCount?: number;
  startAfterDocId?: string;
}

export async function fetchUserPosts(
  userEmail: string,
  tag?: TagType,
  options: FetchUserPostsOptions = {}
): Promise<{ posts: MyPost[]; lastDocId?: string; hasMore: boolean }> {
  try {
    const postsRef = collection(db, 'notes');
    // Simplified query to avoid composite index requirement

    console.log('fetchUserPosts userEmail: ', userEmail);
    const limitCount = options.limitCount ?? 10;
    const constraint: QueryConstraint[] = [
      where('authorEmail', '==', userEmail),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    ]

    console.log('tag: ', tag);

    // Filter by tag name if not "All"
    if (tag && tag.name !== 'All' && tag.id !== 'all') {
      constraint.push(where('tags', 'array-contains', tag.name));
    }

    if (options.startAfterDocId) {
      const lastDocRef = doc(db, 'notes', options.startAfterDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        constraint.push(startAfter(lastDocSnap));
      }
    }

    constraint.push(limit(limitCount + 1));

    const q = query(postsRef, ...constraint);
    const snapshot = await getDocs(q);


    const filteredDocs = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.isPublished === true;
      });

    const hasMore = filteredDocs.length > limitCount;
    const docs = hasMore ? filteredDocs.slice(0, limitCount) : filteredDocs;

    const posts = docs.map(buildMyPostFromSnapshot);
    const lastDocId = hasMore ? filteredDocs[limitCount].id : undefined;
    return { posts, lastDocId, hasMore };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return { posts: [], lastDocId: undefined, hasMore: false };
  }
}

export async function fetchUserPostsPage(
  userEmail: string,
  tag: TagType | undefined,
  options: FetchUserPostsOptions = {}
): Promise<{ posts: MyPost[]; lastDocId?: string; hasMore: boolean }> {
  try {
    const postsRef = collection(db, 'notes');
    const limitCount = options.limitCount ?? 10;
    const constraint: QueryConstraint[] = [
      where('authorEmail', '==', userEmail),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    ];

    if (tag && tag.name !== 'All' && tag.id !== 'all') {
      constraint.push(where('tags', 'array-contains', tag.name));
    }

    if (options.startAfterDocId) {
      const lastDocRef = doc(db, 'notes', options.startAfterDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        constraint.push(startAfter(lastDocSnap));
      }
    }

    constraint.push(limit(limitCount + 1));

    const q = query(postsRef, ...constraint);
    const snapshot = await getDocs(q);

    const filteredDocs = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.isPublished === true;
      });

    const hasMore = filteredDocs.length > limitCount;
    const docs = hasMore ? filteredDocs.slice(0, limitCount) : filteredDocs;

    const posts = docs.map(buildMyPostFromSnapshot);
    const lastDocId = hasMore ? filteredDocs[limitCount].id : undefined;
    return { posts, lastDocId, hasMore };
  } catch (error) {
    console.error('Error fetching user posts page:', error);
    return { posts: [], lastDocId: undefined, hasMore: false };
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

    console.log('rawTags in fetchUserTags: ', rawTags);

    // Convert Firestore data to plain objects with proper timestamp conversion
    return rawTags.map(convertTag);
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

  console.log('postCount in fetchUserProfile: ', userData.postCount);

  const userSettings = serializeUserSettings(userData.userSettings || null);

  return {
    id: userDoc.id,
    userId: userData.userId || '',
    email: userData.email || '',
    bio: userData.bio,
    introduction: userData.introduction,
    displayName: userData.userSettings?.displayName || null,
    website: userData.website,
    location: userData.location,
    skills: userData.skills || [],
    followersCount: userData.followersCount || 0,
    followingCount: userData.followingCount || 0,
    postCount: userData.postCount || 0,
    joinedAt: convertTimestamp(userData.joinedAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    uid: userData.uid || '',
    emailVerified: userData.emailVerified || false,
    isAnonymous: userData.isAnonymous || false,
    phoneNumber: userData.phoneNumber || null,
    avatar: userData.avatar || null,
    providerId: userData.providerId || '',
    userSettings
  } as CustomUserProfile;
}

// collection - 'notes'
// field - 'tags'
// query - where('tags', 'array-contains', tag), where('authorId', '==', userId)
// return the count of posts
export async function getMyPostsCountByTag(userId: string, tag: TagType): Promise<number> {
  if (!userId || !tag) {
    console.log('getMyPostsCountByTag userId or tag is undefined');
    return 0;
  }
  
  const notesRef = collection(db, 'notes');
  const q = query(
    notesRef,
    where('authorId', '==', userId),
    where('tags', 'array-contains', tag),
    where('isPublished', '==', true)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

// 'users' collection
export async function getMyTotalPostsCount(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }
  
  const userRef = doc(db, 'users', userId);
  try {
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      return 0;
    }
    const userData = snapshot.data();
    return userData.postCount || 0;
  } catch (error) {
    console.error('Error getting my total posts count:', error);
    return 0;
  }
}
