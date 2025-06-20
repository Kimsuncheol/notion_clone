import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebarSlice';
import labelsReducer from './slices/labelsSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    labels: labelsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 