import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Block, TextBlock, StyledTextBlock } from '@/types/blocks';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

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
  blocks: Block[];
  userId: string;
  authorEmail?: string;
  authorName?: string;
  isPublic?: boolean;
  isTrashed?: boolean;
  trashedAt?: Date;
  originalLocation?: { isPublic: boolean };
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicNote {
  id: string;
  title: string;
  authorId: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
  preview?: string; // First few lines of content
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

// Get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Fetch all folders for the current user
export const fetchFolders = async (): Promise<FirebaseFolder[]> => {
  try {
    const userId = getCurrentUserId();
    const foldersRef = collection(db, 'folders');
    const q = query(
      foldersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirebaseFolder[];
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
};

// Fetch all pages for a specific folder
export const fetchPages = async (folderId: string): Promise<FirebasePage[]> => {
  try {
    const userId = getCurrentUserId();
    const pagesRef = collection(db, 'pages');
    const q = query(
      pagesRef,
      where('userId', '==', userId),
      where('folderId', '==', folderId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirebasePage[];
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

// Fetch all pages for the current user (for sidebar)
export const fetchAllPages = async (): Promise<FirebasePage[]> => {
  try {
    const userId = getCurrentUserId();
    const pagesRef = collection(db, 'pages');
    const q = query(
      pagesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FirebasePage[];
  } catch (error) {
    console.error('Error fetching all pages:', error);
    throw error;
  }
};

// Fetch all notes with their public status for sidebar organization
export const fetchAllNotesWithStatus = async (): Promise<Array<{ pageId: string; title: string; isPublic: boolean; isTrashed: boolean; originalLocation?: { isPublic: boolean }; createdAt: Date }>> => {
  try {
    const userId = getCurrentUserId();
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        pageId: doc.id,
        title: data.title || 'Untitled',
        isPublic: data.isPublic || false,
        isTrashed: data.isTrashed || false,
        originalLocation: data.originalLocation || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching notes with status:', error);
    throw error;
  }
};

// Fetch note content for a specific page
export const fetchNoteContent = async (pageId: string): Promise<FirebaseNoteContent | null> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      const data = noteSnap.data();
      // Verify the note belongs to the current user
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to note');
      }
      
      return {
        id: noteSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FirebaseNoteContent;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching note content:', error);
    throw error;
  }
};

// Helper function to sanitize data for Firestore (remove undefined values)
const sanitizeForFirestore = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// Update note content
export const updateNoteContent = async (pageId: string, title: string, blocks: Block[], isPublic?: boolean): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const noteRef = doc(db, 'notes', pageId);
    const now = new Date();
    
    // Sanitize blocks to remove undefined values
    const sanitizedBlocks = sanitizeForFirestore(blocks);
    
    const noteData = {
      pageId,
      title: title || '',
      blocks: sanitizedBlocks,
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublic || false,
      updatedAt: now,
      createdAt: now, // Will only be set on first creation
    };
    
    await setDoc(noteRef, noteData, { merge: true });
  } catch (error) {
    console.error('Error updating note content:', error);
    throw error;
  }
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
      blocks: [],
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: isPublicFolder || false, // Set public status based on folder type
      isTrashed: false,     // Set to false by default, Don't touch this when implementing another one.
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, 'notes', pageRef.id), initialNoteData);
    
    return pageRef.id;
  } catch (error) {
    console.error('Error adding note page:', error);
    throw error;
  }
};

// Add a new folder
export const addFolder = async (name: string, folderType: 'private' | 'public' | 'custom' = 'custom'): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();
    
    const folderRef = await addDoc(collection(db, 'folders'), {
      name,
      isOpen: true,
      userId,
      folderType,
      createdAt: now,
      updatedAt: now,
    });
    
    return folderRef.id;
  } catch (error) {
    console.error('Error adding folder:', error);
    throw error;
  }
};

// Update page name
export const updatePageName = async (pageId: string, name: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const pageRef = doc(db, 'pages', pageId);
    
    // Verify ownership before updating
    const pageSnap = await getDoc(pageRef);
    if (!pageSnap.exists() || pageSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to page');
    }
    
    await updateDoc(pageRef, {
      name,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating page name:', error);
    throw error;
  }
};

// Update folder name
export const updateFolderName = async (folderId: string, name: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const folderRef = doc(db, 'folders', folderId);
    
    // Verify ownership before updating
    const folderSnap = await getDoc(folderRef);
    if (!folderSnap.exists() || folderSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to folder');
    }
    
    await updateDoc(folderRef, {
      name,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating folder name:', error);
    throw error;
  }
};

// Delete a page and its associated note content
export const deletePage = async (pageId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const pageRef = doc(db, 'pages', pageId);
    const noteRef = doc(db, 'notes', pageId);
    
    // Verify ownership before deleting
    const pageSnap = await getDoc(pageRef);
    if (!pageSnap.exists() || pageSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to page');
    }
    
    // Also clean up any favorites that reference this note
    const favoritesRef = collection(db, 'favorites');
    const favoritesQuery = query(
      favoritesRef,
      where('userId', '==', userId),
      where('noteId', '==', pageId)
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    // Delete the page, its note content, and any favorites
    const deletionPromises = [
      deleteDoc(pageRef),
      deleteDoc(noteRef),
      // Delete all favorite documents that reference this note
      ...favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    ];
    
    await Promise.all(deletionPromises);
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
};

// Delete a folder and all its pages
export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const folderRef = doc(db, 'folders', folderId);
    
    // Verify ownership before deleting
    const folderSnap = await getDoc(folderRef);
    if (!folderSnap.exists() || folderSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to folder');
    }
    
    // Get all pages in this folder
    const pages = await fetchPages(folderId);
    
    // Delete all pages and their note content
    const deletePromises = pages.map(page => deletePage(page.id));
    await Promise.all(deletePromises);
    
    // Delete the folder itself
    await deleteDoc(folderRef);
  } catch (error) {
    console.error('Error deleting folder:', error);
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
          where('isTrashed', '==', false),
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        )
      : query(
          notesRef,
          where('isPublic', '==', true),
          where('isTrashed', '==', false),
          orderBy('updatedAt', 'desc')
        );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Create preview from blocks
      const preview = data.blocks
        ?.slice(0, 2)
        ?.map((block: Block) => {
          if (block.type === 'text' || block.type === 'styled') {
            return (block as TextBlock | StyledTextBlock).content || '';
          }
          return '';
        })
        ?.filter(Boolean)
        ?.join(' ')
        ?.substring(0, 150) || '';

      return {
        id: doc.id,
        title: data.title || 'Untitled',
        authorId: data.userId,
        authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        preview: preview + (preview.length >= 150 ? '...' : ''),
      };
    }) as PublicNote[];
  } catch (error) {
    console.error('Error fetching public notes:', error);
    throw error;
  }
};

// Search public notes
export const searchPublicNotes = async (searchTerm: string, limit: number = 10): Promise<PublicNote[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      where('isTrashed', '==', false), // Exclude trashed notes
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // Filter results by search term (client-side filtering since Firestore doesn't support full-text search)
    const results = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const preview = data.blocks
          ?.slice(0, 2)
          ?.map((block: Block) => {
            if (block.type === 'text' || block.type === 'styled') {
              return (block as TextBlock | StyledTextBlock).content || '';
            }
            return '';
          })
          ?.filter(Boolean)
          ?.join(' ')
          ?.substring(0, 150) || '';

        return {
          id: doc.id,
          title: data.title || 'Untitled',
          authorId: data.userId,
          authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          preview: preview + (preview.length >= 150 ? '...' : ''),
        };
      })
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, limit);

    return results as PublicNote[];
  } catch (error) {
    console.error('Error searching public notes:', error);
    throw error;
  }
};

// Fetch public note content (anyone can read public notes)
export const fetchPublicNoteContent = async (pageId: string): Promise<FirebaseNoteContent | null> => {
  try {
    const noteRef = doc(db, 'notes', pageId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      const data = noteSnap.data();
      // Only return if the note is public
      if (!data.isPublic) {
        throw new Error('Note is not public');
      }
      
      return {
        id: noteSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FirebaseNoteContent;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching public note content:', error);
    throw error;
  }
};

// Toggle note public status
export const toggleNotePublic = async (pageId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', pageId);
    
    // Get current note to verify ownership
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists() || noteSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to note');
    }
    
    const currentIsPublic = noteSnap.data().isPublic || false;
    const newIsPublic = !currentIsPublic;
    
    await updateDoc(noteRef, {
      isPublic: newIsPublic,
      updatedAt: new Date(),
    });
    
    return newIsPublic;
  } catch (error) {
    console.error('Error toggling note public status:', error);
    throw error;
  }
};

// Delete all custom folders (keep only Private and Public folders)
export const deleteAllCustomFolders = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const foldersRef = collection(db, 'folders');
    const q = query(
      foldersRef,
      where('userId', '==', userId),
      where('folderType', '==', 'custom')
    );
    const snapshot = await getDocs(q);
    
    // Delete all custom folders and their pages
    const deletePromises = snapshot.docs.map(doc => deleteFolder(doc.id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting custom folders:', error);
    throw error;
  }
};

// Initialize default folders for new users
export const initializeDefaultFolders = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const foldersRef = collection(db, 'folders');
    const q = query(
      foldersRef,
      where('userId', '==', userId),
      where('folderType', 'in', ['private', 'public', 'trash'])
    );
    const snapshot = await getDocs(q);
    
    // Check if default folders already exist
    const existingTypes = snapshot.docs.map(doc => doc.data().folderType);
    
    const now = new Date();
    const foldersToCreate = [];
    
    if (!existingTypes.includes('private')) {
      foldersToCreate.push({
        name: 'Private',
        isOpen: true,
        userId,
        folderType: 'private',
        createdAt: now,
        updatedAt: now,
      });
    }
    
    if (!existingTypes.includes('public')) {
      foldersToCreate.push({
        name: 'Public',
        isOpen: true,
        userId,
        folderType: 'public',
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!existingTypes.includes('trash')) {
      foldersToCreate.push({
        name: 'Trash',
        isOpen: true,
        userId,
        folderType: 'trash',
        createdAt: now,
        updatedAt: now,
      });
    }
    
    // Create missing default folders
    for (const folderData of foldersToCreate) {
      await addDoc(foldersRef, folderData);
    }
  } catch (error) {
    console.error('Error initializing default folders:', error);
    throw error;
  }
};

// Workspace management functions

// Fetch all workspaces for the current user
export const fetchWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const userId = getCurrentUserId();
    const workspacesRef = collection(db, 'workspaces');
    const q = query(
      workspacesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Workspace[];
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

// Create a new workspace
export const createWorkspace = async (name: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();
    
    // First, set all existing workspaces to inactive
    const existingWorkspaces = await fetchWorkspaces();
    const updatePromises = existingWorkspaces.map(workspace => 
      updateDoc(doc(db, 'workspaces', workspace.id), { isActive: false, updatedAt: now })
    );
    await Promise.all(updatePromises);
    
    // Create the new workspace as active
    const workspaceRef = await addDoc(collection(db, 'workspaces'), {
      name,
      userId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    // Initialize default folders for the new workspace
    await initializeDefaultFolders();
    
    return workspaceRef.id;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
};

// Switch to a different workspace
export const switchWorkspace = async (workspaceId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const now = new Date();
    
    // Verify the workspace belongs to the current user
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (!workspaceSnap.exists() || workspaceSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to workspace');
    }
    
    // Set all workspaces to inactive
    const existingWorkspaces = await fetchWorkspaces();
    const updatePromises = existingWorkspaces.map(workspace => 
      updateDoc(doc(db, 'workspaces', workspace.id), { 
        isActive: workspace.id === workspaceId, 
        updatedAt: now 
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error switching workspace:', error);
    throw error;
  }
};

// Get the current active workspace
export const getCurrentWorkspace = async (): Promise<Workspace | null> => {
  try {
    const userId = getCurrentUserId();
    const workspacesRef = collection(db, 'workspaces');
    const q = query(
      workspacesRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Workspace;
  } catch (error) {
    console.error('Error getting current workspace:', error);
    throw error;
  }
};

// Delete a workspace and all its data
export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    
    // Verify ownership
    const workspaceSnap = await getDoc(workspaceRef);
    if (!workspaceSnap.exists() || workspaceSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to workspace');
    }
    
    // Delete all folders and their pages in this workspace
    // Note: In a real implementation, you might want to add workspaceId to folders/pages
    // For now, we'll delete all custom folders
    await deleteAllCustomFolders();
    
    // Delete the workspace
    await deleteDoc(workspaceRef);
    
    // If this was the active workspace, make another one active
    const remainingWorkspaces = await fetchWorkspaces();
    if (remainingWorkspaces.length > 0) {
      await switchWorkspace(remainingWorkspaces[0].id);
    }
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};

// Update workspace name
export const updateWorkspaceName = async (workspaceId: string, name: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    
    // Verify ownership before updating
    const workspaceSnap = await getDoc(workspaceRef);
    if (!workspaceSnap.exists() || workspaceSnap.data().userId !== userId) {
      throw new Error('Unauthorized access to workspace');
    }
    
    await updateDoc(workspaceRef, {
      name,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating workspace name:', error);
    throw error;
  }
};

// Initialize default workspace for new users
export const initializeDefaultWorkspace = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    const workspacesRef = collection(db, 'workspaces');
    const q = query(workspacesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    // If no workspaces exist, create a default one
    if (snapshot.empty) {
      const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
      await createWorkspace(`${userName}'s Workspace`);
    }
  } catch (error) {
    console.error('Error initializing default workspace:', error);
    throw error;
  }
}; 

// Member management interfaces and functions
export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  invitedBy: string;
  isActive: boolean;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
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

// Get workspace members
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  try {
    const membersRef = collection(db, 'workspaceMembers');
    const q = query(
      membersRef,
      where('workspaceId', '==', workspaceId),
      where('isActive', '==', true),
      orderBy('joinedAt', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date(),
    })) as WorkspaceMember[];
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    throw error;
  }
};

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

// Get user's workspace role
export const getUserWorkspaceRole = async (workspaceId: string, userId?: string): Promise<'owner' | 'editor' | 'viewer' | null> => {
  try {
    const currentUserId = userId || getCurrentUserId();
    
    // Check if user is owner
    if (await isWorkspaceOwner(workspaceId, currentUserId)) {
      return 'owner';
    }
    
    // Check if user is a member
    const membersRef = collection(db, 'workspaceMembers');
    const q = query(
      membersRef,
      where('workspaceId', '==', workspaceId),
      where('userId', '==', currentUserId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data().role as 'editor' | 'viewer';
  } catch (error) {
    console.error('Error getting user workspace role:', error);
    return null;
  }
};

// Send workspace invitation
export const sendWorkspaceInvitation = async (
  workspaceId: string,
  inviteeEmail: string,
  role: 'editor' | 'viewer'
): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    
    // Verify user is workspace owner
    if (!(await isWorkspaceOwner(workspaceId, userId))) {
      throw new Error('Only workspace owners can send invitations');
    }
    
    // Get workspace info
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    if (!workspaceSnap.exists()) {
      throw new Error('Workspace not found');
    }
    const workspaceData = workspaceSnap.data();
    
    // Check if user is already a member
    const existingMembers = await getWorkspaceMembers(workspaceId);
    const isAlreadyMember = existingMembers.some(member => member.email === inviteeEmail);
    if (isAlreadyMember) {
      throw new Error('User is already a member of this workspace');
    }
    
    // Check if invitation already exists
    const invitationsRef = collection(db, 'workspaceInvitations');
    const existingInvitationQuery = query(
      invitationsRef,
      where('workspaceId', '==', workspaceId),
      where('inviteeEmail', '==', inviteeEmail),
      where('status', '==', 'pending')
    );
    const existingInvitationSnap = await getDocs(existingInvitationQuery);
    if (!existingInvitationSnap.empty) {
      throw new Error('Invitation already sent to this user');
    }
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Create invitation
    const invitationData = {
      workspaceId,
      workspaceName: workspaceData.name,
      inviterUserId: userId,
      inviterName: user?.displayName || user?.email?.split('@')[0] || 'Unknown',
      inviterEmail: user?.email || '',
      inviteeEmail,
      role,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };
    
    const invitationRef = await addDoc(invitationsRef, invitationData);
    
    // Send notification to invitee (if they have an account)
    await createNotificationForEmail(inviteeEmail, {
      type: 'workspace_invitation',
      title: 'Workspace Invitation',
      message: `${invitationData.inviterName} invited you to join "${workspaceData.name}" workspace`,
      data: {
        workspaceId,
        workspaceName: workspaceData.name,
        inviterName: invitationData.inviterName,
        role,
        invitationId: invitationRef.id,
      },
    });
    
    return invitationRef.id;
  } catch (error) {
    console.error('Error sending workspace invitation:', error);
    throw error;
  }
};

// Get pending invitations for user
export const getUserInvitations = async (): Promise<WorkspaceInvitation[]> => {
  try {
    const user = auth.currentUser;
    if (!user?.email) {
      return [];
    }
    
    const invitationsRef = collection(db, 'workspaceInvitations');
    const q = query(
      invitationsRef,
      where('inviteeEmail', '==', user.email),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate() || new Date(),
    })) as WorkspaceInvitation[];
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    throw error;
  }
};

// Accept workspace invitation
export const acceptWorkspaceInvitation = async (invitationId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    
    // Get invitation
    const invitationRef = doc(db, 'workspaceInvitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);
    
    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }
    
    const invitationData = invitationSnap.data();
    
    // Verify invitation is for current user
    if (invitationData.inviteeEmail !== user?.email) {
      throw new Error('Unauthorized to accept this invitation');
    }
    
    // Check if invitation is still valid
    if (invitationData.status !== 'pending') {
      throw new Error('Invitation is no longer valid');
    }
    
    if (new Date() > invitationData.expiresAt?.toDate()) {
      throw new Error('Invitation has expired');
    }
    
    const now = new Date();
    
    // Add user as workspace member
    const memberData = {
      workspaceId: invitationData.workspaceId,
      userId,
      email: user?.email || '',
      name: user?.displayName || user?.email?.split('@')[0] || 'Unknown',
      role: invitationData.role,
      joinedAt: now,
      invitedBy: invitationData.inviterUserId,
      isActive: true,
    };
    
    await addDoc(collection(db, 'workspaceMembers'), memberData);
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
      updatedAt: now,
    });
    
    // Send notification to workspace owner
    await createNotification(invitationData.inviterUserId, {
      type: 'member_added',
      title: 'Member Joined',
      message: `${memberData.name} accepted your invitation to join "${invitationData.workspaceName}"`,
      data: {
        workspaceId: invitationData.workspaceId,
        workspaceName: invitationData.workspaceName,
        memberName: memberData.name,
        memberEmail: memberData.email,
      },
    });
  } catch (error) {
    console.error('Error accepting workspace invitation:', error);
    throw error;
  }
};

// Decline workspace invitation
export const declineWorkspaceInvitation = async (invitationId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    // Get invitation
    const invitationRef = doc(db, 'workspaceInvitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);
    
    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }
    
    const invitationData = invitationSnap.data();
    
    // Verify invitation is for current user
    if (invitationData.inviteeEmail !== user?.email) {
      throw new Error('Unauthorized to decline this invitation');
    }
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'declined',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error declining workspace invitation:', error);
    throw error;
  }
};

// Change member role (owner only)
export const changeMemberRole = async (
  workspaceId: string,
  memberId: string,
  newRole: 'editor' | 'viewer'
): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    
    // Verify user is workspace owner
    if (!(await isWorkspaceOwner(workspaceId, userId))) {
      throw new Error('Only workspace owners can change member roles');
    }
    
    const memberRef = doc(db, 'workspaceMembers', memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (!memberSnap.exists()) {
      throw new Error('Member not found');
    }
    
    const memberData = memberSnap.data();
    
    // Update member role
    await updateDoc(memberRef, {
      role: newRole,
      updatedAt: new Date(),
    });
    
    // Send notification to member
    await createNotification(memberData.userId, {
      type: 'role_changed',
      title: 'Role Updated',
      message: `Your role has been changed to ${newRole} in the workspace`,
      data: {
        workspaceId,
        newRole,
      },
    });
  } catch (error) {
    console.error('Error changing member role:', error);
    throw error;
  }
};

// Remove member from workspace (owner only)
export const removeMemberFromWorkspace = async (
  workspaceId: string,
  memberId: string
): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    
    // Verify user is workspace owner
    if (!(await isWorkspaceOwner(workspaceId, userId))) {
      throw new Error('Only workspace owners can remove members');
    }
    
    const memberRef = doc(db, 'workspaceMembers', memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (!memberSnap.exists()) {
      throw new Error('Member not found');
    }
    
    const memberData = memberSnap.data();
    
    // Mark member as inactive instead of deleting
    await updateDoc(memberRef, {
      isActive: false,
      removedAt: new Date(),
    });
    
    // Send notification to member
    await createNotification(memberData.userId, {
      type: 'member_removed',
      title: 'Removed from Workspace',
      message: `You have been removed from the workspace`,
      data: {
        workspaceId,
      },
    });
  } catch (error) {
    console.error('Error removing member from workspace:', error);
    throw error;
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
      throw new Error('Note is already in favorites');
    }
    
    // Get note title
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);
    const noteTitle = noteSnap.exists() ? noteSnap.data().title || 'Untitled' : 'Untitled';
    
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
      throw new Error('Note is not in favorites');
    }
    
    // Remove all matching favorites (should be only one)
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

// Duplicate note function
export const duplicateNote = async (noteId: string): Promise<string> => {
  try {
    const userId = getCurrentUserId();
    const user = auth.currentUser;
    
    // Get the original note content
    const originalNoteRef = doc(db, 'notes', noteId);
    const originalNoteSnap = await getDoc(originalNoteRef);
    
    if (!originalNoteSnap.exists()) {
      throw new Error('Original note not found');
    }
    
    const originalNoteData = originalNoteSnap.data();
    
    // Verify the user owns the note
    if (originalNoteData.userId !== userId) {
      throw new Error('Unauthorized to duplicate this note');
    }
    
    // Get the original page to determine folder
    const originalPageRef = doc(db, 'pages', noteId);
    const originalPageSnap = await getDoc(originalPageRef);
    let folderId = '';
    
    if (originalPageSnap.exists()) {
      folderId = originalPageSnap.data().folderId;
    } else {
      // If page doesn't exist, put in Private folder
      const folders = await fetchFolders();
      const privateFolder = folders.find(f => f.folderType === 'private');
      if (privateFolder) {
        folderId = privateFolder.id;
      } else {
        throw new Error('No folder found for duplicate note');
      }
    }
    
    // Generate duplicate title with (n) suffix
    let duplicateTitle = originalNoteData.title || 'Untitled';
    const baseTitle = duplicateTitle;
    
    // Check for existing duplicates and find the next number
    const allPages = await fetchAllPages();
    const existingTitles = allPages.map(p => p.name);
    
    let counter = 1;
    while (existingTitles.includes(duplicateTitle)) {
      duplicateTitle = `${baseTitle} (${counter})`;
      counter++;
    }
    
    const now = new Date();
    
    // Create new page
    const newPageRef = await addDoc(collection(db, 'pages'), {
      name: duplicateTitle,
      folderId,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create duplicate note content
    const duplicateNoteData = {
      pageId: newPageRef.id,
      title: duplicateTitle,
      blocks: originalNoteData.blocks || [],
      userId,
      authorEmail: user?.email || '',
      authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      isPublic: false, // Always make duplicates private
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, 'notes', newPageRef.id), duplicateNoteData);
    
      return newPageRef.id;
} catch (error) {
  console.error('Error duplicating note:', error);
  throw error;
}
};

// Move note to trash
export const moveToTrash = async (noteId: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    const noteRef = doc(db, 'notes', noteId);
    
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
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: 'user' | 'admin';
  senderEmail: string;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
}

// Create or get existing support conversation
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

    // Update conversation with last message and increment unread count
    const conversationRef = doc(db, 'helpSupport', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const currentData = conversationSnap.data();
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageAt: now,
        unreadCount: sender === 'user' ? (currentData.unreadCount || 0) + 1 : 0,
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