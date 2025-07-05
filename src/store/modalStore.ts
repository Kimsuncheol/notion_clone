import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ModalState {
  showSettings: boolean;
  showManual: boolean;
  showWorkspaceModal: boolean;
  showViewAllComments: boolean;
  showInbox: boolean;
  showInviteMembersModal: boolean;
  showManageMembersModal: boolean;
  showSearchModal: boolean;
  showWorkspace: boolean;
  showInviteMembers: boolean;
  showManageMembers: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  unreadNotificationCount: number;
  isBeginner: boolean;
  manualDismissedForSession: boolean;
  setShowSettings: (show: boolean) => void;
  setShowManual: (show: boolean) => void;
  setShowWorkspaceModal: (show: boolean) => void;
  setShowViewAllComments: (show: boolean) => void;
  setShowInbox: (show: boolean) => void;
  setShowInviteMembersModal: (show: boolean) => void;
  setShowManageMembersModal: (show: boolean) => void;
  setShowSearchModal: (show: boolean) => void;
  setShowWorkspace: (show: boolean) => void;
  setShowInviteMembers: (show: boolean) => void;
  setShowManageMembers: (show: boolean) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  updateWorkspaceName: (name: string) => void;
  setUnreadNotificationCount: (count: number) => void;
  setIsBeginner: (isBeginner: boolean) => void;
  setManualDismissedForSession: (dismissed: boolean) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>()(
  persist(
    (set) => ({
      showSettings: false,
      showManual: false,
      showWorkspaceModal: false,
      showViewAllComments: false,
      showInbox: false,
      showInviteMembersModal: false,
      showManageMembersModal: false,
      showSearchModal: false,
      showWorkspace: false,
      showInviteMembers: false,
      showManageMembers: false,
      workspaces: [],
      currentWorkspace: null,
      unreadNotificationCount: 0,
      isBeginner: true,
      manualDismissedForSession: false,
      setShowSettings: (show: boolean) => set({ showSettings: show }),
      setShowManual: (show: boolean) => set({ showManual: show }),
      setShowWorkspaceModal: (show: boolean) => set({ showWorkspaceModal: show }),
      setShowViewAllComments: (show: boolean) => set({ showViewAllComments: show }),
      setShowInbox: (show: boolean) => set({ showInbox: show }),
      setShowInviteMembersModal: (show: boolean) => set({ showInviteMembersModal: show }),
      setShowManageMembersModal: (show: boolean) => set({ showManageMembersModal: show }),
      setShowSearchModal: (show: boolean) => set({ showSearchModal: show }),
      setShowWorkspace: (show: boolean) => set({ showWorkspace: show }),
      setShowInviteMembers: (show: boolean) => set({ showInviteMembers: show }),
      setShowManageMembers: (show: boolean) => set({ showManageMembers: show }),
      setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
      setCurrentWorkspace: (workspace: Workspace | null) => set({ currentWorkspace: workspace }),
      updateWorkspaceName: (name: string) => set((state) => ({ 
        currentWorkspace: state.currentWorkspace ? { ...state.currentWorkspace, name } : null 
      })),
      setUnreadNotificationCount: (count: number) => set({ unreadNotificationCount: count }),
      setIsBeginner: (isBeginner: boolean) => set({ isBeginner }),
      setManualDismissedForSession: (dismissed: boolean) => set({ manualDismissedForSession: dismissed }),
      closeAllModals: () => set({
        showSettings: false,
        showManual: false,
        showWorkspaceModal: false,
        showViewAllComments: false,
        showInbox: false,
        showInviteMembersModal: false,
        showManageMembersModal: false,
        showSearchModal: false,
        showWorkspace: false,
        showInviteMembers: false,
        showManageMembers: false,
      }),
    }),
    {
      name: 'modal-storage',
      partialize: (state) => ({ 
        currentWorkspace: state.currentWorkspace,
        unreadNotificationCount: state.unreadNotificationCount,
        isBeginner: state.isBeginner 
        // Note: manualDismissedForSession is intentionally NOT persisted as it's session-only
      }), // Persist workspace info, notification count, and beginner status
    }
  )
); 