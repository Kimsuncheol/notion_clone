import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNoteContent, updateFavoriteNoteTitle, updateNoteContent } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './markdown';
import { ThemeOption } from './markdown/ThemeSelector';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PublishModal from './PublishModal';
import { NoteContentProvider, useNoteContent } from '@/contexts/NoteContentContext';
import { EditorView } from '@codemirror/view';
import { formatSelection } from './markdown/codeFormatter';
import { useAutosave } from 'react-autosave';

// Import all available themes
import {
  githubLight,
  githubDark,
  dracula,
  tokyoNight,
  tokyoNightDay,
  tokyoNightStorm,
  vscodeDark,
  vscodeLight,
  materialDark,
  materialLight,
  solarizedLight,
  solarizedDark,
  nord,
  monokai,
  gruvboxDark,
  sublime,
  okaidia,
  eclipse,
  bespin,
  atomone,
  aura,
  basicDark,
  basicLight
} from '@uiw/codemirror-themes-all';

// Define available themes
const availableThemes: ThemeOption[] = [
  // Light themes
  { name: 'GitHub Light', value: 'githubLight', theme: githubLight, category: 'light' },
  { name: 'Material Light', value: 'materialLight', theme: materialLight, category: 'light' },
  { name: 'Solarized Light', value: 'solarizedLight', theme: solarizedLight, category: 'light' },
  { name: 'Tokyo Night Day', value: 'tokyoNightDay', theme: tokyoNightDay, category: 'light' },
  { name: 'VS Code Light', value: 'vscodeLight', theme: vscodeLight, category: 'light' },
  { name: 'Eclipse', value: 'eclipse', theme: eclipse, category: 'light' },
  { name: 'Basic Light', value: 'basicLight', theme: basicLight, category: 'light' },

  // Dark themes
  { name: 'GitHub Dark', value: 'githubDark', theme: githubDark, category: 'dark' },
  { name: 'Dracula', value: 'dracula', theme: dracula, category: 'dark' },
  { name: 'Tokyo Night', value: 'tokyoNight', theme: tokyoNight, category: 'dark' },
  { name: 'Tokyo Night Storm', value: 'tokyoNightStorm', theme: tokyoNightStorm, category: 'dark' },
  { name: 'VS Code Dark', value: 'vscodeDark', theme: vscodeDark, category: 'dark' },
  { name: 'Material Dark', value: 'materialDark', theme: materialDark, category: 'dark' },
  { name: 'Solarized Dark', value: 'solarizedDark', theme: solarizedDark, category: 'dark' },
  { name: 'Nord', value: 'nord', theme: nord, category: 'dark' },
  { name: 'Monokai', value: 'monokai', theme: monokai, category: 'dark' },
  { name: 'Gruvbox Dark', value: 'gruvboxDark', theme: gruvboxDark, category: 'dark' },
  { name: 'Sublime', value: 'sublime', theme: sublime, category: 'dark' },
  { name: 'Okaidia', value: 'okaidia', theme: okaidia, category: 'dark' },
  { name: 'Bespin', value: 'bespin', theme: bespin, category: 'dark' },
  { name: 'Atom One', value: 'atomone', theme: atomone, category: 'dark' },
  { name: 'Aura', value: 'aura', theme: aura, category: 'dark' },
  { name: 'Basic Dark', value: 'basicDark', theme: basicDark, category: 'dark' },
];

interface MarkdownEditorProps {
  pageId: string;
  onSaveTitle: (title: string) => void;
  onBlockCommentsChange?: (newBlockComments: Record<string, Comment[]>) => void;
  isPublic?: boolean;
  isPublished?: boolean;
}

// Inner component that uses the context
const MarkdownEditorInner: React.FC<MarkdownEditorProps> = ({
  pageId,
  onBlockCommentsChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPublic = false
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
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName, setAuthorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const auth = getAuth(firebaseApp);

  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');

  const user = auth.currentUser;
  const viewMode = user && user.email === authorEmail ? 'split' : 'preview';

  const handleSave = useCallback(async (isAutoSave = false, data?: { title: string; content: string }) => {
    if (!auth.currentUser || isSaving) return;

    const noteTitle = isAutoSave && data ? data.title : title;
    const noteContent = isAutoSave && data ? data.content : content;

    // Add validation for manual save
    if (!isAutoSave) {
      if (!noteTitle.trim()) {
        toast.error('Please enter a title');
        return;
      }
      if (!noteContent.trim()) {
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
  }, [auth.currentUser, isSaving, pageId, title, content, publishContent, isPublic, isPublished, onSaveTitle, setIsSaving, thumbnailUrl]);

  // Auto-save function using react-autosave
  const performAutoSave = useCallback(async (data: { title: string; content: string }) => {
    // Only save if content or title has actually changed
    if (data.content === lastSavedContent.current && data.title === lastSavedTitle.current) {
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
      }, 100);
    }
  }, [setContent]);

  // Load note content
  useEffect(() => {
    const loadNote = async () => {
      if (!pageId) return;

      try {
        setIsLoading(true);
        const noteContent = await fetchNoteContent(pageId);

        if (noteContent) {
          setTitle(noteContent.title || '');
          setThumbnailUrl(noteContent.thumbnail || '');
          setAuthorEmail(noteContent.authorEmail || null);
          setAuthorId(noteContent.userId || null);
          setAuthorName(noteContent.authorName || '');
          setTitle(noteContent.title || '');
          setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());

          // Set content in context
          setContent(noteContent.content || '');
          setPublishContent(noteContent.publishContent || '');
          setIsPublished(noteContent.isPublished ?? false);

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
    };

    loadNote();
  }, [pageId, setContent, setPublishContent]);

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
      <div className="flex flex-col sticky left-60 top-10">
        <div className={`w-full border-r flex flex-col p-4 pb-2 gap-6 border-gray-200 dark:border-gray-700 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
          <div
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleTitleInput}
            onKeyDown={(e) => {
              // Prevent Enter key from creating new lines (optional)
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className="w-full text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            ref={titleRef}
          >
          </div>
          {!title && (
            <div className="absolute pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500">
              Untitled
            </div>
          )}
          <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
        </div>

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