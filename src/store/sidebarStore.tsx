import { create } from 'zustand';

interface SidebarStore {
  whereToOpenSubNote: string | null;
  selectedPageIdToEditTitle: string | null;
  spreadSubNoteList: boolean;
  showMoreOptionsSidebarForFavorites: string | null;
  showAddaSubNoteSidebarForFavorites: string | null;
  showMoreOptionsSidebarForFolderTree: string | null;
  showAddaSubNoteSidebarForFolderTree: string | null;
  hasSubNotes: boolean;
  setWhereToOpenSubNote: (whereToOpenSubNote: string | null) => void;
  setSelectedPageIdToEditTitle: (selectedPageIdToEditTitle: string | null) => void;
  setSpreadSubNoteList: (spreadSubNoteList: boolean) => void;
  setShowMoreOptionsSidebarForFavorites: (showMoreOptionsSidebarForFavorites: string | null) => void;
  setShowAddaSubNoteSidebarForFavorites: (showAddaSubNoteSidebarForFavorites: string | null) => void;
  setShowMoreOptionsSidebarForFolderTree: (showMoreOptionsSidebarForFolderTree: string | null) => void;
  setShowAddaSubNoteSidebarForFolderTree: (showAddaSubNoteSidebarForFolderTree: string | null) => void;
  resetShowMoreOptionsSidebarForFavorites: () => void;
  resetShowAddaSubNoteSidebarForFavorites: () => void;
  resetShowMoreOptionsSidebarForFolderTree: () => void;
  resetShowAddaSubNoteSidebarForFolderTree: () => void;
  toggleShowMoreOptionsAddaSubNoteSidebar: (showMoreOptionsSidebarForFavorites: string | null, showAddaSubNoteSidebarForFavorites: string | null, showMoreOptionsSidebarForFolderTree: string | null, showAddaSubNoteSidebarForFolderTree: string | null) => void;
  setHasSubNotes: (hasSubNotes: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  whereToOpenSubNote: null,
  selectedPageIdToEditTitle: null,
  spreadSubNoteList: false,
  showMoreOptionsSidebarForFavorites: null,
  showAddaSubNoteSidebarForFavorites: null,
  showMoreOptionsSidebarForFolderTree: null,
  showAddaSubNoteSidebarForFolderTree: null,
  hasSubNotes: false,
  setWhereToOpenSubNote: (whereToOpenSubNote) => {
    const prevValue = get().whereToOpenSubNote;
    if (prevValue !== whereToOpenSubNote) {
      set({ whereToOpenSubNote });
    } else {
      set({ whereToOpenSubNote: null });
    }
  },
  setSelectedPageIdToEditTitle: (selectedPageIdToEditTitle) => {
    set({ selectedPageIdToEditTitle });
  },
  setSpreadSubNoteList: (spreadSubNoteList) => {
    const prevValue = get().spreadSubNoteList;
    if (prevValue !== spreadSubNoteList) {
      set({ spreadSubNoteList });
    } else {
      set({ spreadSubNoteList: false });
    }
  },
  setShowMoreOptionsSidebarForFavorites: (showMoreOptionsSidebarForFavorites: string | null) => set({ showMoreOptionsSidebarForFavorites }),
  setShowAddaSubNoteSidebarForFavorites: (showAddaSubNoteSidebarForFavorites: string | null) => set({ showAddaSubNoteSidebarForFavorites }),
  setShowMoreOptionsSidebarForFolderTree: (showMoreOptionsSidebarForFolderTree: string | null) => set({ showMoreOptionsSidebarForFolderTree }),
  setShowAddaSubNoteSidebarForFolderTree: (showAddaSubNoteSidebarForFolderTree: string | null) => set({ showAddaSubNoteSidebarForFolderTree }),
  resetShowMoreOptionsSidebarForFavorites: () => set({ showMoreOptionsSidebarForFavorites: null }),
  resetShowAddaSubNoteSidebarForFavorites: () => set({ showAddaSubNoteSidebarForFavorites: null }),
  resetShowMoreOptionsSidebarForFolderTree: () => set({ showMoreOptionsSidebarForFolderTree: null }),
  resetShowAddaSubNoteSidebarForFolderTree: () => set({ showAddaSubNoteSidebarForFolderTree: null }),
  toggleShowMoreOptionsAddaSubNoteSidebar: (showMoreOptionsSidebarForFavorites: string | null, showAddaSubNoteSidebarForFavorites: string | null, showMoreOptionsSidebarForFolderTree: string | null, showAddaSubNoteSidebarForFolderTree: string | null) => {
    set({
      showMoreOptionsSidebarForFavorites,
      showAddaSubNoteSidebarForFavorites,
      showMoreOptionsSidebarForFolderTree,
      showAddaSubNoteSidebarForFolderTree,
    })
  },
  setHasSubNotes: (hasSubNotes: boolean) => set({ hasSubNotes }),
}));