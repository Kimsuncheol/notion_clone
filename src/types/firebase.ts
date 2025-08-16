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
  imageUrl?: string;
  // imagePickerType?: 'gallery' | 'upload' | 'link';
  imagePosition?: {
    x: number;
    y: number;
    // For resize,
    // width: number;
    // height: number;
  };
}

export interface FirebaseNoteWithSubNotes extends FirebaseNoteContent {
  subNotes: FirebaseSubNoteContent[];
}

export type FirebaseNoteForSubNote = Omit<FirebaseNoteContent, 'authorEmail' | 'authorName' | 'isPublished' | 'thumbnail' | 'isTrashed' | 'trashedAt' | 'originalLocation' | 'comments' | 'createdAt' | 'updatedAt' | 'recentlyOpenDate' | 'pageId' | 'isPublic'> & {
  id: string;
  parentId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
  isTrashed?: boolean;
};


export type MyPost = Omit<FirebaseNoteContent, | 'isPublished' | 'originalLocation' | 'createdAt' | 'updatedAt' | 'recentlyOpenDate' | 'pageId' | 'isPublic'> & {
  id: string;
  title: string;
  thumbnail: string;
  content: string;
  createdAt: string;
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
  subNotes: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
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
  noteId: string; // Parent note ID
  noteTitle: string; // Parent note title
  subNoteId?: string; // Optional sub-note ID if this favorite targets a sub-note
  subNoteTitle?: string; // Optional sub-note title
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

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrashedSubNote {
  id: string;
  title: string;
  parentId: string;
  parentTitle: string;
  trashedAt?: Date;
}

export interface FileUploadProgress {
  progress: number; // 0-100
  downloadUrl?: string;
  error?: string;
}