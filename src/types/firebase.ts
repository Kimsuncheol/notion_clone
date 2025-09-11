import { UserProfile } from "firebase/auth";
export interface EmailNotification {
  commentNotification: boolean;
  likeNotification: boolean;
}

export interface Appearance {
  appearance: 'light' | 'dark' | 'system';
}

export interface LikeUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  joinedAt: Date;
}

// Serializable version for passing to client components
// settings -> github, email, email notification, appearance, my notes title
export interface CustomUserProfile extends UserProfile {
  id: string;
  userId: string;
  email: string; // -
  displayName: string;
  bio?: string;
  shortBio?: string;  
  github?: string;  // -
  website?: string;
  location?: string;
  skills?: skillsType[];
  likedNotes?: FirebaseNoteContent[];   // --
  recentlyReadNotes?: FirebaseNoteContent[];   // --
  tags?: TagType[];   // --
  series?: MySeries[];   // --
  followersCount: number;
  followingCount: number;
  postCount: number;
  joinedAt: Date;
  updatedAt?: Date;
  uid: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
  introduction?: string;   // --
  emailNotification?: EmailNotification; // -
  appearance?: Appearance; // -
  myNotesTitle?: string; // -
}
export interface FirebaseNoteContent {
  id: string;
  pageId: string;
  title: string;
  content: string;
  description?: string;
  tags?: TagType[];
  series?: MySeries | null;
  authorId: string;
  authorEmail?: string;
  authorName?: string;
  isPublic?: boolean;
  isPublished?: boolean;
  thumbnailUrl?: string;
  viewCount?: number;
  likeCount?: number;
  likeUsers?: LikeUser[];
  originalLocation?: { isPublic: boolean };
  comments?: Comment[];
  createdAt: Date;
  updatedAt?: Date | null;
  recentlyOpenDate?: Date;
}

export type MyPost = Omit<FirebaseNoteContent, | 'isPublished' | 'originalLocation' | 'createdAt' | 'updatedAt' | 'recentlyOpenDate' | 'pageId' | 'isPublic'> & {
  id: string;
  title: string;
  thumbnail: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  recentlyOpenDate?: Date;
  description?: string;
  authorEmail: string;
  authorName: string;
  isPublished: boolean;
  trashedAt: Date;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
  }>;
}

// It's used in MyPostSeries.tsx
export type MySeries = Omit<FirebaseNoteContent,
 | 'isPublished'
 | 'originalLocation'
 | 'authorId'
 | 'authorEmail'
 | 'authorName'
 | 'likeCount'
 | 'likeUsers'
 | 'viewCount'
 | 'commentCount'
 | 'comments'
 | 'recentlyOpenDate'
 | 'pageId'
 | 'isPublic'
 | 'content'
 | 'trashedAt'
 | 'isTrashed'
 | 'originalLocation'
 | 'series'
 | 'tags'
 > 
export interface PublicNote {
  id: string;
  title: string;
  authorId: string;
  authorEmail?: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
  publishContent?: string;
  thumbnail?: string;
  isPublished?: boolean;
  tags?: TagType[];
}

export interface FavoriteNote {
  id: string;
  authorId: string;
  noteId: string; // Parent note ID
  noteTitle: string; // Parent note title
  addedAt: Date;
}

export interface FileUploadProgress {
  progress: number; // 0-100
  downloadUrl?: string;
  error?: string;
}


export interface FileUploadProgress {
  progress: number; // 0-100
  downloadUrl?: string;
  error?: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  tags?: string[];
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface TagType {
  id: string;
  userId?: string[];
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TagTypeForTagsCollection extends TagType {
  notes: FirebaseNoteContent[];
  postCount: number;
}

export interface DraftedNote {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  tags?: TagType[];
}



export interface Comment {
  id: string;     // comment id
  parentCommentId?: string; // parent comment id
  noteId: string; // note id
  author: string;
  authorEmail: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  comments?: Comment[];
}

export interface skillsType {
  id: string;
  name: string;
  title: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SmallTabbarItem {
  label: string;
  value: string;
  path?: string;
}

// Help & Support system interfaces
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

// Notification system interfaces
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

// Follow system interfaces
export interface FollowRelationship {
  followerId: string; // User who is following
  followingId: string; // User being followed
  followerEmail: string;
  followingEmail: string;
  followerName: string;
  followingName: string;
  createdAt: Date;
}