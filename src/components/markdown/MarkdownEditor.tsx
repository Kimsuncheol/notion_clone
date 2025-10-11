import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNoteContent, uploadThumbnail } from '@/services/markdown/firebase';
import { handleSave as serviceHandleSave, handlePublish as serviceHandlePublish, SaveNoteParams, PublishNoteParams } from '@/services/markdown/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EditorView } from '@codemirror/view';
import { formatSelection } from './codeFormatter';

import MarkdownNoteHeader from './MarkdownNoteHeader';
import { availableThemes } from './constants';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import MarkdownEditorBottomBar from './markdownEditorBottomBar';
import PublishScreen from '../note/PublishScreen';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { LikeUser, MyPost, MySeries, TagType } from '@/types/firebase';
import PostsYouMightBeInterestedInGrid from '../note/PostsYouMightBeInterestedInGrid';
import { getCurrentTheme } from '@/utils/getCurrentTheme';
import QRCodeModalForMarkdownEditor from './QRCodeModalForMarkdownEditor';
import { fetchServerRecommendations } from '@/services/recommendation/serverRecommendations';
import { fetchUserProfile } from '@/services/my-post/firebase';

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

}) => {
  // Using Zustand store instead of context
  const {
    title,
    setTitle,
    content,
    setContent,
    description,
    setDescription,
    setSummary,
    isSaving,
    setIsSaving,
    showDeleteConfirmation,
    tags,
    setTags,
    setShowSpecialCharactersModal,
    setShowEmojiPicker,
    setShowLaTeXModal,
    setShowDeleteConfirmation,
    setSelectedSeries,
    thumbnailUrl,
    setThumbnailUrl,
    setAuthorAvatar,
    authorAvatar,
    displayName,
    showQRCodeModalForMarkdownEditor,
    setShowQRCodeModalForMarkdownEditor,
    setVisibility,
    visibility,
    setAuthorProfile,
    setComments
  } = useMarkdownStore();
  // const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  // const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [existingSeries, setExistingSeries] = useState<MySeries | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName, setAuthorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [viewCount, setViewCount] = useState<number>(0);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [recommendedPosts, setRecommendedPosts] = useState<MyPost[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const auth = getAuth(firebaseApp);

  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');
  const user = auth.currentUser;
  const { viewMode, setAuthorEmail, authorEmail, showMarkdownPublishScreen, setShowMarkdownPublishScreen, selectedSeries, setViewMode, avatar } = useMarkdownStore();

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setRecommendedPosts([]);
      setIsLoadingRecommendations(false);
      return;
    }

    let isActive = true;
    setIsLoadingRecommendations(true);

    fetchServerRecommendations(userId)
      .then(posts => {
        if (!isActive) {
          return;
        }
        setRecommendedPosts(posts.slice(0, 12));
      })
      .catch(error => {
        console.error('Failed to fetch server recommendations:', error);
        if (!isActive) {
          return;
        }
        setRecommendedPosts([]);
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingRecommendations(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

   // Load note content
   const loadNote = useCallback(async () => {
    if (!pageId) return;

    try {
      // Fetch note content first, then use it to fetch author profile

      const noteContent = await fetchNoteContent(pageId);
      const authorProfileInfo = await fetchUserProfile(noteContent?.authorEmail || '');
      
      if (noteContent) {
        setTitle(noteContent.title || '');
        setAuthorEmail(noteContent.authorEmail || null);
        setAuthorId(noteContent.authorId || null);
        setAuthorName(noteContent.authorName || '');
        setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());
        setTags(noteContent.tags || []);
        setIsPublic(noteContent.isPublic ?? false);
        setVisibility(noteContent.isPublic ? 'public' : 'private');
        setAuthorAvatar(noteContent.authorAvatar || '');
        setAuthorProfile(authorProfileInfo || null);
        // Set content in context
        setContent(noteContent.content || '');
        setComments(noteContent.comments || []);
        setSelectedSeries(noteContent.series || null);
        setDescription(noteContent.description || '');
        setSummary(noteContent.summary || '');
        setIsPublished(noteContent.isPublished ?? false);
        setExistingSeries(noteContent.series || null);
        setUpdatedAt(noteContent.updatedAt || null);
        setViewCount(noteContent.viewCount || 0);
        setLikeCount(noteContent.likeCount || 0);
        setLikeUsers(noteContent.likeUsers || []);
        setSelectedSeries(noteContent.series || null);
        setThumbnailUrl(noteContent.thumbnailUrl || '');

        console.log('likecount in loadNote', noteContent.likeCount);


        // Initialize last saved refs to prevent immediate auto-save
        lastSavedContent.current = noteContent.content || '';
        lastSavedTitle.current = noteContent.title || '';
      }
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Failed to load note');
    } 
  }, [pageId, setTitle, setAuthorEmail, setTags, setVisibility, setAuthorAvatar, setAuthorProfile, setContent, setComments, setSelectedSeries, setDescription, setSummary, setThumbnailUrl]);

  useEffect(() => {
    loadNote();
  }, [pageId, loadNote]);


  const handleSave = useCallback(async () => {
    if (!auth.currentUser || isSaving) return;
    
    // Validate pageId before proceeding
    if (!pageId) {
      console.error('Cannot save: pageId is undefined');
      return;
    }

    const noteTitle = title;
    const noteContent = content;

    try {
      console.log('tags', tags);

      const saveParams: SaveNoteParams = {
        pageId: pageId,
        title: noteTitle,
        content: noteContent,
        description,
        authorAvatar: authorAvatar || '',
        authorDisplayName: displayName || '',
        isPublic,
        isPublished,
        thumbnailUrl: thumbnailUrl || '',
        series: existingSeries || undefined,
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
  }, [auth.currentUser, isSaving, pageId, title, content, description, isPublic, isPublished, thumbnailUrl, updatedAt, tags, existingSeries, authorAvatar, displayName]);

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

  // Update contentEditable content only when the title changess from external source
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      const cursorPosition = saveCursorPosition();
      titleRef.current.textContent = title;
      restoreCursorPosition(cursorPosition);
    }
  }, [title, saveCursorPosition, restoreCursorPosition]);

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

  // Handle thumbnail upload
  const handleUploadThumbnail = useCallback(async (file: File) => {
    if (!pageId || !auth.currentUser) {
      toast.error('Cannot upload thumbnail: No page ID or user not authenticated');
      return;
    }

    try {
      setIsSaving(true);
      const downloadUrl = await uploadThumbnail(file, pageId, (progress) => {
        // Optional: could show progress toast or update state
        console.log(`Thumbnail upload progress: ${progress.progress}%`);
      });
      
      // Update the store with the actual Firebase URL
      setThumbnailUrl(downloadUrl);
      
      // Reload note to get updated data from all collections
      await loadNote();
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setIsSaving(false);
    }
  }, [pageId, auth.currentUser, setThumbnailUrl, loadNote, setIsSaving]);

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

      const publishParams: PublishNoteParams = {
        pageId: pageId || undefined,
        title,
        content,
        description,
        series: selectedSeries || undefined,
        thumbnailUrl, // Use current thumbnailUrl from store
        isPublic: isPublic ?? (visibility === 'public' ? true : false), // Use provided visibility or convert from visibility state
        isPublished: true, // Always mark as published when using publish function
        authorAvatar: avatar || '',
        authorDisplayName: displayName || '',
        setShowMarkdownPublishScreen,
        tags
      };

      const publishedNoteId = await serviceHandlePublish(publishParams);
      setViewMode('preview');
      console.log('Published note with ID:', publishedNoteId);
    } catch (error) {
      // Error handling is already done in the service
      console.error('Error in handlePublish wrapper:', error);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, description, setIsSaving, setShowMarkdownPublishScreen, tags, selectedSeries, setViewMode, avatar, displayName, visibility]);

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
    return () => {
      // Reset Zustand store to initial state
      setTitle('');
      setContent('');
      setDescription('');
      setIsSaving(false);
      setAuthorEmail(null);
      setShowSpecialCharactersModal(false);
      setShowEmojiPicker(false);
      setShowLaTeXModal(false);
      setShowMarkdownPublishScreen(false);
      setShowDeleteConfirmation(false);
      setThumbnailUrl(null);
      setSelectedSeries(null);
      setIsPublic(false);
      setExistingSeries(null);
      setTags([]);
      setSelectedSeries(null);
      setComments([]);
      setAuthorAvatar(null);
      setAuthorProfile(null);
      setShowQRCodeModalForMarkdownEditor(false);
      // Clear refs
      if (editorRef.current) {
        editorRef.current = null;
      }
      
      // Reset local state refs
      lastSavedContent.current = '';
      lastSavedTitle.current = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Zustand setters are stable, don't need them in deps

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`w-[90%] mx-auto flex flex-col h-full`}>
        {showDeleteConfirmation && pageId && authorId && (
          <DeleteConfirmationModal pageId={pageId} authorId={authorId} />
        )}
        <MarkdownNoteHeader
          title={title}
          titleRef={titleRef}
          handleTitleInput={handleTitleInput}
          viewMode={viewMode}
          pageId={pageId || ''}
        />
        <MarkdownContentArea
          title={title} 
          viewMode={viewMode}
          content={content}
          viewCount={viewCount}
          likeCount={likeCount}
          theme={getCurrentTheme(currentTheme)}
          onContentChange={setContent}
          onSave={handleSave}
          isSaving={isSaving}
          currentTheme={currentTheme}
          themes={availableThemes}
          isDarkMode={isDarkMode}
          pageId={pageId || ''}
          authorName={authorName}
          authorEmail={authorEmail as string}
          authorId={authorId as string}
          date={date}
          isInLikeUsers={likeUsers.some(likedUser => likedUser.id === user!.uid)}
          onThemeChange={handleThemeChange}
          onFormatCode={handleFormatCode}
          editorRef={editorRef}
          setViewCount={setViewCount}
          setLikeCount={setLikeCount}
          tags={tags}
        />

        {showQRCodeModalForMarkdownEditor && (
          <QRCodeModalForMarkdownEditor onClose={() => setShowQRCodeModalForMarkdownEditor(false)} />
        )}

        {showMarkdownPublishScreen && (
          <PublishScreen
            pageId={pageId}
            isPublished={isPublished}
            // title={title}
            url={`/@${authorEmail}/${title}`}
            isOpen={showMarkdownPublishScreen}
            onUploadThumbnail={handleUploadThumbnail}
            description={description}
            setDescription={setDescription}
            existingSeries={existingSeries}
            onCancel={() => setShowMarkdownPublishScreen(false)}
            // If the publish function works well, 'onCancel' should works here too
            // onPublish={() => handlePublish()}
            onPublish={(visibility) => handlePublish(undefined, visibility === 'public')}
          />
        )}
        {/* Posts you might be interested in */}
        {viewMode === 'preview' && (
          <PostsYouMightBeInterestedInGrid
            posts={recommendedPosts}
            isLoading={isLoadingRecommendations}
          />
        )}
      </div>
      {viewMode === 'split' && (
        <MarkdownEditorBottomBar
          saveDraft={() => handleSave()}
          showPublishScreen={() => setShowMarkdownPublishScreen(true)}
          pageId={pageId}
          isPublished={isPublished}
          isPublishOpen={showMarkdownPublishScreen}
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
