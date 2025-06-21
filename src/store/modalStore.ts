import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceInfo {
  id: string;
  name: string;
}

interface ModalState {
  showProfile: boolean;
  showSettings: boolean;
  showManual: boolean;
  showWorkspace: boolean;
  currentWorkspace: WorkspaceInfo | null;
  setShowProfile: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowManual: (show: boolean) => void;
  setShowWorkspace: (show: boolean) => void;
  setCurrentWorkspace: (workspace: WorkspaceInfo | null) => void;
  updateWorkspaceName: (name: string) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>()(
  persist(
    (set) => ({
      showProfile: false,
      showSettings: false,
      showManual: false,
      showWorkspace: false,
      currentWorkspace: null,
      setShowProfile: (show: boolean) => set({ showProfile: show }),
      setShowSettings: (show: boolean) => set({ showSettings: show }),
      setShowManual: (show: boolean) => set({ showManual: show }),
      setShowWorkspace: (show: boolean) => set({ showWorkspace: show }),
      setCurrentWorkspace: (workspace: WorkspaceInfo | null) => set({ currentWorkspace: workspace }),
      updateWorkspaceName: (name: string) => set((state) => 
        state.currentWorkspace ? { currentWorkspace: { ...state.currentWorkspace, name } } : {}
      ),
      closeAllModals: () => set({ showProfile: false, showSettings: false, showManual: false, showWorkspace: false }),
    }),
    {
      name: 'modal-storage',
      partialize: (state) => ({ currentWorkspace: state.currentWorkspace }), // Only persist workspace info
    }
  )
); 