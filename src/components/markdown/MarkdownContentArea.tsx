import React from 'react';
import MarkdownEditPane from './MarkdownEditPane';
import MarkdownPreviewPane from './MarkdownPreviewPane';
import { ViewMode } from './ViewModeControls';
import { Extension } from '@codemirror/state';
import { ThemeOption } from './ThemeSelector';

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
  onThemeChange: (themeValue: string) => void;
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
  onThemeChange,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Edit Mode */}
      {(viewMode === 'edit' || viewMode === 'split') && (
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200 dark:border-gray-700`}>
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
          />
        </div>
      )}

      {/* Preview Mode */}
      {(viewMode === 'preview' || viewMode === 'split') && (
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
          <MarkdownPreviewPane content={content} />
        </div>
      )}
    </div>
  );
};

export default MarkdownContentArea; 