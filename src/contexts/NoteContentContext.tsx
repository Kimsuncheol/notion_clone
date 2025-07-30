import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

interface NoteContentContextType {
  // Content management
  content: string;
  setContent: (content: string) => void;
  
  // Publish content management
  publishContent: string;
  setPublishContent: (content: string) => void;
  
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
}

export const NoteContentProvider: React.FC<NoteContentProviderProps> = ({ 
  children, 
  onSaveTitle,
}) => {
  const [publishContent, setPublishContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { content, setContent } = useMarkdownEditorContentStore();

  const value: NoteContentContextType = {
    content,
    setContent,
    publishContent,
    setPublishContent,
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