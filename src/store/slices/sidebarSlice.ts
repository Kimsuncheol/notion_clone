import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchFolders, fetchAllPages, fetchAllNotesWithStatus, initializeDefaultFolders } from '@/services/firebase';

export interface PageNode {
  id: string;
  name: string;
}

interface FolderNode {
  id: string;
  name: string;
  isOpen: boolean;
  folderType?: 'private' | 'public' | 'custom' | 'trash';
  pages: PageNode[];
}

interface SidebarState {
  folders: FolderNode[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: SidebarState = {
  folders: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk to load sidebar data from Firebase
export const loadSidebarData = createAsyncThunk(
  'sidebar/loadData',
  async (_, { rejectWithValue }) => {
    try {
      // Initialize default folders first
      await initializeDefaultFolders();
      
      const [firebaseFolders, firebasePages, notesWithStatus] = await Promise.all([
        fetchFolders(),
        fetchAllPages(),
        fetchAllNotesWithStatus()
      ]);

      // Create a map of note statuses for quick lookup
      const noteStatusMap = new Map(
        notesWithStatus.map(note => [note.pageId, { isPublic: note.isPublic, isTrashed: note.isTrashed, title: note.title }])
      );

      // Group pages by their actual public/private/trash status from notes, not by folder assignment
      const foldersWithPages = firebaseFolders.map(folder => {
        let pages: PageNode[] = [];

        if (folder.folderType === 'private') {
          // Private folder gets all private notes that are not trashed
          pages = firebasePages
            .filter(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return noteStatus && !noteStatus.isPublic && !noteStatus.isTrashed;
            })
            .map(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return {
                id: page.id,
                name: noteStatus?.title || page.name
              };
            });
        } else if (folder.folderType === 'public') {
          // Public folder gets all public notes that are not trashed
          pages = firebasePages
            .filter(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return noteStatus && noteStatus.isPublic && !noteStatus.isTrashed;
            })
            .map(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return {
                id: page.id,
                name: noteStatus?.title || page.name
              };
            });
        } else if (folder.folderType === 'trash') {
          // Trash folder gets all trashed notes
          pages = firebasePages
            .filter(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return noteStatus && noteStatus.isTrashed;
            })
            .map(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return {
                id: page.id,
                name: noteStatus?.title || page.name
              };
            });
        } else {
          // Custom folders remain empty since all notes are now organized by public/private/trash status
          pages = [];
        }

        return {
          id: folder.id,
          name: folder.name,
          isOpen: folder.isOpen,
          folderType: folder.folderType || 'custom',
          pages
        };
      });

      // Sort folders: Private first, then Public, then Trash, then custom folders
      const sortedFolders = foldersWithPages.sort((a, b) => {
        const typeOrder = { private: 0, public: 1, trash: 2, custom: 3 };
        const aOrder = typeOrder[a.folderType] ?? 3;
        const bOrder = typeOrder[b.folderType] ?? 3;
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        // If same type, sort by creation date (name for now)
        return a.name.localeCompare(b.name);
      });

      return sortedFolders;
    } catch {
      return rejectWithValue('Failed to load workspace data');
    }
  }
);

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    addFolder: (state, action: PayloadAction<{ id: string; name: string; folderType?: 'private' | 'public' | 'custom' }>) => {
      state.folders.push({
        id: action.payload.id,
        name: action.payload.name,
        isOpen: true,
        folderType: action.payload.folderType || 'custom',
        pages: []
      });
    },
    addPage: (state, action: PayloadAction<{ folderId: string; id: string; name: string }>) => {
      const folder = state.folders.find(f => f.id === action.payload.folderId);
      if (folder) {
        folder.pages.push({
          id: action.payload.id,
          name: action.payload.name
        });
      }
    },
    toggleFolder: (state, action: PayloadAction<string>) => {
      const folder = state.folders.find(f => f.id === action.payload);
      if (folder) {
        folder.isOpen = !folder.isOpen;
      }
    },
    renameFolder: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const folder = state.folders.find(f => f.id === action.payload.id);
      if (folder) {
        folder.name = action.payload.name;
      }
    },
    renamePage: (state, action: PayloadAction<{ id: string; name: string }>) => {
      for (const folder of state.folders) {
        const page = folder.pages.find(p => p.id === action.payload.id);
        if (page) {
          page.name = action.payload.name;
          break;
        }
      }
    },
    updatePage: (state, action: PayloadAction<{ oldId: string; newId: string; name: string }>) => {
      for (const folder of state.folders) {
        const pageIndex = folder.pages.findIndex(p => p.id === action.payload.oldId);
        if (pageIndex !== -1) {
          folder.pages[pageIndex] = {
            id: action.payload.newId,
            name: action.payload.name
          };
          break;
        }
      }
    },
    deleteFolder: (state, action: PayloadAction<string>) => {
      state.folders = state.folders.filter(f => f.id !== action.payload);
    },
    deletePage: (state, action: PayloadAction<string>) => {
      for (const folder of state.folders) {
        folder.pages = folder.pages.filter(p => p.id !== action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    movePageBetweenFolders: (state, action: PayloadAction<{ pageId: string; isPublic: boolean; title: string }>) => {
      const { pageId, isPublic, title } = action.payload;
      
      // Remove the page from all folders first
      for (const folder of state.folders) {
        folder.pages = folder.pages.filter(p => p.id !== pageId);
      }
      
      // Add the page to the appropriate folder based on isPublic status
      const targetFolder = state.folders.find(f => 
        isPublic ? f.folderType === 'public' : f.folderType === 'private'
      );
      
      if (targetFolder) {
        targetFolder.pages.push({
          id: pageId,
          name: title
        });
      }
    },
    movePageToTrash: (state, action: PayloadAction<{ pageId: string; title: string }>) => {
      const { pageId, title } = action.payload;
      
      // Remove the page from all folders first
      for (const folder of state.folders) {
        folder.pages = folder.pages.filter(p => p.id !== pageId);
      }
      
      // Add the page to the trash folder
      const trashFolder = state.folders.find(f => f.folderType === 'trash');
      if (trashFolder) {
        trashFolder.pages.push({
          id: pageId,
          name: title
        });
      }
    },
    restorePageFromTrash: (state, action: PayloadAction<{ pageId: string; title: string; isPublic: boolean }>) => {
      const { pageId, title, isPublic } = action.payload;
      
      // Remove the page from trash folder
      for (const folder of state.folders) {
        folder.pages = folder.pages.filter(p => p.id !== pageId);
      }
      
      // Add the page to the appropriate folder based on original location
      const targetFolder = state.folders.find(f => 
        isPublic ? f.folderType === 'public' : f.folderType === 'private'
      );
      
      if (targetFolder) {
        targetFolder.pages.push({
          id: pageId,
          name: title
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSidebarData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSidebarData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(loadSidebarData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addFolder,
  addPage,
  toggleFolder,
  renameFolder,
  renamePage,
  updatePage,
  deleteFolder,
  deletePage,
  clearError,
  movePageBetweenFolders,
  movePageToTrash,
  restorePageFromTrash
} = sidebarSlice.actions;

export default sidebarSlice.reducer; 