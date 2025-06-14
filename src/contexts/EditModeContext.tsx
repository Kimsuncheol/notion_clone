'use client';
import React, { createContext, useContext, useState } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  setEditMode: (editMode: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
  initialEditMode?: boolean;
}

export const EditModeProvider: React.FC<Props> = ({ children, initialEditMode = true }) => {
  const [isEditMode, setIsEditMode] = useState(initialEditMode);

  const setEditMode = (editMode: boolean) => {
    setIsEditMode(editMode);
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}; 