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

export interface FirebaseNoteContent {
  id: string;
  pageId: string;
  title: string;
  content: string;
  publishContent?: string;
  userId: string;
  authorEmail?: string;
  authorName?: string;
  isPublic?: boolean;
  isPublished?: boolean;
  thumbnail?: string;
  isTrashed?: boolean;
  trashedAt?: Date;
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

export interface FirebaseSubNoteContent extends FirebaseNoteContent {
  parentId: string;
}

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
}

export interface FavoriteNote {
  id: string;
  userId: string;
  noteId: string;
  noteTitle: string;
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
}

export interface FavoriteNote {
  id: string;
  userId: string;
  noteId: string;
  noteTitle: string;
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