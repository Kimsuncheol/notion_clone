import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNoteContent, fetchSubNotePage, realTimeNoteTitle, updateFavoriteNoteTitle, updateNoteContent } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './markdown';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PublishModal from './PublishModal';
import { NoteContentProvider, useNoteContent } from '@/contexts/NoteContentContext';
import { EditorView } from '@codemirror/view';
import { formatSelection } from './markdown/codeFormatter';
import { useAutosave } from 'react-autosave';

// Import all available themes
import { githubLight } from '@uiw/codemirror-themes-all';
import MarkdownNoteHeader from './markdown/MarkdownNoteHeader';
import { templates, availableThemes } from './markdown/constants';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import SubNoteList from './sidebar/SubNoteList';

interface MarkdownEditorProps {
  pageId: string;
  onSaveTitle: (title: string) => void;
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
  templateId,
  templateTitle,
}) => {
  const {
    content,
    setContent,
    publishContent,
    setPublishContent,
    isSaving,
    setIsSaving,
    onSaveTitle,
  } = useNoteContent();

  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  // 
  // const [authorEmail, setAuthorEmail] = useState<string | null>(null);

  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName, setAuthorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const auth = getAuth(firebaseApp);

  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');
  const user = auth.currentUser;
  // const viewMode = user && user.email === authorEmail ? 'split' : 'preview';
  const { viewMode, setAuthorEmail } = useMarkdownEditorContentStore();
  const { selectedSubNoteId } = useAddaSubNoteSidebarStore();

  const handleSave = useCallback(async (isAutoSave = false, data?: { title: string; content: string; updatedAt?: Date }) => {
    if (!auth.currentUser || isSaving) return;

    const noteTitle = isAutoSave && data ? data.title : title;
    const noteContent = isAutoSave && data ? data.content : content;
    // Add validation for manual save
    if (!isAutoSave) {
      if (!noteTitle.trim() || noteTitle.length === 0) {
        toast.error('Please enter a title');
        return;
      }
      if ((!noteContent.trim() || noteContent.length === 0) && !updatedAt) {
        toast.error('Content cannot be empty');
        return;
      }
    }

    try {
      setIsSaving(true);

      await updateNoteContent(
        pageId,
        noteTitle || 'Untitled',
        noteTitle || 'Untitled', // publishTitle same as title
        noteContent,
        publishContent,
        isPublic,
        isPublished,
        thumbnailUrl // No thumbnail for auto-save
      );

      await updateFavoriteNoteTitle(pageId, noteTitle);

      if (isAutoSave) {
        // Update refs to track what was last saved
        console.log('Auto-saved successfully');
      }
      lastSavedContent.current = noteContent;
      lastSavedTitle.current = noteTitle;
      if (onSaveTitle) {
        onSaveTitle(noteTitle);
      }

      toast.success('Note saved successfully!');
    } catch (error) {
      const errorMessage = `Failed to save note${isAutoSave ? ' (auto-save)' : ''}`;
      console.error(`${errorMessage}:`, error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, publishContent, isPublic, isPublished, onSaveTitle, setIsSaving, thumbnailUrl, updatedAt]);

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

      // Check if this is a template initialization
      if (templateId && templates[templateId]) {
        // Initialize with template content
        const templateContent = templates[templateId];
        setTitle(templateTitle || 'Untitled');
        setContent(templateContent);
        setPublishContent('');

        // Set author info
        setAuthorEmail(user?.email || null);
        setAuthorId(user?.uid || null);
        setAuthorName(user?.displayName || user?.email?.split('@')[0] || 'Anonymous');
        setDate(new Date().toLocaleDateString());

        // Initialize last saved refs to current values
        lastSavedContent.current = templateContent;
        lastSavedTitle.current = templateTitle || 'Untitled';

        setIsLoading(false);
        return;
      }

      // Watch this
      const noteContent = selectedSubNoteId
        ? await fetchSubNotePage(pageId, selectedSubNoteId)
        : await fetchNoteContent(pageId);

      if (noteContent) {
        setTitle(noteContent.title || '');
        setThumbnailUrl(noteContent.thumbnail || '');
        setAuthorEmail(noteContent.authorEmail || null);
        setAuthorId(noteContent.userId || null);
        setAuthorName(noteContent.authorName || '');
        setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());

        // Set content in context
        setContent(noteContent.content || '');
        setPublishContent(noteContent.publishContent || '');
        setIsPublished(noteContent.isPublished ?? false);
        setUpdatedAt(noteContent.updatedAt || null);

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
  }, [pageId, selectedSubNoteId, templateId, templateTitle, user?.email, user?.uid, user?.displayName, setContent, setPublishContent, setAuthorEmail]);

  useEffect(() => {
    if (pageId) {
      realTimeNoteTitle(pageId, setTitle);
    }
    loadNote();
  }, [pageId, loadNote]);

  const handleThemeChange = useCallback((themeValue: string) => {
    setCurrentTheme(themeValue);
  }, []);

  // Handle publish modal using updateNoteContent directly
  const handlePublish = useCallback(async (thumbnailUrl?: string, isPublished?: boolean, publishTitle?: string, publishContentFromModal?: string) => {
    if (!auth.currentUser || isSaving) return;

    try {
      setIsSaving(true);

      // If publishContent is provided from modal, update the context
      if (publishContentFromModal) {
        setPublishContent(publishContentFromModal);
      }

      await updateNoteContent(
        pageId,
        title,
        publishTitle || title,
        content,
        publishContentFromModal || publishContent,
        true, // isPublic for publishing
        isPublished,
        thumbnailUrl
      );

      // Call the onSaveTitle callback if provided
      if (onSaveTitle) {
        onSaveTitle(title);
      }

      toast.success(isPublished ? 'Note published successfully!' : 'Note saved as draft!');
      setShowPublishModal(false);
    } catch (error) {
      console.error('Error publishing note:', error);
      toast.error('Failed to publish note');
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, publishContent, onSaveTitle, setIsSaving, setPublishContent]);

  // Keyboard shortcuts - removed autoSave, only manual save and publish modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setShowPublishModal(true); // Show publish modal
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
  }, [handleSave, handleFormatCode]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading markdown editor...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col`}>
        <MarkdownNoteHeader
          title={title}
          titleRef={titleRef}
          handleTitleInput={handleTitleInput}
          viewMode={viewMode}
        />
        <MarkdownContentArea
          viewMode={viewMode}
          content={content}
          theme={getCurrentTheme()}
          onContentChange={setContent}
          onSave={handleSave}
          isSaving={isSaving}
          currentTheme={currentTheme}
          themes={availableThemes}
          isDarkMode={isDarkMode}
          pageId={pageId}
          authorName={authorName}
          authorId={authorId as string}
          date={date}
          onThemeChange={handleThemeChange}
          onFormatCode={handleFormatCode}
          editorRef={editorRef}
        />

        {/* Sub note list */}
        {/* if the current page path is /note/[id]/subnote/[subnoteId] then don't show the sub note list */}
        { !window.location.pathname.includes('/subnote/') ? <SubNoteList pageId={pageId} /> : null }

        {/* Publish Modal */}
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          title={title}
          thumbnailUrl={thumbnailUrl || ''}
          onPublish={handlePublish}
        />
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