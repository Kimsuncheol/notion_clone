import { UserProfile } from "firebase/auth";

export interface LikeUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  joinedAt: Date;
}

export interface CustomUserProfile extends UserProfile {
  id: string;
  bio?: string;
  github?: string;
  website?: string;
  location?: string;
  skills?: skillsType[];
  likedNotes?: FirebaseNoteContent[];
  recentlyReadNotes?: FirebaseNoteContent[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: Date;
  updatedAt?: Date;
}

// Serializable version for passing to client components
export interface SerializableUserProfile {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  bio?: string;
  github?: string;
  website?: string;
  location?: string;
  skills?: skillsType[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: Date;
  updatedAt?: Date;
  uid: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
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

// Add new interface for tag statistics
export interface TagStat {
  tag: string;
  count: number;
}

// Add new interface for tag search results
export interface TagSearchResult {
  notes: PublicNote[];
  totalCount: number;
  relatedTags: TagStat[];
}

export interface TagType {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
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


export interface LikedReadItem {
  id: string
  title: string
  description: string
  thumbnail: string
  authorId: string
  authorName: string
  authorAvatar?: string
  viewCount: number
  likeCount: number
  createdAt: Date
  tags?: string[]
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