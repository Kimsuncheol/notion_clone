"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { EditorView } from '@codemirror/view';
import { ThemeOption } from '@/components/markdown/ThemeSelector';
import MarkdownEditPane from '@/components/markdown/MarkdownEditPane';
import MarkdownPreviewPane from '@/components/markdown/MarkdownPreviewPane';
import { formatSelection } from '@/components/markdown/codeFormatter';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Template } from '@/types/templates';

// CodeMirror themes
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
  basicLight,
} from '@uiw/codemirror-themes-all';

interface TemplatePreviewEditorProps {
  template: Template;
  initialTitle: string;
  onTitleChange: (title: string) => void;
}

const TemplatePreviewEditor: React.FC<TemplatePreviewEditorProps> = ({ template, initialTitle, onTitleChange }) => {
  const [content, setContent] = useState(template.content);
  const [title, setTitle] = useState(initialTitle);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Available themes (same as MarkdownEditor)
  const availableThemes: ThemeOption[] = [
    { name: 'GitHub Light', value: 'githubLight', theme: githubLight, category: 'light' },
    { name: 'Material Light', value: 'materialLight', theme: materialLight, category: 'light' },
    { name: 'Solarized Light', value: 'solarizedLight', theme: solarizedLight, category: 'light' },
    { name: 'Tokyo Night Day', value: 'tokyoNightDay', theme: tokyoNightDay, category: 'light' },
    { name: 'VS Code Light', value: 'vscodeLight', theme: vscodeLight, category: 'light' },
    { name: 'Eclipse', value: 'eclipse', theme: eclipse, category: 'light' },
    { name: 'Basic Light', value: 'basicLight', theme: basicLight, category: 'light' },
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

  // Update title when external title changes
  useEffect(() => {
    setTitle(initialTitle);
    if (titleRef.current) {
      titleRef.current.textContent = initialTitle;
    }
  }, [initialTitle]);

  // Detect dark mode and set default theme
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);

      if (currentTheme === 'githubLight' && isDark) {
        setCurrentTheme('githubDark');
      } else if (currentTheme === 'githubDark' && !isDark) {
        setCurrentTheme('githubLight');
      }
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, [currentTheme]);

  const getCurrentTheme = () => {
    const themeObj = availableThemes.find((theme) => theme.value === currentTheme);
    return themeObj?.theme || githubLight;
  };

  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newTitle = target.textContent || '';
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleThemeChange = (themeValue: string) => {
    setCurrentTheme(themeValue);
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      formatSelection(editorRef.current);
      setTimeout(() => {
        if (editorRef.current) {
          setContent(editorRef.current.state.doc.toString());
        }
      }, 100);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        {/* Title Section */}
        <div className="w-full flex flex-col p-4 pb-2 gap-6 border-b border-gray-200 dark:border-gray-700">
          <div
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleTitleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className="w-full text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            ref={titleRef}
          ></div>
          {!title && (
            <div className="absolute pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500">
              {template.name}
            </div>
          )}
          <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Edit Pane */}
          <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
            <MarkdownEditPane
              content={content}
              theme={getCurrentTheme()}
              onContentChange={setContent}
              onSave={() => {}}
              isSaving={false}
              currentTheme={currentTheme}
              themes={availableThemes}
              isDarkMode={isDarkMode}
              onThemeChange={handleThemeChange}
              onFormatCode={handleFormatCode}
              editorRef={editorRef}
            />
          </div>

          {/* Preview Pane */}
          <div className="w-1/2 flex flex-col">
            <MarkdownPreviewPane
              content={content}
              viewMode="split"
              pageId="template-preview"
              authorName={user?.displayName || user?.email?.split('@')[0] || 'Anonymous'}
              authorId={user?.uid || ''}
              date={new Date().toLocaleDateString()}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TemplatePreviewEditor; 