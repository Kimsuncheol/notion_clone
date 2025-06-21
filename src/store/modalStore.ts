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
  showInviteMembers: boolean;
  showNotifications: boolean;
  showManageMembers: boolean;
  showNotificationCenter: boolean;
  currentWorkspace: WorkspaceInfo | null;
  unreadNotificationCount: number;
  setShowProfile: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowManual: (show: boolean) => void;
  setShowWorkspace: (show: boolean) => void;
  setShowInviteMembers: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  setShowManageMembers: (show: boolean) => void;
  setShowNotificationCenter: (show: boolean) => void;
  setCurrentWorkspace: (workspace: WorkspaceInfo | null) => void;
  updateWorkspaceName: (name: string) => void;
  setUnreadNotificationCount: (count: number) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>()(
  persist(
    (set) => ({
      showProfile: false,
      showSettings: false,
      showManual: false,
      showWorkspace: false,
      showInviteMembers: false,
      showNotifications: false,
      showManageMembers: false,
      showNotificationCenter: false,
      currentWorkspace: null,
      unreadNotificationCount: 0,
      setShowProfile: (show: boolean) => set({ showProfile: show }),
      setShowSettings: (show: boolean) => set({ showSettings: show }),
      setShowManual: (show: boolean) => set({ showManual: show }),
      setShowWorkspace: (show: boolean) => set({ showWorkspace: show }),
      setShowInviteMembers: (show: boolean) => set({ showInviteMembers: show }),
      setShowNotifications: (show: boolean) => set({ showNotifications: show }),
      setShowManageMembers: (show: boolean) => set({ showManageMembers: show }),
      setShowNotificationCenter: (show: boolean) => set({ showNotificationCenter: show }),
      setCurrentWorkspace: (workspace: WorkspaceInfo | null) => set({ currentWorkspace: workspace }),
      updateWorkspaceName: (name: string) => set((state) => 
        state.currentWorkspace ? { currentWorkspace: { ...state.currentWorkspace, name } } : {}
      ),
      setUnreadNotificationCount: (count: number) => set({ unreadNotificationCount: count }),
      closeAllModals: () => set({ 
        showProfile: false, 
        showSettings: false, 
        showManual: false, 
        showWorkspace: false,
        showInviteMembers: false,
        showNotifications: false,
        showManageMembers: false,
        showNotificationCenter: false
      }),
    }),
    {
      name: 'modal-storage',
      partialize: (state) => ({ 
        currentWorkspace: state.currentWorkspace,
        unreadNotificationCount: state.unreadNotificationCount 
      }), // Persist workspace info and notification count
    }
  )
); 