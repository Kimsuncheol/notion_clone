import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchFolders, fetchAllPages } from '@/services/firebase';

export interface PageNode {
  id: string;
  name: string;
}

interface FolderNode {
  id: string;
  name: string;
  isOpen: boolean;
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
      const [firebaseFolders, firebasePages] = await Promise.all([
        fetchFolders(),
        fetchAllPages()
      ]);

      // Group pages by folder
      const foldersWithPages = firebaseFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        isOpen: folder.isOpen,
        pages: firebasePages.filter(page => page.folderId === folder.id).map(page => ({
          id: page.id,
          name: page.name
        }))
      }));

      return foldersWithPages;
    } catch {
      return rejectWithValue('Failed to load workspace data');
    }
  }
);

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    addFolder: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.folders.push({
        id: action.payload.id,
        name: action.payload.name,
        isOpen: true,
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
  clearError
} = sidebarSlice.actions;

export default sidebarSlice.reducer; 