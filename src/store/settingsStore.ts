import { create } from 'zustand'

interface SettingsStore {
  isDeleteAccountModalOpen: boolean
  setIsDeleteAccountModalOpen: (isDeleteAccountModalOpen: boolean) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isDeleteAccountModalOpen: false,
  setIsDeleteAccountModalOpen: (isDeleteAccountModalOpen) => set({ isDeleteAccountModalOpen }),
}))