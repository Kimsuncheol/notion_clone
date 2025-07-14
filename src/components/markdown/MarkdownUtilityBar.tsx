import React, { useRef } from 'react';
import ThemeSelector, { ThemeOption } from './ThemeSelector';
import SaveStatus from './SaveStatus';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

interface HTMLTag {
  name: string;
  tag: string;
  icon: string;
  description: string;
  isSelfClosing?: boolean;
}

interface LatexStructure {
  name: string;
  expression: string;
  icon: string;
  description: string;
  isBlock?: boolean;
  cursorOffset?: number;
}

interface MarkdownUtilityBarProps {
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

const latexStructures: LatexStructure[] = [
  { name: 'Inline Math', expression: '$|$', icon: '$', description: 'Inline math expression', cursorOffset: 1 },
  { name: 'Block Math', expression: '$$\n|\n$$', icon: '$$', description: 'Block math expression', isBlock: true, cursorOffset: 3 },
  { name: 'Fraction', expression: '\\frac{|}{#}', icon: '½', description: 'Fraction (\\frac)', cursorOffset: 6 },
  { name: 'Square Root', expression: '\\sqrt{|}', icon: '√', description: 'Square root (\\sqrt)', cursorOffset: 6 },
  { name: 'Summation', expression: '\\sum_{|}^{#}', icon: 'Σ', description: 'Summation with limits', cursorOffset: 6 },
  { name: 'Integral', expression: '\\int_{|}^{#}', icon: '∫', description: 'Integral with limits', cursorOffset: 6 },
  { name: 'Superscript', expression: '^{|}', icon: 'xⁿ', description: 'Superscript', cursorOffset: 2 },
  { name: 'Subscript', expression: '_{|}', icon: 'xₙ', description: 'Subscript', cursorOffset: 2 },
];

const MarkdownUtilityBar: React.FC<MarkdownUtilityBarProps> = ({
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
    <div className="border-b border-gray-200 dark:border-gray-700 bg-transparent">
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
              className="flex-shrink-0 flex items-center justify-center min-w-[32px] h-9 aspect-square text-xs font-medium rounded bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600  transition-colors"
              title={`${tag.description} (<${tag.tag}>)`}
            >
              {tag.icon}
            </button>
          ))}
          
          {/* Divider for LaTeX section */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          
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

      <div className="flex items-center justify-center gap-3 px-3 py-2 border-t dark:border-gray-700">
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