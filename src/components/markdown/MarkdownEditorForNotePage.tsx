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
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import MarkdownEditorBottomBar from './markdownEditorBottomBar';
import PublishScreen from '../note/PublishScreen';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import toast from 'react-hot-toast';

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
    tags,
    setTags,
    // setAuthorEmail,
    setShowSpecialCharactersModal,
    setShowEmojiPicker,
    setShowLaTeXModal,
    setShowDeleteConfirmation,
    setSelectedSeries,
    displayName,
    visibility
  } = useMarkdownStore();

  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName] = useState<string>('');
  const [date] = useState<string>('');
  const [draftPageId, setDraftPageId] = useState<string | undefined>(pageId);
  const auth = getAuth(firebaseApp);
  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showMarkdownPublishScreen, setShowMarkdownPublishScreen, selectedSeries, setViewMode, avatar } = useMarkdownStore();

  useEffect(() => {
    setDraftPageId(pageId);
  }, [pageId]);

  const handleSave = useCallback(async () => {
    if (!auth.currentUser || isSaving) return;

    if (!title.trim()) {
      toast.error('Please enter a title before saving your draft.');
      return;
    }

    if (!content.trim()) {
      toast.error('Please add content before saving your draft.');
      return;
    }

    try {
      setIsSaving(true);

      if (!draftPageId) {
        // Create new note
        const newNoteId = await SaveDraftedNote(title, content, tags);

        setDraftPageId(newNoteId);
      } else {
        // Update existing note - use the existing updateNoteContent logic
        const { handleSave: serviceHandleSave } = await import('@/services/markdown/firebase');
        await serviceHandleSave({
          pageId: draftPageId,
          title,
          content,
          description,
          authorAvatar: avatar || '',
          // authorDisplayName: displayName || '',
          tags,
        });
      }

    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handleSave wrapper:', error);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, draftPageId, title, content, description, tags, setIsSaving, setDraftPageId, avatar]);

  // Function to save and restore cursor position (improved version)
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && titleRef.current) {
      const range = selection.getRangeAt(0);

      // Check if the selection is within our contentEditable element
      if (titleRef.current.contains(range.commonAncestorContainer)) {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(titleRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
      }
    }
    return 0;
  }, []);

  const restoreCursorPosition = useCallback((position: number) => {
    if (!titleRef.current) return;

    const range = document.createRange();
    const selection = window.getSelection();

    let charCount = 0;
    const walker = document.createTreeWalker(
      titleRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      const textNode = node as Text;
      const nodeLength = textNode.textContent?.length || 0;

      if (charCount + nodeLength >= position) {
        const offset = position - charCount;
        range.setStart(textNode, Math.min(offset, nodeLength));
        range.setEnd(textNode, Math.min(offset, nodeLength));
        break;
      }
      charCount += nodeLength;
    }

    // If we couldn't find the exact position, set cursor at the end
    if (!node && titleRef.current.lastChild) {
      if (titleRef.current.lastChild.nodeType === Node.TEXT_NODE) {
        const lastTextNode = titleRef.current.lastChild as Text;
        const length = lastTextNode.textContent?.length || 0;
        range.setStart(lastTextNode, length);
        range.setEnd(lastTextNode, length);
      } else {
        range.setStartAfter(titleRef.current.lastChild);
        range.setEndAfter(titleRef.current.lastChild);
      }
    }

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  const handleTitleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newTitle = target.textContent || '';

    // Save cursor position before state update
    const cursorPosition = saveCursorPosition();

    setTitle(newTitle);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      restoreCursorPosition(cursorPosition);
    });
  }, [setTitle, saveCursorPosition, restoreCursorPosition]);

  // Updated useEffect to handle title changes from external sources
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      const cursorPosition = saveCursorPosition();
      titleRef.current.textContent = title;

      // Only restore cursor if the element has focus
      if (document.activeElement === titleRef.current) {
        requestAnimationFrame(() => {
          restoreCursorPosition(cursorPosition);
        });
      }
    }
  }, [title, saveCursorPosition, restoreCursorPosition]);

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
  const handlePublish = useCallback(async (thumbnailUrl?: string, isPublic?: boolean) => {
    if (!auth.currentUser || isSaving) return;

    if (!title.trim()) {
      toast.error('Please enter a title before publishing.');
      return;
    }

    if (!content.trim()) {
      toast.error('Please add content before publishing.');
      return;
    }

    console.log('handlePublish called with:', { pageId, thumbnailUrl, isPublic });

    try {
      setIsSaving(true);

      const effectivePageId = draftPageId || pageId;

      const publishParams: PublishNoteParams = {
        pageId: effectivePageId || undefined,
        title,
        content,
        description,
        series: selectedSeries || undefined,
        thumbnailUrl,
        isPublic: isPublic ?? (visibility === 'public' ? true : false), // Use provided visibility or convert from visibility state
        isPublished: true, // Always mark as published when using publish function
        setShowMarkdownPublishScreen,
        authorAvatar: avatar || '',
        authorDisplayName: displayName || '',
        tags
      };

      const publishedNoteId = await serviceHandlePublish(publishParams);
      console.log('Published note - Original pageId:', pageId, 'Published noteId:', publishedNoteId);
      setViewMode('preview');
      router.push(`/${authorEmail}/note/${publishedNoteId}`);
    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handlePublish wrapper:', error);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, draftPageId, pageId, title, content, description, setIsSaving, setShowMarkdownPublishScreen, tags, selectedSeries, authorEmail, router, setViewMode, avatar, displayName, visibility]);

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

  // Cleanup on unmount - reset all state and clear refs
  useEffect(() => {
    setAuthorEmail(auth.currentUser?.email || null);
    return () => {
      // Reset Zustand store to initial state
      setTitle('');
      setContent('');
      setDescription('');
      setViewMode('preview');
      setIsSaving(false);
      setAuthorEmail(null);
      setShowSpecialCharactersModal(false);
      setShowEmojiPicker(false);
      setShowLaTeXModal(false);
      setShowMarkdownPublishScreen(false);
      setShowDeleteConfirmation(false);
      setTags([]);
      setSelectedSeries(null);
      
      // Clear refs
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Zustand setters are stable, don't need them in deps

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`w-[90%] mx-auto flex flex-col h-full`}>
        {showDeleteConfirmation && draftPageId && authorId && (
          <DeleteConfirmationModal pageId={draftPageId} authorId={authorId} />
        )}
        <MarkdownNoteHeader
          title={title}
          titleRef={titleRef}
          handleTitleInput={handleTitleInput}
          viewMode={'split'}
          pageId={draftPageId || ''}
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

        {showMarkdownPublishScreen && (
          <PublishScreen
            // title={title}
            description={description}
            url={`/@${authorEmail}/${title}`}
            // thumbnailUrl={thumbnailUrl}
            pageId={draftPageId}
            // setThumbnailUrl={setThumbnailUrl}
            setDescription={setDescription}
            isOpen={showMarkdownPublishScreen}
            onUploadThumbnail={() => { }}
            onCancel={() => setShowMarkdownPublishScreen(false)}
            onPublish={(visibility) => handlePublish(undefined, visibility === 'public')}
          />
        )}
      </div>
      <MarkdownEditorBottomBar
        saveDraft={() => handleSave()}
        showPublishScreen={() => setShowMarkdownPublishScreen(true)}
        isPublishOpen={showMarkdownPublishScreen}
      />
    </DndProvider>
  );
};

// Main component - no longer needs context provider
const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  return <MarkdownEditorInner {...props} />;
};

export default MarkdownEditor; 
