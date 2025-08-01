import React, { useRef } from 'react';
import ThemeSelector, { ThemeOption } from './ThemeSelector';
import SaveStatus from './SaveStatus';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { HTMLTag, LatexStructure } from './interface';
import { htmlTags, latexStructures } from './constants';

interface MarkdownToolbarProps {
  onInsertTag: (tag: string, isSelfClosing?: boolean) => void;
  onInsertLatex?: (expression: string, isBlock?: boolean, cursorOffset?: number) => void;
  onEmojiClick: () => void;
  onFormatCode?: () => void;
  isSaving: boolean;
  currentTheme: string;
  themes: ThemeOption[];
  isDarkMode: boolean;
  onThemeChange: (themeValue: string) => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsertTag,
  onInsertLatex,
  onEmojiClick,
  onFormatCode,
  isSaving,
  currentTheme,
  themes,
  isDarkMode,
  onThemeChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTagClick = (tag: HTMLTag) => {
    onInsertTag(tag.tag, tag.isSelfClosing);
  };

  const handleLatexClick = (latex: LatexStructure) => {
    if (onInsertLatex) {
      onInsertLatex(latex.expression, latex.isBlock, latex.cursorOffset);
    }
  };

  const gap = 4.667;          // Don't change this
  const padding = 16.25;      // Don't change this

  return (
    <div className=" bg-black mb-4">
      <div className={`flex items-center px-[${padding}px] py-2 w-full`}>
        <div
          ref={scrollContainerRef}
          className={`flex-1 flex items-center flex-wrap gap-[${gap}px] overflow-x-auto no-scrollbar`}
        >
          {htmlTags.map((tag) => (
            <button
              key={tag.tag}
              onClick={() => handleTagClick(tag)}
              // Don't change the border color
              className="merriweather-100 flex-shrink-0 flex items-center justify-center min-w-[32px] h-9 aspect-square text-sm font-medium rounded bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600  transition-colors font-mono"
              title={`${tag.description} (<${tag.tag}>)`}
            >
              {
                /\d+/g.exec(tag.icon) ? (<span className='flex items-center justify-center'>
                  {tag.icon.slice(0, 1)}
                    <span className="text-[8px] mt-1">{tag.icon?.slice(1)}</span>
                  </span>
                ) : (<span className="">{tag.icon}</span>)
              }
            </button>
          ))}

          {/* LaTeX Buttons */}
          {onInsertLatex && latexStructures.map((latex) => (
            <button
              key={latex.name}
              onClick={() => handleLatexClick(latex)}
              className="flex-shrink-0 flex items-center justify-center min-w-[32px] h-9 aspect-square text-xs font-medium rounded bg-transparent text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title={`${latex.description}`}
            >
              {latex.icon}
            </button>
          ))}

          {/* Format Code Button */}
          {/* Don't touch this */}
          {onFormatCode && (
            <div
              onClick={onFormatCode}
              className="flex-shrink-0 flex items-center justify-center min-w-[32px] h-9 aspect-square text-xs font-medium rounded bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              title="Format Code (⌘+Shift+F)"
            >
              <FormatAlignRightIcon style={{ fontSize: '16px' }} />
            </div>
          )}

          {/* Don't touch this */}
          <div
            onClick={onEmojiClick}
            className="flex-shrink-0 flex items-center justify-center min-w-[32px] h-9 aspect-square text-xs font-medium rounded bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title="Insert Emoji"
          >
            <EmojiEmotionsIcon style={{ fontSize: '16px' }} />
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