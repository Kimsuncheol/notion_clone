import { create } from 'zustand';

interface ModalState {
  showProfile: boolean;
  showSettings: boolean;
  showManual: boolean;
  setShowProfile: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowManual: (show: boolean) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  showProfile: false,
  showSettings: false,
  showManual: false,
  setShowProfile: (show: boolean) => set({ showProfile: show }),
  setShowSettings: (show: boolean) => set({ showSettings: show }),
  setShowManual: (show: boolean) => set({ showManual: show }),
  closeAllModals: () => set({ showProfile: false, showSettings: false, showManual: false }),
})); 