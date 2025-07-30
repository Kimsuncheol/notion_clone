import { create } from 'zustand';

interface ShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdState {
  showMoreOptionsSidebarForFavorites: string | null;
  showAddaSubNoteSidebarForFavorites: string | null;
  showMoreOptionsSidebarForFolderTree: string | null;
  showAddaSubNoteSidebarForFolderTree: string | null;
  setShowMoreOptionsSidebarForFavorites: (showMoreOptionsSidebarForFavorites: string | null) => void;
  setShowAddaSubNoteSidebarForFavorites: (showAddaSubNoteSidebarForFavorites: string | null) => void;
  setShowMoreOptionsSidebarForFolderTree: (showMoreOptionsSidebarForFolderTree: string | null) => void;
  setShowAddaSubNoteSidebarForFolderTree: (showAddaSubNoteSidebarForFolderTree: string | null) => void;
  resetShowMoreOptionsSidebarForFavorites: () => void;
  resetShowAddaSubNoteSidebarForFavorites: () => void;
  resetShowMoreOptionsSidebarForFolderTree: () => void;
  resetShowAddaSubNoteSidebarForFolderTree: () => void;
  toggleShowMoreOptionsAddaSubNoteSidebar: (showMoreOptionsSidebarForFavorites: string | null, showAddaSubNoteSidebarForFavorites: string | null, showMoreOptionsSidebarForFolderTree: string | null, showAddaSubNoteSidebarForFolderTree: string | null) => void;
}

export const useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore = create<ShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdState>((set) => ({
  showMoreOptionsSidebarForFavorites: null,
  showAddaSubNoteSidebarForFavorites: null,
  showMoreOptionsSidebarForFolderTree: null,
  showAddaSubNoteSidebarForFolderTree: null,
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
}));