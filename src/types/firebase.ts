import { UserProfile } from "firebase/auth";

export interface UserSettings {
  displayName?: string;
  shortBio?: string;
  email: string;
  github: string;
  emailNotification: EmailNotification;
  appearance: Appearance;
  myNotesTitle: string;
}
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
  displayName?: string;
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
  bio?: string;
  avatar: string | null;
  displayName?: string | null;
  // photoURL: string | null;
  website?: string;
  location?: string;
  skills?: skillsType[];
  likedNotes?: Partial<FirebaseNoteContent>[];   // --
  recentlyReadNotes?: Partial<FirebaseNoteContent>[];   // --
  tags?: TagType[];   // --
  series?: MySeries[];   // --
  followersCount: number;
  followers?: FollowRelationship[];
  followingCount: number;
  following?: FollowRelationship[];
  postCount: number;
  joinedAt: Date;
  updatedAt?: Date;
  uid: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string | null;
  providerId: string;
  introduction?: string;   // --
  userSettings?: UserSettings; // -
}
export interface FirebaseNoteContent {
  id: string;
  pageId: string;
  title: string;
  authorAvatar?: string;
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
  thumbnailUrl: string;
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

// It's used in MyPostSeries.tsx and across series services/components
export interface SeriesSubNote {
  id: string;
  title?: string;
  content?: string;
  thumbnailUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MySeries {
  id: string;
  title: string;
  userId?: string;
  authorEmail?: string;
  authorName?: string;
  authorAvatar?: string;
  thumbnailUrl?: string;
  content?: string;
  description?: string;
  isTrashed?: boolean;
  trashedAt?: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  comments?: Comment[];
  subNotes?: SeriesSubNote[];
  tags?: TagType[];
  createdAt: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

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

// Inbox system interfaces
export interface InboxItem {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'reply' | 'new_post';
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
