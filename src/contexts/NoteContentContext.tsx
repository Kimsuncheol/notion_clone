import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import { useSubNoteMarkdownEditorContentStore } from '@/store/SubNotemarkdownEditorContentStore';

interface NoteContentContextType {
  // Content management
  content: string;
  setContent: (content: string) => void;
  
  // Publish content management
  description: string;
  setDescription: (content: string) => void;
  
  // Loading states
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  
  // Title management callback
  onSaveTitle?: (title: string) => void;

  // Public content management
  // isPublished: boolean;
  // setIsPublished: (isPublished: boolean) => void;
}

const NoteContentContext = createContext<NoteContentContextType | undefined>(undefined);

interface NoteContentProviderProps {
  children: ReactNode;
  onSaveTitle?: (title: string) => void;
  isSubNote?: boolean;
}

export const NoteContentProvider: React.FC<NoteContentProviderProps> = ({ 
  children, 
  onSaveTitle,
  isSubNote = false,
}) => {
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { content: mainContent, setContent: setMainContent } = useMarkdownEditorContentStore();
  const { subNoteContent, setSubNoteContent } = useSubNoteMarkdownEditorContentStore();

  const content = isSubNote ? subNoteContent : mainContent;
  const setContent = isSubNote ? setSubNoteContent : setMainContent;

  const value: NoteContentContextType = {
    content,
    setContent,
    description,
    setDescription,
    isSaving,
    setIsSaving,
    onSaveTitle,
  };

  return (
    <NoteContentContext.Provider value={value}>
      {children}
    </NoteContentContext.Provider>
  );
};

export const useNoteContent = (): NoteContentContextType => {
  const context = useContext(NoteContentContext);
  if (context === undefined) {
    throw new Error('useNoteContent must be used within a NoteContentProvider');
  }
  return context;
}; 