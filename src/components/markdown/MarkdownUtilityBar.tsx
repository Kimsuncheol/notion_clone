import React, { useRef } from 'react';
import ThemeSelector, { ThemeOption } from './ThemeSelector';
import SaveStatus from './SaveStatus';

interface HTMLTag {
  name: string;
  tag: string;
  icon: string;
  description: string;
  isSelfClosing?: boolean;
}

interface MarkdownUtilityBarProps {
  onInsertTag: (tag: string, isSelfClosing?: boolean) => void;
  isSaving: boolean;
  currentTheme: string;
  themes: ThemeOption[];
  isDarkMode: boolean;
  onThemeChange: (themeValue: string) => void;
}

const htmlTags: HTMLTag[] = [
  { name: 'Bold', tag: 'strong', icon: 'B', description: 'Bold text' },
  { name: 'Italic', tag: 'em', icon: 'I', description: 'Italic text' },
  { name: 'Underline', tag: 'u', icon: 'U', description: 'Underlined text' },
  { name: 'Code', tag: 'code', icon: '</>', description: 'Inline code' },
  { name: 'Link', tag: 'a href=""', icon: '🔗', description: 'Hyperlink' },
  { name: 'Image', tag: 'img src="" alt=""', icon: '🖼️', description: 'Image', isSelfClosing: true },
  { name: 'Heading 1', tag: 'h1', icon: 'H1', description: 'Heading level 1' },
  { name: 'Heading 2', tag: 'h2', icon: 'H2', description: 'Heading level 2' },
  { name: 'Heading 3', tag: 'h3', icon: 'H3', description: 'Heading level 3' },
  { name: 'Paragraph', tag: 'p', icon: 'P', description: 'Paragraph' },
  { name: 'Div', tag: 'div', icon: 'DIV', description: 'Division/container' },
  { name: 'Span', tag: 'span', icon: 'SP', description: 'Inline container' },
  { name: 'Blockquote', tag: 'blockquote', icon: '❝', description: 'Block quote' },
  { name: 'List Item', tag: 'li', icon: '•', description: 'List item' },
  { name: 'Unordered List', tag: 'ul', icon: '⋮', description: 'Unordered list' },
  { name: 'Ordered List', tag: 'ol', icon: '1.', description: 'Ordered list' },
  { name: 'Table', tag: 'table', icon: '⊞', description: 'Table' },
  { name: 'Table Row', tag: 'tr', icon: '—', description: 'Table row' },
  { name: 'Table Data', tag: 'td', icon: '□', description: 'Table cell' },
  { name: 'Table Header', tag: 'th', icon: '■', description: 'Table header cell' },
  { name: 'Line Break', tag: 'br', icon: '↵', description: 'Line break', isSelfClosing: true },
  { name: 'Horizontal Rule', tag: 'hr', icon: '―', description: 'Horizontal rule', isSelfClosing: true },
];

const MarkdownUtilityBar: React.FC<MarkdownUtilityBarProps> = ({
  onInsertTag,
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Row 1: Scrollable Tags */}
      <div className="flex items-center">
        {/* Left scroll button */}
        <button
          onClick={scrollLeft}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Scroll left"
        >
          <span className="text-sm">‹</span>
        </button>

        {/* Scrollable tags container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-2"
        >
          {htmlTags.map((tag) => (
            <button
              key={tag.tag}
              onClick={() => handleTagClick(tag)}
              className="flex-shrink-0 flex items-center justify-center min-w-[32px] h-8 px-2 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              title={`${tag.description} (<${tag.tag}>)`}
            >
              {tag.icon}
            </button>
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={scrollRight}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Scroll right"
        >
          <span className="text-sm">›</span>
        </button>
      </div>

      {/* Row 2: Theme Selector and Save Status */}
      <div className="flex items-center justify-end gap-3 px-3 py-1 border-t border-gray-200 dark:border-gray-700">
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

export default MarkdownUtilityBar; 