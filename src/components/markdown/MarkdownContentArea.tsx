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
import StickySocialSidebar from '../note/StickySocialSidebar';
import PostsYouMightBeInterestedInGrid from '../note/PostsYouMightBeInterestedInGrid';
import SubNoteList from '../sidebar/SubNoteList';
import { ArrowLeft } from '@mui/icons-material';

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
  authorEmail: string;
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
  authorEmail,
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
    <div className={`flex flex-col h-full gap-4 ${viewMode === 'preview' ? 'w-2/3 mx-auto' : 'w-full'}`}>
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
                '& fieldset': { border: 'none', p: 0, m: 0 },
                '&:hover fieldset': { border: 'none', p: 0, m: 0 },
                '&.Mui-focused fieldset': { border: 'none', p: 0, m: 0 },
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
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'hidden'} flex flex-col border-r border-gray-200 dark:border-gray-700 relative`}>
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
        <div className={`${viewMode === 'split' ? 'w-1/2' : (viewMode === 'preview' ? 'w-full relative' : 'hidden')} flex`}>
          {viewMode === 'preview' && (
            <StickySocialSidebar />
          )}
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <MarkdownPreviewPane
              content={content}
              viewMode={viewMode}
              pageId={pageId}
              authorName={authorName}
              authorEmail={authorEmail}
              authorId={authorId}
              date={date}
              isSubNote={isSubNote}
            />
          </div>

          {/* TOC Sidebar - Fixed width sidebar on the right */}
          {(viewMode === 'preview') && (
            <TableOfContents
              content={content}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* Posts you might be interested in */}
      {viewMode === 'preview' && (
        <PostsYouMightBeInterestedInGrid posts={[]} />
      )}
      {/* if the current page path is /note/[id]/subnote/[subnoteId] then don't show the sub note list */}
      {!window.location.pathname.includes('/subnote/') && viewMode === 'preview' ? <SubNoteList pageId={pageId} /> : null}
    </div>
  );
};

export default MarkdownContentArea; 