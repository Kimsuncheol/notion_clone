import React from 'react';
import MarkdownEditPane from './MarkdownEditPane';
import MarkdownPreviewPane from './MarkdownPreviewPane';
import { ViewMode } from './ViewModeControls';
import { Extension } from '@codemirror/state';
import { ThemeOption } from './ThemeSelector';
import { EditorView } from '@codemirror/view';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { TextField } from '@mui/material';
import TableOfContents from './TableOfContents';

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
  onTitleCommit?: (title: string) => void;
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
  onTitleCommit,
}) => {
  const { selectedNoteTitle, setSelectedNoteTitle } = useAddaSubNoteSidebarStore();
  return (
    <div className='flex flex-col h-full w-full gap-4'>
      {/* Title with the TextField component */}
      {isSubNote && (
        <div className='px-6 pt-4'>
          {/* Don't modify the TextField outer features. */}
          <TextField
            label='Title'
            value={selectedNoteTitle}
            placeholder='Untitled'
            onChange={(e) => setSelectedNoteTitle(e.target.value)}
            onBlur={(e) => {
              if (onTitleCommit) onTitleCommit(e.target.value);
            }}
            InputProps={{
              sx: {
                p: 0,
                m: 0,
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                '& fieldset': {border: 'none', p: 0, m: 0},
                '&:hover fieldset': {border: 'none', p: 0, m: 0},
                '&.Mui-focused fieldset': {border: 'none', p: 0, m: 0},
                '& .MuiInputBase-input': {
                  p: 0,
                  m: 0,
                  height: 'auto'
                },
              },
            }}
            InputLabelProps={{ shrink: true, sx: { display: 'none' } }}
            sx={{
              p: 0,
              m: 0,
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              '& .MuiInputBase-root': {
                p: 0,
              },
            }}
          />
        </div>
      )}
      <div className={`flex-1 flex overflow-hidden`}>
        {/* Edit Mode */}
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'hidden'} flex flex-col border-r border-gray-200 dark:border-gray-700`}>
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


        {/* Preview Mode */}
        <div className={`${viewMode === 'split' ? 'w-1/2' : (viewMode === 'preview' ? 'w-full' : 'hidden')} flex`}>
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <MarkdownPreviewPane
              content={content}
              viewMode={viewMode}
              pageId={pageId}
              authorName={authorName}
              authorId={authorId}
              date={date}
              isSubNote={isSubNote}
            />
          </div>
          
          {/* TOC Sidebar - Fixed width sidebar on the right */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="hidden lg:block h-full overflow-y-auto">
              <div className="w-64 fixed top-1/2 right-4 -translate-y-1/2">
                <TableOfContents 
                  content={content}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownContentArea; 