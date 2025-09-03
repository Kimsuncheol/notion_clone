import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSubNotePage, realTimeNoteTitle } from '@/services/firebase';
import { fetchNoteContent } from '@/services/markdown/firebase';
import { handleSave as serviceHandleSave, handlePublish as serviceHandlePublish, SaveNoteParams, SaveNoteOptions, PublishNoteParams } from '@/services/markdown/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import PublishModal from './PublishModal';
import { NoteContentProvider, useNoteContent } from '@/contexts/NoteContentContext';
import { EditorView } from '@codemirror/view';
import { formatSelection } from './codeFormatter';
import { useAutosave } from 'react-autosave';

// Import all available themes
import { githubLight } from '@uiw/codemirror-themes-all';
import MarkdownNoteHeader from './MarkdownNoteHeader';
import { availableThemes } from './constants';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import MarkdownEditorBottomBar from './markdownEditorBottomBar';
import PublishScreen from '../note/PublishScreen';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { SeriesType } from '@/types/firebase';

interface MarkdownEditorProps {
  pageId?: string;
  onSaveTitle?: (title: string) => void;
  onBlockCommentsChange?: (newBlockComments: Record<string, Comment[]>) => void;
  isPublic?: boolean;
  isPublished?: boolean;
  templateId?: string | null;
  templateTitle?: string | null;
}

// Inner component that uses the context
const MarkdownEditorInner: React.FC<MarkdownEditorProps> = ({
  pageId,
  onBlockCommentsChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPublic = false,
}) => {
  const {
    content,
    setContent,
    description,
    setDescription,
    isSaving,
    setIsSaving,
    onSaveTitle,
  } = useNoteContent();

  // const [title, setTitle] = useState('');
  const { title, setTitle, showDeleteConfirmation, tags } = useMarkdownEditorContentStore();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  // const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [existingSeries, setExistingSeries] = useState<SeriesType | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName, setAuthorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [viewCount, setViewCount] = useState<number>(0);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [likeUsers, setLikeUsers] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const auth = getAuth(firebaseApp);

  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');
  const user = auth.currentUser;
  // const viewMode = user && user.email === authorEmail ? 'split' : 'preview';
  const { viewMode, setAuthorEmail, authorEmail, showMarkdownPublishScreen, setShowMarkdownPublishScreen, selectedSeries } = useMarkdownEditorContentStore();
  const { selectedSubNoteId } = useAddaSubNoteSidebarStore();

  const handleSave = useCallback(async (isAutoSave = false, data?: { title: string; content: string; updatedAt?: Date }) => {
    if (!auth.currentUser || isSaving) return;

    const noteTitle = isAutoSave && data ? data.title : title;
    const noteContent = isAutoSave && data ? data.content : content;

    try {
      setIsSaving(true);
      console.log('tags', tags);

      const saveParams: SaveNoteParams = {
        pageId: pageId as string,
        title: noteTitle,
        content: noteContent,
        description,
        isPublic,
        isPublished,
        thumbnailUrl,
        updatedAt: updatedAt || undefined,
        onSaveTitle: (savedTitle: string) => {
          lastSavedContent.current = noteContent;
          lastSavedTitle.current = savedTitle;
          if (onSaveTitle) {
            onSaveTitle(savedTitle);
          }
        },
        tags: tags
      };

      const saveOptions: SaveNoteOptions = {
        isAutoSave,
        data
      };

      await serviceHandleSave(saveParams, saveOptions);
    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handleSave wrapper:', error);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, description, isPublic, isPublished, onSaveTitle, setIsSaving, thumbnailUrl, updatedAt, tags]);

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

  // Use react-autosave hook with 2 second delay (default)
  useAutosave({
    data: { title, content },
    onSave: performAutoSave,
    interval: 2000, // 2 seconds delay
    saveOnUnmount: true
  });

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

  // Load note content
  const loadNote = useCallback(async () => {
    if (!pageId) return;

    try {
      setIsLoading(true);
      // Watch this
      const noteContent = selectedSubNoteId
        ? await fetchSubNotePage(pageId, selectedSubNoteId)
        : await fetchNoteContent(pageId);

      if (noteContent) {
        setTitle(noteContent.title || '');
        setThumbnailUrl(noteContent.thumbnailUrl || '');
        setAuthorEmail(noteContent.authorEmail || null);
        setAuthorId(noteContent.userId || null);
        setAuthorName(noteContent.authorName || '');
        setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());

        // Set content in context
        setContent(noteContent.content || '');
        setDescription(noteContent.description || '');
        setIsPublished(noteContent.isPublished ?? false);
        setExistingSeries(noteContent.series || null);
        setUpdatedAt(noteContent.updatedAt || null);
        setViewCount(noteContent.viewCount || 0);
        setLikeCount(noteContent.likeCount || 0);
        setLikeUsers(noteContent.likeUsers || []);

        // Initialize last saved refs to prevent immediate auto-save
        lastSavedContent.current = noteContent.content || '';
        lastSavedTitle.current = noteContent.title || '';
      }
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Failed to load note');
    } finally {
      setIsLoading(false);
    }
  }, [pageId, selectedSubNoteId, setContent, setDescription, setAuthorEmail, setTitle]);

  useEffect(() => {
    if (pageId) {
      realTimeNoteTitle(pageId, setTitle);
    }
    loadNote();
  }, [pageId, loadNote, setTitle]);

  const handleThemeChange = useCallback((themeValue: string) => {
    setCurrentTheme(themeValue);
  }, []);

  // Handle publish modal using the service function
  const handlePublish = useCallback(async (thumbnailUrl?: string, isPublished?: boolean) => {
    if (!auth.currentUser || isSaving) return;

    console.log('selectedSeries', selectedSeries);

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
        onSaveTitle,
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
  }, [auth.currentUser, isSaving, pageId, title, content, description, onSaveTitle, setIsSaving, setShowMarkdownPublishScreen, tags, selectedSeries]);

  // Keyboard shortcuts - removed autoSave, only manual save and publish modal
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading markdown editor...</div>
      </div>
    );
  }

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
          viewMode={viewMode}
        />
        <MarkdownContentArea
          viewMode={viewMode}
          content={content}
          viewCount={viewCount}
          likeCount={likeCount}
          theme={getCurrentTheme()}
          onContentChange={setContent}
          onSave={handleSave}
          isSaving={isSaving}
          currentTheme={currentTheme}
          themes={availableThemes}
          isDarkMode={isDarkMode}
          pageId={pageId as string}
          authorName={authorName}
          authorEmail={authorEmail as string}
          authorId={authorId as string}
          date={date}
          isInLikeUsers={likeUsers.includes(user!.email!)}
          onThemeChange={handleThemeChange}
          onFormatCode={handleFormatCode}
          editorRef={editorRef}
          setViewCount={setViewCount}
          setLikeCount={setLikeCount}
        />
        {viewMode === 'split' && (
          <MarkdownEditorBottomBar
            saveDraft={() => handleSave()}
            showPublishScreen={() => setShowMarkdownPublishScreen(true)}
            pageId={pageId}
            isPublished={isPublished}
          />
        )}

        {showMarkdownPublishScreen && (
          <PublishScreen
            pageId={pageId}
            isPublished={isPublished}
            // title={title}
            url={`/@${authorEmail}/${title}`}
            thumbnailUrl={thumbnailUrl}
            isOpen={showMarkdownPublishScreen}
            onUploadThumbnail={() => { }}
            description={description}
            setDescription={setDescription}
            existingSeries={existingSeries}
            // thumbnailUrl={thumbnailUrl}
            setThumbnailUrl={setThumbnailUrl}
            onCancel={() => setShowMarkdownPublishScreen(false)}
            onPublish={() => handlePublish()}
          />
        )}
      </div>
    </DndProvider>
  );
};

// Main component wrapped with context provider
const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  return (
    <NoteContentProvider onSaveTitle={props.onSaveTitle}>
      <MarkdownEditorInner {...props} />
    </NoteContentProvider>
  );
};

export default MarkdownEditor; 