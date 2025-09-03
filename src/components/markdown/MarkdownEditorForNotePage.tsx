import React, { useState, useEffect, useCallback, useRef } from 'react';
import { handlePublish as serviceHandlePublish, PublishNoteParams, SaveDraftedNote } from '@/services/markdown/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Removed NoteContentProvider and useNoteContent - using Zustand store instead
import { EditorView } from '@codemirror/view';
import { formatSelection } from './codeFormatter';
import { useRouter } from 'next/navigation';

// Import all available themes
import { githubLight } from '@uiw/codemirror-themes-all';
import MarkdownNoteHeader from './MarkdownNoteHeader';
import { availableThemes } from './constants';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import MarkdownEditorBottomBar from './markdownEditorBottomBar';
import PublishScreen from '../note/PublishScreen';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface MarkdownEditorProps {
  pageId?: string;

  onBlockCommentsChange?: (newBlockComments: Record<string, Comment[]>) => void;
  isPublic?: boolean;
  isPublished?: boolean;
  templateId?: string | null;
  templateTitle?: string | null;
}

// Inner component that uses the Zustand store
const MarkdownEditorInner: React.FC<MarkdownEditorProps> = ({
  pageId,
  onBlockCommentsChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPublic = false, // eslint-disable-line @typescript-eslint/no-unused-vars

  // templateId,
  // templateTitle,
}) => {
  // Using Zustand store instead of context
  const { 
    title, 
    setTitle, 
    content, 
    setContent, 
    description, 
    setDescription, 
    isSaving, 
    setIsSaving, 

    showDeleteConfirmation, 
    tags 
  } = useMarkdownEditorContentStore();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  // const [isLoading, setIsLoading] = useState(true);
  // 
  const [authorEmail] = useState<string | null>(null);
  const [authorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName] = useState<string>('');
  const [date] = useState<string>('');
  const auth = getAuth(firebaseApp);

  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // const viewMode = user && user.email === authorEmail ? 'split' : 'preview';
  const { showMarkdownPublishScreen, setShowMarkdownPublishScreen, selectedSeries } = useMarkdownEditorContentStore();



  const handleSave = useCallback(async () => {
    if (!auth.currentUser || isSaving) return;

    try {
      setIsSaving(true);
      
      if (!pageId) {
        // Create new note
        const newNoteId = await SaveDraftedNote(title, content, tags);
        
        // Navigate to the new note
        const userEmail = auth.currentUser.email;
        router.push(`/${userEmail}/note/${newNoteId}`);
      } else {
        // Update existing note - use the existing updateNoteContent logic
        const { handleSave: serviceHandleSave } = await import('@/services/markdown/firebase');
        await serviceHandleSave({
          pageId,
          title,
          content,
          description,
          tags,

        });
      }

    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handleSave wrapper:', error);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, description, tags, setIsSaving, router]);

  // Function to save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && titleRef.current) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(titleRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    return 0;
  };

  const restoreCursorPosition = (position: number) => {
    if (!titleRef.current) return;

    const textNode = titleRef.current.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      const selection = window.getSelection();
      const maxPosition = Math.min(position, textNode.textContent?.length || 0);

      range.setStart(textNode, maxPosition);
      range.setEnd(textNode, maxPosition);

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newTitle = target.textContent || '';
    const cursorPosition = saveCursorPosition();

    setTitle(newTitle);

    // Restore cursor position after React re-render
    setTimeout(() => {
      restoreCursorPosition(cursorPosition);
    }, 0);
  };

  // Update contentEditable content only when title changes from external source
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      const cursorPosition = saveCursorPosition();
      titleRef.current.textContent = title;
      restoreCursorPosition(cursorPosition);
    }
  }, [title]);

  // Get current theme object
  const getCurrentTheme = () => {
    const themeObj = availableThemes.find(theme => theme.value === currentTheme);
    return themeObj?.theme || githubLight;
  };

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

  const handleThemeChange = useCallback((themeValue: string) => {
    setCurrentTheme(themeValue);
  }, []);

  // Handle publish modal using the service function
  const handlePublish = useCallback(async (thumbnailUrl?: string, isPublished?: boolean) => {
    if (!auth.currentUser || isSaving) return;

    try {
      setIsSaving(true);

      const publishParams: PublishNoteParams = {
        pageId: pageId as string,
        title,
        content,
        description,
        series: selectedSeries || undefined,
        thumbnailUrl,
        isPublished,

        setShowMarkdownPublishScreen,
        tags
      };

      await serviceHandlePublish(publishParams);
    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handlePublish wrapper:', error);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, description, setIsSaving, setShowMarkdownPublishScreen, tags, selectedSeries]);

  // Keyboard shortcuts - manual save and publish modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setShowMarkdownPublishScreen(true); // Show publish modal
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSave(); // Manual save only
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        handleFormatCode(); // Format code
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleFormatCode, setShowMarkdownPublishScreen]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col h-full`}>
        {showDeleteConfirmation && (
          <DeleteConfirmationModal pageId={pageId as string} />
        )}
        <MarkdownNoteHeader
          title={title}
          titleRef={titleRef}
          handleTitleInput={handleTitleInput}
          viewMode={'split'}
        />
        <MarkdownContentArea
          viewMode={'split'}
          content={content}
          theme={getCurrentTheme()}
          onContentChange={setContent}
          onSave={handleSave}
          isSaving={isSaving}
          currentTheme={currentTheme}
          themes={availableThemes}
          isDarkMode={isDarkMode}
          authorName={authorName}
          authorEmail={authorEmail as string}
          authorId={authorId as string}
          date={date}
          onThemeChange={handleThemeChange}
          onFormatCode={handleFormatCode}
          editorRef={editorRef}
        />
        <MarkdownEditorBottomBar
          saveDraft={() => handleSave()}
          showPublishScreen={() => setShowMarkdownPublishScreen(true)}
        />

        {showMarkdownPublishScreen && (
          <PublishScreen
            // title={title}
            description={description}
            url={`/@${authorEmail}/${title}`}
            thumbnailUrl={thumbnailUrl}
            pageId={pageId}
            setThumbnailUrl={setThumbnailUrl}
            setDescription={setDescription}
            isOpen={showMarkdownPublishScreen}
            onUploadThumbnail={() => { }}
            onCancel={() => setShowMarkdownPublishScreen(false)}
            onPublish={() => handlePublish()}
          />
        )}
      </div>
    </DndProvider>
  );
};

// Main component - no longer needs context provider
const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  return <MarkdownEditorInner {...props} />;
};

export default MarkdownEditor; 