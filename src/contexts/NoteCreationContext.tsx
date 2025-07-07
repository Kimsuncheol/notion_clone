'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NoteCreationMode = 'ask' | 'build' | 'research';

interface NoteCreationContextType {
  selectedMode: NoteCreationMode;
  setSelectedMode: (mode: NoteCreationMode) => void;
}

const NoteCreationContext = createContext<NoteCreationContextType | undefined>(undefined);

export const NoteCreationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMode, setSelectedMode] = useState<NoteCreationMode>('ask');

  return (
    <NoteCreationContext.Provider value={{ selectedMode, setSelectedMode }}>
      {children}
    </NoteCreationContext.Provider>
  );
};

export const useNoteCreation = () => {
  const context = useContext(NoteCreationContext);
  if (!context) {
    throw new Error('useNoteCreation must be used within a NoteCreationProvider');
  }
  return context;
}; 