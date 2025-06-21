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
  folderType?: 'private' | 'public' | 'custom';
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
export const fetchAllNotesWithStatus = async (): Promise<Array<{ pageId: string; title: string; isPublic: boolean; createdAt: Date }>> => {
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
    
    // Delete both the page and its note content
    await Promise.all([
      deleteDoc(pageRef),
      deleteDoc(noteRef)
    ]);
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
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        )
      : query(
          notesRef,
          where('isPublic', '==', true),
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
      where('folderType', 'in', ['private', 'public'])
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