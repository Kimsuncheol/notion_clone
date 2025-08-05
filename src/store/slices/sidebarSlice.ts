import { createSlice, createAsyncThunk, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { fetchFolders, fetchAllPages, fetchAllNotesWithStatus, initializeDefaultFolders, fetchSubNotes } from '@/services/firebase';

export interface SubNoteNode {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface NoteNode {
  id: string;
  name: string;
  originalLocation?: { isPublic: boolean };
  recentlyOpenDate?: string;
  subNotes?: SubNoteNode[];
  subNotesLoaded?: boolean;
  subNotesLoading?: boolean;
}

export interface FolderNode {
  id: string;
  name: string;
  isOpen: boolean;
  folderType?: 'private' | 'public' | 'custom' | 'trash';
  notes: NoteNode[];
}

interface SidebarState {
  folders: FolderNode[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Utility function to get folder by type
const getFolderByType = (folders: FolderNode[], folderType: 'private' | 'public' | 'trash'): FolderNode | undefined => {
  return folders.find(f => f.folderType === folderType);
};

// Utility function to check if folder is a default system folder
const isDefaultFolder = (folderType?: string): boolean => {
  return folderType === 'private' || folderType === 'public' || folderType === 'trash';
};

// Utility function to determine target folder based on public status
const getTargetFolderByPublicStatus = (folders: FolderNode[], isPublic: boolean): FolderNode | undefined => {
  return getFolderByType(folders, isPublic ? 'public' : 'private');
};

const initialState: SidebarState = {
  folders: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk to load sub-notes for a specific note
export const loadSubNotes = createAsyncThunk(
  'sidebar/loadSubNotes',
  async (noteId: string, { rejectWithValue }) => {
    try {
      const subNotes = await fetchSubNotes(noteId);
      return { noteId, subNotes };
    } catch (error) {
      console.error(`Error fetching sub-notes for note ${noteId}:`, error);
      return rejectWithValue(`Failed to load sub-notes for note ${noteId}`);
    }
  }
);

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

      // Debug: Log the folders to see if there are duplicates
      console.log('Firebase folders:', firebaseFolders.map(f => ({ id: f.id, name: f.name, folderType: f.folderType })));

      // Remove duplicates based on folderType for default folders
      const uniqueFolders = firebaseFolders.reduce((acc, folder) => {
        if (folder.folderType && ['private', 'public', 'trash'].includes(folder.folderType)) {
          // For default folders, keep only the first one of each type
          const existingIndex = acc.findIndex(f => f.folderType === folder.folderType);
          if (existingIndex === -1) {
            acc.push(folder);
          } else {
            // Keep the one with the earlier creation date
            if (folder.createdAt < acc[existingIndex].createdAt) {
              acc[existingIndex] = folder;
            }
          }
        } else {
          // For custom folders, add all of them
          acc.push(folder);
        }
        return acc;
      }, [] as typeof firebaseFolders);

      console.log('Unique folders after deduplication:', uniqueFolders.map(f => ({ id: f.id, name: f.name, folderType: f.folderType })));

      // Create a map of note statuses for quick lookup
      const noteStatusMap = new Map(
        notesWithStatus.map(note => [note.pageId, { 
          isPublic: note.isPublic, 
          isTrashed: note.isTrashed, 
          title: note.title,
          originalLocation: note.originalLocation,
          recentlyOpenDate: note.recentlyOpenDate?.toISOString()
        }])
      );

      // Group pages by their actual public/private/trash status from notes, not by folder assignment
      const foldersWithPages = uniqueFolders.map(folder => {
        let notes: NoteNode[] = [];

        if (folder.folderType === 'private') {
          // Private folder gets all private notes that are not trashed
          notes = firebasePages
            .filter(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return noteStatus && !noteStatus.isPublic && !noteStatus.isTrashed;
            })
            .map(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return {
                id: page.id,
                name: noteStatus?.title || page.name,
                recentlyOpenDate: noteStatus?.recentlyOpenDate,
                subNotes: [],
                subNotesLoaded: false,
                subNotesLoading: false
              };
            });
        } else if (folder.folderType === 'public') {
          // Public folder gets all public notes that are not trashed
          notes = firebasePages
            .filter(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return noteStatus && noteStatus.isPublic && !noteStatus.isTrashed;
            })
            .map(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return {
                id: page.id,
                name: noteStatus?.title || page.name,
                recentlyOpenDate: noteStatus?.recentlyOpenDate,
                subNotes: [],
                subNotesLoaded: false,
                subNotesLoading: false
              };
            });
        } else if (folder.folderType === 'trash') {
          // Trash folder gets all trashed notes
          notes = firebasePages
            .filter(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return noteStatus && noteStatus.isTrashed;
            })
            .map(page => {
              const noteStatus = noteStatusMap.get(page.id);
              return {
                id: page.id,
                name: noteStatus?.title || page.name,
                originalLocation: noteStatus?.originalLocation,
                recentlyOpenDate: noteStatus?.recentlyOpenDate,
                subNotes: [],
                subNotesLoaded: false,
                subNotesLoading: false
              };
            });
        } else {
          // Custom folders remain empty since all notes are now organized by public/private/trash status
          notes = [];
        }

        return {
          id: folder.id,
          name: folder.name,
          isOpen: folder.isOpen,
          folderType: folder.folderType || 'custom',
          notes: notes.sort((a, b) => {
            const dateA = a.recentlyOpenDate ? new Date(a.recentlyOpenDate).getTime() : 0;
            const dateB = b.recentlyOpenDate ? new Date(b.recentlyOpenDate).getTime() : 0;
            return dateB - dateA;
          })
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

      console.log('Final sorted folders:', sortedFolders.map(f => ({ id: f.id, name: f.name, folderType: f.folderType })));

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
        notes: []
      });
    },
    addPage: (state, action: PayloadAction<{ folderId: string; id: string; name: string }>) => {
      const folder = state.folders.find(f => f.id === action.payload.folderId);
      if (folder) {
        folder.notes.push({
          id: action.payload.id,
          name: action.payload.name,
          subNotes: [],
          subNotesLoaded: false,
          subNotesLoading: false
        });
      }
    },
    addSubNote: (state, action: PayloadAction<{ noteId: string; subNote: SubNoteNode }>) => {
      const { noteId, subNote } = action.payload;
      for (const folder of state.folders) {
        const note = folder.notes.find(n => n.id === noteId);
        if (note) {
          if (!note.subNotes) {
            note.subNotes = [];
          }
          note.subNotes.push(subNote);
          // Sort sub-notes by creation date (newest first)
          note.subNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        }
      }
    },
    updateSubNote: (state, action: PayloadAction<{ noteId: string; subNoteId: string; title: string; updatedAt: Date }>) => {
      const { noteId, subNoteId, title, updatedAt } = action.payload;
      for (const folder of state.folders) {
        const note = folder.notes.find(n => n.id === noteId);
        if (note && note.subNotes) {
          const subNote = note.subNotes.find(sn => sn.id === subNoteId);
          if (subNote) {
            subNote.title = title;
            subNote.updatedAt = updatedAt;
            break;
          }
        }
      }
    },
    deleteSubNote: (state, action: PayloadAction<{ noteId: string; subNoteId: string }>) => {
      const { noteId, subNoteId } = action.payload;
      for (const folder of state.folders) {
        const note = folder.notes.find(n => n.id === noteId);
        if (note && note.subNotes) {
          note.subNotes = note.subNotes.filter(sn => sn.id !== subNoteId);
          break;
        }
      }
    },
    setSubNotesLoading: (state, action: PayloadAction<{ noteId: string; loading: boolean }>) => {
      const { noteId, loading } = action.payload;
      for (const folder of state.folders) {
        const note = folder.notes.find(n => n.id === noteId);
        if (note) {
          note.subNotesLoading = loading;
          break;
        }
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
        const note = folder.notes.find(n => n.id === action.payload.id);
        if (note) {
          note.name = action.payload.name;
          break;
        }
      }
    },
    updatePage: (state, action: PayloadAction<{ oldId: string; newId: string; name: string }>) => {
      for (const folder of state.folders) {
        const noteIndex = folder.notes.findIndex(n => n.id === action.payload.oldId);
        if (noteIndex !== -1) {
          const existingNote = folder.notes[noteIndex];
          folder.notes[noteIndex] = {
            id: action.payload.newId,
            name: action.payload.name,
            subNotes: existingNote.subNotes || [],
            subNotesLoaded: existingNote.subNotesLoaded || false,
            subNotesLoading: existingNote.subNotesLoading || false,
            originalLocation: existingNote.originalLocation,
            recentlyOpenDate: existingNote.recentlyOpenDate
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
        folder.notes = folder.notes.filter(n => n.id !== action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    moveNoteBetweenFolders: (state, action: PayloadAction<{ noteId: string; isPublic: boolean; title: string }>) => {
      const { noteId, isPublic, title } = action.payload;
      
      // Find and remove the note from its current folder, preserving sub-notes data
      let existingNote: NoteNode | null = null;
      for (const folder of state.folders) {
        const noteIndex = folder.notes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          existingNote = folder.notes[noteIndex];
          folder.notes.splice(noteIndex, 1);
          break;
        }
      }
      
      // Add the page to the appropriate folder based on isPublic status
      const targetFolder = getTargetFolderByPublicStatus(state.folders, isPublic);
      
      if (targetFolder) {
        targetFolder.notes.push({
          id: noteId,
          name: title,
          subNotes: existingNote?.subNotes || [],
          subNotesLoaded: existingNote?.subNotesLoaded || false,
          subNotesLoading: existingNote?.subNotesLoading || false,
          recentlyOpenDate: existingNote?.recentlyOpenDate
        });
      }
    },
    movePageToTrash: (state, action: PayloadAction<{ noteId: string; title: string }>) => {
      const { noteId, title } = action.payload;
      
      // Find and remove the note from its current folder, preserving sub-notes data
      let existingNote: NoteNode | null = null;
      for (const folder of state.folders) {
        const noteIndex = folder.notes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          existingNote = folder.notes[noteIndex];
          folder.notes.splice(noteIndex, 1);
          break;
        }
      }
      
      // Add the page to the trash folder
      const trashFolder = getFolderByType(state.folders, 'trash');
      if (trashFolder) {
        trashFolder.notes.push({
          id: noteId,
          name: title,
          subNotes: existingNote?.subNotes || [],
          subNotesLoaded: existingNote?.subNotesLoaded || false,
          subNotesLoading: existingNote?.subNotesLoading || false,
          originalLocation: existingNote?.originalLocation,
          recentlyOpenDate: existingNote?.recentlyOpenDate
        });
      }
    },
    restorePageFromTrash: (state, action: PayloadAction<{ pageId: string; title: string; isPublic: boolean }>) => {
      const { pageId, title, isPublic } = action.payload;
      
      // Find and remove the note from trash folder, preserving sub-notes data
      let existingNote: NoteNode | null = null;
      for (const folder of state.folders) {
        const noteIndex = folder.notes.findIndex(n => n.id === pageId);
        if (noteIndex !== -1) {
          existingNote = folder.notes[noteIndex];
          folder.notes.splice(noteIndex, 1);
          break;
        }
      }
      
      // Add the page to the appropriate folder based on original location
      const targetFolder = getTargetFolderByPublicStatus(state.folders, isPublic);
      
      if (targetFolder) {
        targetFolder.notes.push({
          id: pageId,
          name: title,
          subNotes: existingNote?.subNotes || [],
          subNotesLoaded: existingNote?.subNotesLoaded || false,
          subNotesLoading: existingNote?.subNotesLoading || false,
          recentlyOpenDate: existingNote?.recentlyOpenDate
        });
      }
    },
    updateNoteOrder: (state, action: PayloadAction<{ pageId: string }>) => {
      const { pageId } = action.payload;
      const now = new Date().toISOString();

      for (const folder of state.folders) {
        const noteIndex = folder.notes.findIndex(n => n.id === pageId);

        if (noteIndex !== -1) {
          const note = folder.notes[noteIndex];
          folder.notes[noteIndex] = { ...note, recentlyOpenDate: now };

          folder.notes.sort((a, b) => {
            const dateA = a.recentlyOpenDate ? new Date(a.recentlyOpenDate).getTime() : 0;
            const dateB = b.recentlyOpenDate ? new Date(b.recentlyOpenDate).getTime() : 0;
            return dateB - dateA;
          });
          break;
        }
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
      })
      .addCase(loadSubNotes.pending, (state, action) => {
        const noteId = action.meta.arg;
        for (const folder of state.folders) {
          const note = folder.notes.find(n => n.id === noteId);
          if (note) {
            note.subNotesLoading = true;
            break;
          }
        }
      })
      .addCase(loadSubNotes.fulfilled, (state, action) => {
        const { noteId, subNotes } = action.payload;
        for (const folder of state.folders) {
          const note = folder.notes.find(n => n.id === noteId);
          if (note) {
            note.subNotes = subNotes as unknown as SubNoteNode[];
            note.subNotesLoaded = true;
            note.subNotesLoading = false;
            break;
          }
        }
      })
      .addCase(loadSubNotes.rejected, (state, action) => {
        const noteId = action.meta.arg;
        for (const folder of state.folders) {
          const note = folder.notes.find(n => n.id === noteId);
          if (note) {
            note.subNotes = [];
            note.subNotesLoaded = true;
            note.subNotesLoading = false;
            break;
          }
        }
      });
  },
});

export const {
  addFolder,
  addPage,
  addSubNote,
  updateSubNote,
  deleteSubNote,
  setSubNotesLoading,
  toggleFolder,
  renameFolder,
  renamePage,
  updatePage,
  deleteFolder,
  deletePage,
  clearError,
  moveNoteBetweenFolders,
  movePageToTrash,
  restorePageFromTrash,
  updateNoteOrder
} = sidebarSlice.actions;

// Export utility functions for use in components
export { getFolderByType, isDefaultFolder, getTargetFolderByPublicStatus };

export default sidebarSlice.reducer; 

export const SidebarStore = configureStore({ reducer: sidebarSlice.reducer });
export type AppSidebarDispatch = typeof SidebarStore.dispatch;
// import { createSlice, createAsyncThunk, PayloadAction, configureStore } from '@reduxjs/toolkit';
// import { fetchFolders, fetchAllPages, fetchAllNotesWithStatus, initializeDefaultFolders } from '@/services/firebase';

// export interface NoteNode {
//   id: string;
//   name: string;
//   originalLocation?: { isPublic: boolean };
//   recentlyOpenDate?: string;
// }

// export interface FolderNode {
//   id: string;
//   name: string;
//   isOpen: boolean;
//   folderType?: 'private' | 'public' | 'custom' | 'trash';
//   notes: NoteNode[];
// }

// interface SidebarState {
//   folders: FolderNode[];
//   isLoading: boolean;
//   error: string | null;
//   lastUpdated: number | null;
// }

// // Utility function to get folder by type
// const getFolderByType = (folders: FolderNode[], folderType: 'private' | 'public' | 'trash'): FolderNode | undefined => {
//   return folders.find(f => f.folderType === folderType);
// };

// // Utility function to check if folder is a default system folder
// const isDefaultFolder = (folderType?: string): boolean => {
//   return folderType === 'private' || folderType === 'public' || folderType === 'trash';
// };

// // Utility function to determine target folder based on public status
// const getTargetFolderByPublicStatus = (folders: FolderNode[], isPublic: boolean): FolderNode | undefined => {
//   return getFolderByType(folders, isPublic ? 'public' : 'private');
// };

// const initialState: SidebarState = {
//   folders: [],
//   isLoading: false,
//   error: null,
//   lastUpdated: null,
// };

// // Async thunk to load sidebar data from Firebase
// export const loadSidebarData = createAsyncThunk(
//   'sidebar/loadData',
//   async (_, { rejectWithValue }) => {
//     try {
//       // Initialize default folders first
//       await initializeDefaultFolders();
      
//       const [firebaseFolders, firebasePages, notesWithStatus] = await Promise.all([
//         fetchFolders(),
//         fetchAllPages(),
//         fetchAllNotesWithStatus()
//       ]);

//       // Debug: Log the folders to see if there are duplicates
//       console.log('Firebase folders:', firebaseFolders.map(f => ({ id: f.id, name: f.name, folderType: f.folderType })));

//       // Remove duplicates based on folderType for default folders
//       const uniqueFolders = firebaseFolders.reduce((acc, folder) => {
//         if (folder.folderType && ['private', 'public', 'trash'].includes(folder.folderType)) {
//           // For default folders, keep only the first one of each type
//           const existingIndex = acc.findIndex(f => f.folderType === folder.folderType);
//           if (existingIndex === -1) {
//             acc.push(folder);
//           } else {
//             // Keep the one with the earlier creation date
//             if (folder.createdAt < acc[existingIndex].createdAt) {
//               acc[existingIndex] = folder;
//             }
//           }
//         } else {
//           // For custom folders, add all of them
//           acc.push(folder);
//         }
//         return acc;
//       }, [] as typeof firebaseFolders);

//       console.log('Unique folders after deduplication:', uniqueFolders.map(f => ({ id: f.id, name: f.name, folderType: f.folderType })));

//       // Create a map of note statuses for quick lookup
//       const noteStatusMap = new Map(
//         notesWithStatus.map(note => [note.pageId, { 
//           isPublic: note.isPublic, 
//           isTrashed: note.isTrashed, 
//           title: note.title,
//           originalLocation: note.originalLocation,
//           recentlyOpenDate: note.recentlyOpenDate?.toISOString()
//         }])
//       );

//       // Group pages by their actual public/private/trash status from notes, not by folder assignment
//       const foldersWithPages = uniqueFolders.map(folder => {
//         let notes: NoteNode[] = [];

//         if (folder.folderType === 'private') {
//           // Private folder gets all private notes that are not trashed
//           notes = firebasePages
//             .filter(page => {
//               const noteStatus = noteStatusMap.get(page.id);
//               return noteStatus && !noteStatus.isPublic && !noteStatus.isTrashed;
//             })
//             .map(page => {
//               const noteStatus = noteStatusMap.get(page.id);
//               return {
//                 id: page.id,
//                 name: noteStatus?.title || page.name,
//                 recentlyOpenDate: noteStatus?.recentlyOpenDate
//               };
//             });
//         } else if (folder.folderType === 'public') {
//           // Public folder gets all public notes that are not trashed
//           notes = firebasePages
//             .filter(page => {
//               const noteStatus = noteStatusMap.get(page.id);
//               return noteStatus && noteStatus.isPublic && !noteStatus.isTrashed;
//             })
//             .map(page => {
//               const noteStatus = noteStatusMap.get(page.id);
//               return {
//                 id: page.id,
//                 name: noteStatus?.title || page.name,
//                 recentlyOpenDate: noteStatus?.recentlyOpenDate
//               };
//             });
//         } else if (folder.folderType === 'trash') {
//           // Trash folder gets all trashed notes
//           notes = firebasePages
//             .filter(page => {
//               const noteStatus = noteStatusMap.get(page.id);
//               return noteStatus && noteStatus.isTrashed;
//             })
//             .map(page => {
//               const noteStatus = noteStatusMap.get(page.id);
//               return {
//                 id: page.id,
//                 name: noteStatus?.title || page.name,
//                 originalLocation: noteStatus?.originalLocation,
//                 recentlyOpenDate: noteStatus?.recentlyOpenDate
//               };
//             });
//         } else {
//           // Custom folders remain empty since all notes are now organized by public/private/trash status
//           notes = [];
//         }

//         return {
//           id: folder.id,
//           name: folder.name,
//           isOpen: folder.isOpen,
//           folderType: folder.folderType || 'custom',
//           notes: notes.sort((a, b) => {
//             const dateA = a.recentlyOpenDate ? new Date(a.recentlyOpenDate).getTime() : 0;
//             const dateB = b.recentlyOpenDate ? new Date(b.recentlyOpenDate).getTime() : 0;
//             return dateB - dateA;
//           })
//         };
//       });

//       // Sort folders: Private first, then Public, then Trash, then custom folders
//       const sortedFolders = foldersWithPages.sort((a, b) => {
//         const typeOrder = { private: 0, public: 1, trash: 2, custom: 3 };
//         const aOrder = typeOrder[a.folderType] ?? 3;
//         const bOrder = typeOrder[b.folderType] ?? 3;
        
//         if (aOrder !== bOrder) {
//           return aOrder - bOrder;
//         }
        
//         // If same type, sort by creation date (name for now)
//         return a.name.localeCompare(b.name);
//       });

//       console.log('Final sorted folders:', sortedFolders.map(f => ({ id: f.id, name: f.name, folderType: f.folderType })));

//       return sortedFolders;
//     } catch {
//       return rejectWithValue('Failed to load workspace data');
//     }
//   }
// );

// const sidebarSlice = createSlice({
//   name: 'sidebar',
//   initialState,
//   reducers: {
//     addFolder: (state, action: PayloadAction<{ id: string; name: string; folderType?: 'private' | 'public' | 'custom' }>) => {
//       state.folders.push({
//         id: action.payload.id,
//         name: action.payload.name,
//         isOpen: true,
//         folderType: action.payload.folderType || 'custom',
//         notes: []
//       });
//     },
//     addPage: (state, action: PayloadAction<{ folderId: string; id: string; name: string }>) => {
//       const folder = state.folders.find(f => f.id === action.payload.folderId);
//       if (folder) {
//         folder.notes.push({
//           id: action.payload.id,
//           name: action.payload.name
//         });
//       }
//     },
//     toggleFolder: (state, action: PayloadAction<string>) => {
//       const folder = state.folders.find(f => f.id === action.payload);
//       if (folder) {
//         folder.isOpen = !folder.isOpen;
//       }
//     },
//     renameFolder: (state, action: PayloadAction<{ id: string; name: string }>) => {
//       const folder = state.folders.find(f => f.id === action.payload.id);
//       if (folder) {
//         folder.name = action.payload.name;
//       }
//     },
//     renamePage: (state, action: PayloadAction<{ id: string; name: string }>) => {
//       for (const folder of state.folders) {
//         const note = folder.notes.find(n => n.id === action.payload.id);
//         if (note) {
//           note.name = action.payload.name;
//           break;
//         }
//       }
//     },
//     updatePage: (state, action: PayloadAction<{ oldId: string; newId: string; name: string }>) => {
//       for (const folder of state.folders) {
//         const noteIndex = folder.notes.findIndex(n => n.id === action.payload.oldId);
//         if (noteIndex !== -1) {
//           folder.notes[noteIndex] = {
//             id: action.payload.newId,
//             name: action.payload.name
//           };
//           break;
//         }
//       }
//     },
//     deleteFolder: (state, action: PayloadAction<string>) => {
//       state.folders = state.folders.filter(f => f.id !== action.payload);
//     },
//     deletePage: (state, action: PayloadAction<string>) => {
//       for (const folder of state.folders) {
//         folder.notes = folder.notes.filter(n => n.id !== action.payload);
//       }
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     moveNoteBetweenFolders: (state, action: PayloadAction<{ noteId: string; isPublic: boolean; title: string }>) => {
//       const { noteId, isPublic, title } = action.payload;
      
//       // Remove the page from all folders first
//       for (const folder of state.folders) {
//         folder.notes = folder.notes.filter(n => n.id !== noteId);
//       }
      
//       // Add the page to the appropriate folder based on isPublic status
//       const targetFolder = getTargetFolderByPublicStatus(state.folders, isPublic);
      
//       if (targetFolder) {
//         targetFolder.notes.push({
//           id: noteId,
//           name: title
//         });
//       }
//     },
//     movePageToTrash: (state, action: PayloadAction<{ noteId: string; title: string }>) => {
//       const { noteId, title } = action.payload;
      
//       // Remove the page from all folders first
//       for (const folder of state.folders) {
//         folder.notes = folder.notes.filter(n => n.id !== noteId);
//       }
      
//       // Add the page to the trash folder
//       const trashFolder = getFolderByType(state.folders, 'trash');
//       if (trashFolder) {
//         trashFolder.notes.push({
//           id: noteId,
//           name: title
//         });
//       }
//     },
//     restorePageFromTrash: (state, action: PayloadAction<{ pageId: string; title: string; isPublic: boolean }>) => {
//       const { pageId, title, isPublic } = action.payload;
      
//       // Remove the page from trash folder
//       for (const folder of state.folders) {
//         folder.notes = folder.notes.filter(n => n.id !== pageId);
//       }
      
//       // Add the page to the appropriate folder based on original location
//       const targetFolder = getTargetFolderByPublicStatus(state.folders, isPublic);
      
//       if (targetFolder) {
//         targetFolder.notes.push({
//           id: pageId,
//           name: title
//         });
//       }
//     },
//     updateNoteOrder: (state, action: PayloadAction<{ pageId: string }>) => {
//       const { pageId } = action.payload;
//       const now = new Date().toISOString();

//       for (const folder of state.folders) {
//         const noteIndex = folder.notes.findIndex(n => n.id === pageId);

//         if (noteIndex !== -1) {
//           const note = folder.notes[noteIndex];
//           folder.notes[noteIndex] = { ...note, recentlyOpenDate: now };

//           folder.notes.sort((a, b) => {
//             const dateA = a.recentlyOpenDate ? new Date(a.recentlyOpenDate).getTime() : 0;
//             const dateB = b.recentlyOpenDate ? new Date(b.recentlyOpenDate).getTime() : 0;
//             return dateB - dateA;
//           });
//           break;
//         }
//       }
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loadSidebarData.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loadSidebarData.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.folders = action.payload;
//         state.lastUpdated = Date.now();
//       })
//       .addCase(loadSidebarData.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const {
//   addFolder,
//   addPage,
//   toggleFolder,
//   renameFolder,
//   renamePage,
//   updatePage,
//   deleteFolder,
//   deletePage,
//   clearError,
//   moveNoteBetweenFolders,
//   movePageToTrash,
//   restorePageFromTrash,
//   updateNoteOrder
// } = sidebarSlice.actions;

// // Export utility functions for use in components
// export { getFolderByType, isDefaultFolder, getTargetFolderByPublicStatus };

// export default sidebarSlice.reducer; 

// export const SidebarStore = configureStore({ reducer: sidebarSlice.reducer });
// export type AppSidebarDispatch = typeof SidebarStore.dispatch;