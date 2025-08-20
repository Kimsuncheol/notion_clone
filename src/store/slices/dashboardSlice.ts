import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrendingItem } from '@/types/firebase';

interface DashboardState {
  selectedCategory: string;
  selectedSort: string;
  filteredItems: TrendingItem[];
  allItems: TrendingItem[];
}

const initialState: DashboardState = {
  selectedCategory: 'All',
  selectedSort: 'trending',
  filteredItems: [],
  allItems: []
}

// Helper function to sort items
const sortItems = (items: TrendingItem[], sortBy: string): TrendingItem[] => {
  switch (sortBy) {
    case 'trending':
      return [...items].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    case 'popular':
      return [...items].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    case 'newest':
      return [...items].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    default:
      return items;
  }
};

// Helper function to filter items by category
const filterItems = (items: TrendingItem[], category: string, sortBy: string): TrendingItem[] => {
  const filtered = category === 'All' 
    ? items 
    : items.filter(item => item.category === category);
  
  return sortItems(filtered, sortBy);
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setAllItems: (state, action: PayloadAction<TrendingItem[]>) => {
      state.allItems = action.payload;
      state.filteredItems = filterItems(action.payload, state.selectedCategory, state.selectedSort);
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = filterItems(state.allItems, action.payload, state.selectedSort);
    },
    setSelectedSort: (state, action: PayloadAction<string>) => {
      state.selectedSort = action.payload;
      state.filteredItems = filterItems(state.allItems, state.selectedCategory, action.payload);
    },
    filterItemsByCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = filterItems(state.allItems, action.payload, state.selectedSort);
    }
  }
})

export const { setAllItems, setSelectedCategory, setSelectedSort, filterItemsByCategory } = dashboardSlice.actions;
export default dashboardSlice.reducer;