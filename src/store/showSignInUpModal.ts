import { create } from "zustand";

interface showSignInUpModalStore {
  showSignInModal: boolean;
  showSignUpModal: boolean;
  setShowSignInModal: (showSignInModal: boolean) => void;
  setShowSignUpModal: (showSignUpModal: boolean) => void;
}

export const useShowSignInUpModalStore = create<showSignInUpModalStore>((set) => ({
  showSignInModal: false,
  showSignUpModal: false,
  setShowSignInModal: (showSignInModal) => set({ showSignInModal }),
  setShowSignUpModal: (showSignUpModal) => set({ showSignUpModal }),
}));