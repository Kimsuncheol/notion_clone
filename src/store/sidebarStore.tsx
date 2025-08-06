import { create } from 'zustand';

interface SidebarStore {
  whereToOpenSubNote: string | null;
  setWhereToOpenSubNote: (whereToOpenSubNote: string | null) => void;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  whereToOpenSubNote: null,
  setWhereToOpenSubNote: (whereToOpenSubNote) => {
    const prevValue = get().whereToOpenSubNote;
    if (prevValue !== whereToOpenSubNote) {
      set({ whereToOpenSubNote });
    } else {
      set({ whereToOpenSubNote: null });
    }
  },
}));