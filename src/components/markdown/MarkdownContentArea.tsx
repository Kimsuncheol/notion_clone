import React from 'react';
import MarkdownEditPane from './MarkdownEditPane';
import MarkdownPreviewPane from './MarkdownPreviewPane';
import { ViewMode } from './ViewModeControls';
import { Extension } from '@codemirror/state';
import { ThemeOption } from './ThemeSelector';
import { EditorView } from '@codemirror/view';

interface MarkdownContentAreaProps {
  viewMode: ViewMode;
  content: string;
  theme: Extension;
  onContentChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  currentTheme: string;
  themes: ThemeOption[];
  isDarkMode: boolean;
  pageId: string;
  authorName: string;
  authorId: string;
  date: string;
  onThemeChange: (themeValue: string) => void;
  onFormatCode: () => void;
  editorRef: React.RefObject<EditorView | null>;
  isSubNote?: boolean;
}

const MarkdownContentArea: React.FC<MarkdownContentAreaProps> = ({
  viewMode,
  content,
  theme,
  onContentChange,
  onSave,
  isSaving,
  currentTheme,
  themes,
  isDarkMode,
  pageId,
  authorName,
  authorId,
  date,
  onThemeChange,
  onFormatCode,
  editorRef,
  isSubNote = false,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Edit Mode */}
      {(viewMode === 'split') && (
        <div className={`w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700`}>
          <MarkdownEditPane
            content={content}
            theme={theme}
            onContentChange={onContentChange}
            onSave={onSave}
            isSaving={isSaving}
            currentTheme={currentTheme}
            themes={themes}
            isDarkMode={isDarkMode}
            onThemeChange={onThemeChange}
            onFormatCode={onFormatCode}
            editorRef={editorRef}
            isSubNote={isSubNote}
          />
        </div>
      )}

      {/* Preview Mode */}
      {(viewMode === 'preview' || viewMode === 'split') && (
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}> 
          <MarkdownPreviewPane content={content} viewMode={viewMode} pageId={pageId} authorName={authorName} authorId={authorId} date={date} />
        </div>
      )}
    </div>
  );
};

export default MarkdownContentArea; 