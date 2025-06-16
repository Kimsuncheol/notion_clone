import { create } from 'zustand';

interface ModalState {
  showProfile: boolean;
  showSettings: boolean;
  setShowProfile: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  showProfile: false,
  showSettings: false,
  setShowProfile: (show: boolean) => set({ showProfile: show }),
  setShowSettings: (show: boolean) => set({ showSettings: show }),
  closeAllModals: () => set({ showProfile: false, showSettings: false }),
})); 