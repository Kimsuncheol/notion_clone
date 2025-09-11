'use client'
import { mintColor1, mintColor2 } from '@/constants/color';
import { Button } from '@mui/material';
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import MarkdownPreviewPaneForAbout from './MarkdownPreviewPaneForAbout';
import MarkdownEditPaneForAbout from './MarkdownEditPaneForAbout';
import { getCurrentTheme } from '@/utils/getCurrentTheme';
import { formatSelection } from './markdown/codeFormatter';
import { EditorView } from '@uiw/react-codemirror';
import { fetchUserIntroduction, updateUserIntroduction } from '@/services/about/firebase';

// Debounce hook for content updates
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function MarkdownEditorViewForAbout() {
  const [isEditingAbout, setIsEditingAbout] = useState<boolean>(false);
  const [contentForAbout, setContentForAbout] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const editorRef = useRef<EditorView | null>(null);

  // Debounce content updates to reduce re-renders
  const debouncedContent = useDebounce(contentForAbout, 300);

  // Memoize theme to prevent unnecessary recalculations
  const theme = useMemo(() => getCurrentTheme(currentTheme), [currentTheme]);

  // Memoize button styles to prevent object recreation
  const buttonStyles = useMemo(() => ({
    backgroundColor: mintColor1,
    color: 'black',
    fontWeight: 'bold',
    fontSize: '16px',
    '&:hover': { backgroundColor: mintColor2 }
  }), []);

  const handleFormatCode = useCallback(() => {
    if (editorRef.current) {
      formatSelection(editorRef.current);
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        if (editorRef.current) {
          setContentForAbout(editorRef.current.state.doc.toString());
        }
      });
    }
  }, []);

  // Memoize the dark mode checker to prevent recreation
  const checkDarkMode = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);

    // Set default theme based on mode if not already set
    if (currentTheme === 'githubLight' && isDark) {
      setCurrentTheme('githubDark');
    } else if (currentTheme === 'githubDark' && !isDark) {
      setCurrentTheme('githubLight');
    }
  }, [currentTheme]);

  useEffect(() => {
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
  }, [checkDarkMode]);

  // Memoize keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
    } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      handleFormatCode();
    }
  }, [handleFormatCode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fetch introduction only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchIntroduction = async () => {
      try {
        const introduction = await fetchUserIntroduction();
        if (isMounted) {
          setContentForAbout(introduction);
        }
      } catch (error) {
        console.error('Failed to fetch introduction:', error);
      }
    };
    
    fetchIntroduction();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize save handler
  const handleSave = useCallback(async () => {
    try {
      handleFormatCode();
      await updateUserIntroduction(contentForAbout);
      setIsEditingAbout(false);
    } catch (error) {
      console.error('Failed to save introduction:', error);
    }
  }, [contentForAbout, handleFormatCode]);

  // Memoize toggle edit handler
  const handleToggleEdit = useCallback(() => {
    if (isEditingAbout) {
      handleSave();
    } else {
      setIsEditingAbout(true);
    }
  }, [isEditingAbout, handleSave]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Switch button */}
      <div className="text-right w-full">
        <Button
          variant='contained'
          sx={buttonStyles}
          onClick={handleToggleEdit}
        >
          {isEditingAbout ? 'Save' : 'Edit'}
        </Button>
      </div>
      {isEditingAbout ? (
        <MarkdownEditPaneForAbout
          contentForAbout={debouncedContent}
          theme={theme}
          onContentChange={setContentForAbout}
          isDarkMode={isDarkMode}
          editorRef={editorRef}
        />
      ) : (
        <MarkdownPreviewPaneForAbout
          contentForAbout={debouncedContent}
        />
      )}
    </div>
  );
}

export default memo(MarkdownEditorViewForAbout);
