import { UserProfile } from "firebase/auth";

export interface CustomUserProfile extends UserProfile {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  bio?: string;
  github?: string;
  website?: string;
  location?: string;
  skills?: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: Date;
  updatedAt: Date;
}
export interface FirebaseFolder {
  id: string;
  name: string;
  isOpen: boolean;
  userId: string;
  folderType?: 'private' | 'public' | 'custom' | 'trash';
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebasePage {
  id: string;
  name: string;
  folderId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Series {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface FirebaseNoteContent {
  id: string;
  pageId: string;
  title: string;
  content: string;
  description?: string;
  tags?: TagType[];
  series?: SeriesType | null;
  userId: string;
  authorEmail?: string;
  authorName?: string;
  isPublic?: boolean;
  isPublished?: boolean;
  thumbnailUrl?: string;
  viewCount?: number;
  likeCount?: number;
  likeUsers?: string[];
  originalLocation?: { isPublic: boolean };
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
    comments?: Array<{
      id: string;
      text: string;
      author: string;
      authorEmail: string;
      timestamp: Date;
    }>; // Nested comments (replies)
  }>; // Add comments field with nested structure
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
  isTrashed: boolean;
  trashedAt: Date;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
  }>;
}

export type MyPostSeries = Omit<FirebaseNoteContent,
 | 'isPublished'
 | 'originalLocation'
 | 'updatedAt'
 | 'recentlyOpenDate'
 | 'pageId'
 | 'isPublic'
 | 'content'
 | 'trashedAt'
 | 'isTrashed'
 | 'originalLocation'
 > 

export type SeriesType = Omit<MyPostSeries,
 'updatedAt' 
 | 'userId' 
 | 'content'
 | 'authorEmail'
 | 'authorName'
 | 'isTrashed'
 | 'trashedAt'
 | 'comments'
 | 'publishContent'
 | 'tags'
 | 'seriesId'
 | 'seriesTitle'
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
  userId: string;
  noteId: string; // Parent note ID
  noteTitle: string; // Parent note title
  addedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadProgress {
  progress: number; // 0-100
  downloadUrl?: string;
  error?: string;
}
export interface Workspace {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftedNote {
  id: string;
  title: string;
  content: string;
  userId: string;
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