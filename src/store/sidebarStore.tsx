import { create } from 'zustand';

interface SidebarStore {
  whereToOpenSubNote: string | null;
  selectedPageIdToEditTitle: string | null;
  setWhereToOpenSubNote: (whereToOpenSubNote: string | null) => void;
  setSelectedPageIdToEditTitle: (selectedPageIdToEditTitle: string | null) => void;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  whereToOpenSubNote: null,
  selectedPageIdToEditTitle: null,
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
}));