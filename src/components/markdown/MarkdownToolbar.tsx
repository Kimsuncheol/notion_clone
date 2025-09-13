import React, { useRef } from 'react';
import ThemeSelector, { ThemeOption } from './ThemeSelector';
import SaveStatus from './SaveStatus';
import FunctionsIcon from '@mui/icons-material/Functions';
import { MarkdownTag } from './interface';
import { htmlTags } from './constants';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface MarkdownToolbarProps {
  onInsertTag: (tag: string, isSelfClosing?: boolean) => void;
  onFormatCode?: () => void;
  isSaving: boolean;
  currentTheme: string;
  themes: ThemeOption[];
  isDarkMode: boolean;
  onThemeChange: (themeValue: string) => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsertTag,
  isSaving,
  currentTheme,
  themes,
  isDarkMode,
  onThemeChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showSpecialCharactersModal, setShowSpecialCharactersModal } = useMarkdownStore();

  const handleTagClick = (tag: MarkdownTag) => {
    onInsertTag(tag.tag || '', tag.isSelfClosing);
  };

  const gap = 4.667;          // Don't change this
  const padding = 16.25;      // Don't change this

  return (
    <div className="mb-4" >
      <div className={`flex items-center px-[${padding}px] py-2 w-full`}>
        <div
          ref={scrollContainerRef}
          className={`flex-1 flex items-center flex-wrap gap-[${gap}px] overflow-x-auto no-scrollbar`}
        >
          {htmlTags.map((tag) => (
            <div
              key={tag.tag}
              onClick={() => handleTagClick(tag)}
              // Don't change the border color
              className="merriweather-100 flex-shrink-0 flex items-center justify-center min-w-[32px] h-9 aspect-square text-sm font-medium rounded bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600  transition-colors font-mono"
              title={`${tag.description} (<${tag.tag}>)`}
            >
              {
                typeof tag.icon === 'string' && /\d+/g.exec(tag.icon) ? (<span className='flex items-center justify-center'>
                  {tag.icon.slice(0, 1)}
                    <span className="text-[8px] mt-1">{tag.icon.slice(1)}</span>
                  </span>
                ) : (<span className="">{tag.icon}</span>)
              }
            </div>
          ))}

          <div id='special-characters-modal-trigger' onClick={() => setShowSpecialCharactersModal(!showSpecialCharactersModal)}>
            <FunctionsIcon />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-3 py-2">
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          themes={themes}
          isDarkMode={isDarkMode}
        />
        <SaveStatus isSaving={isSaving} />
      </div>
    </div>
  );
};

export default MarkdownToolbar; 