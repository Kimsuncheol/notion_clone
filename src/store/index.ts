import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebarSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['sidebar/loadSidebarData/fulfilled'],
        ignoredActionsPaths: ['payload.createdAt', 'payload.updatedAt'],
        ignoredPaths: ['sidebar.folders.notes.subNotes.createdAt', 'sidebar.folders.notes.subNotes.updatedAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 