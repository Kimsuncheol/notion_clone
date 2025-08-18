import React, { useCallback, useEffect, useRef, useState } from 'react'
import MarkdownContentArea from './markdown/MarkdownContentArea'
import { getAuth } from 'firebase/auth'
import { useAutosave } from 'react-autosave';
import { githubLight } from '@uiw/codemirror-themes-all';
import { availableThemes } from './markdown/constants';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { createOrUpdateSubNotePage, fetchSubNotePage } from '@/services/firebase';
import toast from 'react-hot-toast';
import { EditorView } from '@codemirror/view';
import { formatSelection } from './markdown/codeFormatter';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TableOfContents from './markdown/TableOfContents';

interface MarkdownEditorForAddaSubnotesidebarProps {
  parentId: string;
}

function MarkdownEditorForAddaSubnotesidebar({ parentId }: MarkdownEditorForAddaSubnotesidebarProps) {
  const user = getAuth().currentUser;
  const { content, setContent, selectedSubNoteId, setSelectedSubNoteId, selectedNoteTitle, setSelectedNoteTitle, setAuthorEmail } = useAddaSubNoteSidebarStore();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [title, setTitle] = useState<string>(selectedNoteTitle || '');
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');
  const editorRef = useRef<EditorView | null>(null);
  const { viewMode } = useAddaSubNoteSidebarStore();

  // Load sub-note content when selectedNoteId changes
  useEffect(() => {
    const loadSubNoteContent = async () => {
      // Validate both selectedNoteId and parentId are not empty
      if (selectedSubNoteId && selectedSubNoteId.trim() !== '' && parentId && parentId.trim() !== '') {
        try {
          const subNote = await fetchSubNotePage(parentId, selectedSubNoteId);
          if (subNote) {
            setContent(subNote.content || '');
            setTitle(subNote.title || '');
            setAuthorEmail(subNote.authorEmail || user?.email || '');
            setSelectedNoteTitle(subNote.title || '');
            lastSavedContent.current = subNote.content || '';
            lastSavedTitle.current = subNote.title || '';
          }
        } catch (error) {
          console.error('Failed to load sub-note:', error);
          
          // Provide specific error message for missing documents
          if (error instanceof Error && error.message.includes('does not exist')) {
            toast.error('Sub-note not found. It may have been deleted.');
          } else {
            toast.error('Failed to load note content');
          }
          
          // Clear content on error
          setContent('');
          setTitle('');
          lastSavedContent.current = '';
          lastSavedTitle.current = '';
        }
      } else {
        // Clear content when no valid note is selected
        setContent('');
        setTitle('');
        lastSavedContent.current = '';
        lastSavedTitle.current = '';
      }
    };

    loadSubNoteContent();
  }, [selectedSubNoteId, parentId, setContent, setSelectedNoteTitle, setAuthorEmail, user?.email]);

  // Update title when selectedNoteTitle changes
  useEffect(() => {
    setTitle(selectedNoteTitle || '');
  }, [selectedNoteTitle]);

  // Get current theme object
  const getCurrentTheme = () => {
    const themeObj = availableThemes.find(theme => theme.value === currentTheme);
    return themeObj?.theme || githubLight;
  };

  const handleSave = useCallback(async (isAutoSave = false, data?: { title: string; content: string; updatedAt?: Date }) => {
    // Validate required parameters (selectedNoteId can be empty for new notes)
    if (!parentId || parentId.trim() === '' || !user) {
      console.warn('Missing required data for saving:', { parentId, user: !!user });
      return;
    }

    if (isSaving) {
      console.log('Save already in progress, skipping...');
      return;
    }

    setIsSaving(true);

    try {
      const titleToSave = data?.title || title;
      const contentToSave = data?.content || content;

      const resultSubNoteId = await createOrUpdateSubNotePage(
        parentId, 
        {
          title: titleToSave,
          content: contentToSave,
        },
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        selectedSubNoteId && selectedSubNoteId.trim() !== '' ? selectedSubNoteId : undefined // Pass selectedNoteId only if it exists
      );

      // If a new sub-note was created (no selectedNoteId was provided), update the store
      if (!selectedSubNoteId || selectedSubNoteId.trim() === '') {
        console.log('New sub-note created with ID:', resultSubNoteId);
        setSelectedSubNoteId(resultSubNoteId);
      }

      lastSavedContent.current = contentToSave;
      lastSavedTitle.current = titleToSave;
      setSelectedNoteTitle(titleToSave);

      if (!isAutoSave) {
        toast.success('Sub-note saved successfully!');
      } else {
        console.log('Sub-note auto-saved successfully');
      }
    } catch (error) {
      const errorMessage = `Failed to save sub-note${isAutoSave ? ' (auto-save)' : ''}`;
      console.error(`${errorMessage}:`, error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          toast.error('Sub-note not found. It may have been deleted.');
        } else if (error.message.includes('permission')) {
          toast.error('Permission denied. You may not have access to edit this sub-note.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedSubNoteId, parentId, user, isSaving, title, content, setSelectedNoteTitle, setSelectedSubNoteId]);

  // Simple save handler for MarkdownContentArea
  const handleSimpleSave = useCallback(() => {
    handleSave(false, { title, content });
  }, [handleSave, title, content]);

  // Auto-save function using react-autosave
  const performAutoSave = useCallback(async (data: { title: string; content: string; updatedAt?: Date }) => {
    // Only save if content or title has actually changed
    if (data.content === lastSavedContent.current && data.title === lastSavedTitle.current) {
      return;
    }

    // Don't save if content or title is empty
    // Don't touch this, it's important
    if (data.content.length === 0 || data.title.length === 0) {
      return;
    }

    // Basic validation
    if (!data.title.trim() && !data.content.trim()) {
      return;
    }

    await handleSave(true, data);
  }, [handleSave]);

  // Theme change handler
  const handleThemeChange = useCallback((themeValue: string) => {
    setCurrentTheme(themeValue);
  }, []);

  // Format code handler
  const handleFormatCode = useCallback(() => {
    if (editorRef.current) {
      formatSelection(editorRef.current);
      // Update the parent component with the formatted content
      setTimeout(() => {
        if (editorRef.current) {
          setContent(editorRef.current.state.doc.toString());
        }
      }, 500);
    }
  }, [setContent]);

  const handleTitleCommit = useCallback(async (newTitle: string) => {
    setTitle(newTitle);
    await handleSave(true, { title: newTitle, content });
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: [parentId] } }));
      }
    } catch {}
  }, [handleSave, content, parentId]);

  // Detect dark mode and set default theme
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);

      // Set default theme based on mode if not already set
      if (currentTheme === 'githubLight' && isDark) {
        setCurrentTheme('githubDark');
      } else if (currentTheme === 'githubDark' && !isDark) {
        setCurrentTheme('githubLight');
      }
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, [currentTheme]);


  useAutosave({
    data: { title, content },
    onSave: performAutoSave,
    interval: 2000, // 2 seconds delay
    saveOnUnmount: true
  });

  // Don't render the editor if no valid parent is provided
  if (!parentId || parentId.trim() === '') {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className='flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">No parent note available</p>
            <p className="text-sm">Please select a parent note to create or edit sub-notes</p>
          </div>
        </div>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex-1 flex overflow-hidden'>
        <div className="flex-1 min-w-0">
          <MarkdownContentArea
            viewMode={viewMode}
            content={content}
            theme={getCurrentTheme()}
            onContentChange={setContent}
            onSave={handleSimpleSave}
            isSubNote={true}
            isSaving={isSaving}
            currentTheme={currentTheme}
            themes={availableThemes}
            isDarkMode={isDarkMode}
            pageId={selectedSubNoteId || 'new-sub-note'}
            authorName={user?.displayName || ''}
            authorId={user?.uid || ''}
            date={new Date().toISOString()}
            onThemeChange={handleThemeChange}
            onFormatCode={handleFormatCode}
            editorRef={editorRef}
            onTitleCommit={handleTitleCommit}
          />
        </div>
        
        {/* TOC Sidebar for SubNote editor */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="hidden lg:block w-64 h-full overflow-y-auto">
            <div className="sticky top-0">
              <TableOfContents 
                content={content}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  )
}

export default MarkdownEditorForAddaSubnotesidebar;