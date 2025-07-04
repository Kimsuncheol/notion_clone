import React, { useState, useEffect, useCallback } from 'react';
import { updateNoteContent, fetchNoteContent } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './markdown';
import { ThemeOption } from './markdown/ThemeSelector';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PublishModal from './PublishModal';

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
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  pageId,
  onSaveTitle,
  onBlockCommentsChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPublic = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName, setAuthorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const auth = getAuth(firebaseApp);

  const user = auth.currentUser;
  const viewMode = user && user.email === authorEmail ? 'split' : 'preview';

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

  // Load note content
  useEffect(() => {
    const loadNote = async () => {
      if (!pageId) return;
      
      try {
        setIsLoading(true);
        const noteContent = await fetchNoteContent(pageId);
        
        if (noteContent) {
          setTitle(noteContent.title || '');
          setAuthorEmail(noteContent.authorEmail || null);
          setAuthorId(noteContent.userId || null);
          setAuthorName(noteContent.authorName || '');
          setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());

          // For markdown notes, we now store content directly
          setContent(noteContent.content || '');
        }
      } catch (error) {
        console.error('Error loading note:', error);
        toast.error('Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [pageId]);

  // Auto-save functionality
  const saveNote = useCallback(async (isManualSave = false) => {
    if (!auth.currentUser || isSaving) return;

    try {
      setIsSaving(true);
      
      // Save markdown content directly
      await updateNoteContent(pageId, title, content, isPublic);
      onSaveTitle(title);
      
      // Show success message for manual saves
      if (isManualSave) {
        toast.success('Note saved successfully!');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, content, pageId, title, isPublic, onSaveTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleThemeChange = useCallback((themeValue: string) => {
    setCurrentTheme(themeValue);
  }, []);

  const handleSave = useCallback(() => {
    saveNote(true);
  }, [saveNote]);

  // Handle publish modal
  const handlePublish = useCallback(async (thumbnailUrl?: string, isPublished?: boolean, publishTitle?: string, publishContent?: string) => {
    try {
      // Save with publish status and thumbnail
      await updateNoteContent(pageId, publishTitle || title, publishContent || '', true, isPublished, thumbnailUrl);
      toast.success(isPublished ? 'Note published successfully!' : 'Note saved as draft!');
    } catch (error) {
      console.error('Error publishing note:', error);
      toast.error('Failed to publish note');
    }
  }, [pageId, title]);

  // Keyboard shortcuts for save as draft (Cmd+S / Ctrl+S) and publish modal (Cmd+Shift+S / Ctrl+Shift+S)
  useEffect(() => {
    console.log('MarkdownEditor is rendering with showPublishModal:', showPublishModal);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        console.log('Cmd+Shift+S pressed, showing publish modal');
        setShowPublishModal(true); // Show publish modal
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handlePublish(undefined, false, title, ''); // Save as draft
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePublish]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading markdown editor...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="flex flex-col">
      <div className={`${user && user.email === authorEmail ? 'w-1/2' : 'w-full'} border-r flex flex-col p-4 pb-2 gap-6 border-gray-200 dark:border-gray-700 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
        />
        <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
      </div>
      
      <MarkdownContentArea
        viewMode={viewMode}
        content={content}
        theme={getCurrentTheme()}
        onContentChange={handleContentChange}
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
      />

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title={title}
        onPublish={handlePublish}
      />
    </div>
    </DndProvider>
  );
};

export default MarkdownEditor; 