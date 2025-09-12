import React from 'react';
import MarkdownEditPane from './MarkdownEditPane';
import MarkdownPreviewPane from './MarkdownPreviewPane';
import { ViewMode } from './ViewModeControls';
import { Extension } from '@codemirror/state';
import { ThemeOption } from './ThemeSelector';
import { EditorView } from '@codemirror/view';
import TableOfContents from './TableOfContents';
import StickySocialSidebar from '../note/StickySocialSidebar';
// import PostsYouMightBeInterestedInGrid from '../note/PostsYouMightBeInterestedInGrid';
import { TagType } from '@/types/firebase';

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
  pageId?: string;
  authorName: string;
  authorEmail: string;
  authorId: string;
  date: string;
  onThemeChange: (themeValue: string) => void;
  onFormatCode: () => void;
  editorRef: React.RefObject<EditorView | null>;
  onTitleCommit?: (title: string) => void;
  viewCount?: number;
  likeCount?: number;
  setViewCount?: (viewCount: number) => void;
  setLikeCount?: (likeCount: number) => void;
  isInLikeUsers?: boolean;
  tags?: TagType[];
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
  viewCount,
  likeCount,
  date,
  onThemeChange,
  onFormatCode,
  editorRef,
  tags,
  // setViewCount,
  setLikeCount,
  isInLikeUsers,
}) => {
  return (
    <div className='w-full h-full'>
      <div className={`flex h-full ${viewMode === 'preview' ? 'justify-center' : ''}`}>
        {/* Sticky Social Sidebar - only in preview mode */}
        {viewMode === 'preview' && pageId && (
          <StickySocialSidebar 
            pageId={pageId} 
            authorId={authorId}
            likeCount={likeCount || 0} 
            setLikeCount={setLikeCount || (() => { })} 
            isInLikeUsers={isInLikeUsers || false} 
          />
        )}

        <div className={`flex h-full flex-col gap-4 ${viewMode === 'preview' ? 'w-2/3 max-w-4xl' : 'w-full'}`}>
          {/* Title with the TextField component */}
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
              />
            </div>


            {/* Preview Mode */}
            <div className={`${viewMode === 'split' ? 'w-1/2' : (viewMode === 'preview' ? 'w-full relative' : 'hidden')} flex`}>
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <MarkdownPreviewPane
                  content={content}
                  viewMode={viewMode}
                  pageId={pageId || ''}
                  authorName={authorName}
                  authorEmail={authorEmail}
                  authorId={authorId}
                  date={date}
                  viewCount={viewCount || 0}
                  tags={tags}
                />
              </div>
            </div>
          </div>
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
  );
};

export default MarkdownContentArea; 