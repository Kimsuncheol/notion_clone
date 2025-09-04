import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNoteContent } from '@/services/markdown/firebase';
import { handleSave as serviceHandleSave, handlePublish as serviceHandlePublish, SaveNoteParams, PublishNoteParams } from '@/services/markdown/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import PublishModal from './PublishModal';
// Removed NoteContentProvider and useNoteContent - using Zustand store instead
import { EditorView } from '@codemirror/view';
import { formatSelection } from './codeFormatter';


// Import all available themes
import { githubLight } from '@uiw/codemirror-themes-all';
import MarkdownNoteHeader from './MarkdownNoteHeader';
import { availableThemes } from './constants';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import MarkdownEditorBottomBar from './markdownEditorBottomBar';
import PublishScreen from '../note/PublishScreen';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { SeriesType, TagType } from '@/types/firebase';

interface MarkdownEditorProps {
  pageId?: string;
  onBlockCommentsChange?: (newBlockComments: Record<string, Comment[]>) => void;
  tags?: TagType[];
  isPublic?: boolean;
  isPublished?: boolean;
  templateId?: string | null;
  templateTitle?: string | null;
}

// Inner component that uses the Zustand store
const MarkdownEditorInner: React.FC<MarkdownEditorProps> = ({
  pageId,
  onBlockCommentsChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPublic = false,

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
    setTags
  } = useMarkdownEditorContentStore();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
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



  const handleSave = useCallback(async () => {
    if (!auth.currentUser || isSaving) return;

    const noteTitle = title;
    const noteContent = content;

    try {
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
        tags: tags
      };

      await serviceHandleSave(saveParams);

      // Update saved references after successful save
      lastSavedContent.current = noteContent;
      lastSavedTitle.current = noteTitle;
    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handleSave wrapper:', error);
    } 
  }, [auth.currentUser, isSaving, pageId, title, content, description, isPublic, isPublished, thumbnailUrl, updatedAt, tags]);

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

  // Update contentEditable content only when title changes from external source
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      const cursorPosition = saveCursorPosition();
      titleRef.current.textContent = title;
      restoreCursorPosition(cursorPosition);
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

  // Load note content
  const loadNote = useCallback(async () => {
    if (!pageId) return;

    try {
      const noteContent = await fetchNoteContent(pageId);

      if (noteContent) {
        setTitle(noteContent.title || '');
        setThumbnailUrl(noteContent.thumbnailUrl || '');
        setAuthorEmail(noteContent.authorEmail || null);
        setAuthorId(noteContent.userId || null);
        setAuthorName(noteContent.authorName || '');
        setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());
        setTags(noteContent.tags || []);
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
    } 
  }, [pageId, setContent, setDescription, setAuthorEmail, setTitle, setTags]);

  useEffect(() => {
    loadNote();
  }, [pageId, loadNote]);

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
      <div className={`w-[90%] mx-auto flex flex-col h-full`}>
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
          tags={tags}
        />

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
      {viewMode === 'split' && (
        <MarkdownEditorBottomBar
          saveDraft={() => handleSave()}
          showPublishScreen={() => setShowMarkdownPublishScreen(true)}
          pageId={pageId}
          isPublished={isPublished}
        />
      )}
    </DndProvider>
  );
};

// Main component - no longer needs context provider
const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  return <MarkdownEditorInner {...props} />;
};

export default MarkdownEditor; 