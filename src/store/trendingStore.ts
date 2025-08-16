import { create } from 'zustand';

interface TrendingStore {
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  selectedSorting: string;
  setSelectedSorting: (sorting: string) => void;
  isTrendingHeaderModalOpen: boolean;
  setIsTrendingHeaderModalOpen: (isTrendingHeaderModalOpen: boolean) => void;
}

export const useTrendingStore = create<TrendingStore>((set) => ({
  selectedTimeframe: 'day',
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  selectedSorting: 'trending',
  setSelectedSorting: (sorting) => set({ selectedSorting: sorting }),
  isTrendingHeaderModalOpen: false,
  setIsTrendingHeaderModalOpen: (isTrendingHeaderModalOpen) => set({ isTrendingHeaderModalOpen }),
}));