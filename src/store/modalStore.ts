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
  showTrashSidebar: boolean;
  showHelpContactMore: boolean;
  showCalendarModal: boolean;
  showNotesArchive: boolean;

  setShowSettings: (show: boolean) => void;
  setShowManual: (show: boolean) => void;
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
  setShowTrashSidebar: (show: boolean) => void;
  setShowHelpContactMore: (show: boolean) => void;
  setShowCalendarModal: (show: boolean) => void;
  setShowNotesArchive: (show: boolean) => void;
}

export const useModalStore = create<ModalState>()(
  persist(
    (set) => ({
      showSettings: false,
      showManual: false,
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
      showTrashSidebar: false,
      showHelpContactMore: false,
      showCalendarModal: false,
      showNotesArchive: false,
      setShowSettings: (show: boolean) => set({ showSettings: show }),
      setShowManual: (show: boolean) => set({ showManual: show }),
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
        showViewAllComments: false,
        showInbox: false,
        showInviteMembersModal: false,
        showManageMembersModal: false,
        showSearchModal: false,
        showWorkspace: false,
        showInviteMembers: false,
        showManageMembers: false,
        showTrashSidebar: false,
        showHelpContactMore: false,
        showCalendarModal: false,
        showNotesArchive: false,
      }),
      setShowTrashSidebar: (show: boolean) => set({ showTrashSidebar: show }),
      setShowHelpContactMore: (show: boolean) => set({ showHelpContactMore: show }),
      setShowCalendarModal: (show: boolean) => set({ showCalendarModal: show }),
      setShowNotesArchive: (show: boolean) => set({ showNotesArchive: show }),
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