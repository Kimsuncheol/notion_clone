import React, { useState, useEffect } from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for proper styling
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CancelIcon from '@mui/icons-material/Cancel';
import { IconButton } from '@mui/material';

interface LaTeXContent {
  latex: string;
  displayMode?: boolean;
}

interface Props {
  block?: { id: string; type: 'latex'; content: LaTeXContent };
  onUpdate?: (id: string, content: LaTeXContent) => void;
  onAddBelow?: (id: string) => void;
  onArrowPrev?: (id: string) => void;
  onArrowNext?: (id: string) => void;
  onRemove?: (id: string) => void;
  initialContent?: LaTeXContent;
  onContentChange?: (content: LaTeXContent) => void;
}

const LaTeXBlock: React.FC<Props> = ({
  block,
  onUpdate,
  onAddBelow,
  onArrowPrev,
  onArrowNext,
  onRemove,
  initialContent,
  onContentChange,
}) => {
  const [latex, setLatex] = useState(
    block?.content.latex || initialContent?.latex || ''
  );
  const [displayMode, setDisplayMode] = useState(
    block?.content.displayMode || initialContent?.displayMode || false
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSampleEquationsOpen, setIsSampleEquationsOpen] = useState(false);

  // Only call onContentChange when values actually change, not immediately
  useEffect(() => {
    if (onContentChange) {
      const content = { latex, displayMode };
      onContentChange(content);
    }
  }, [latex, displayMode]); // Remove onContentChange from dependencies to prevent infinite loop

  // Handle legacy block.onUpdate pattern
  useEffect(() => {
    if (block && onUpdate) {
      const content = { latex, displayMode };
      onUpdate(block.id, content);
    }
  }, [latex, displayMode, block?.id]); // Only depend on stable values

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!block) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (latex.trim() === '') {
        onRemove?.(block.id);
      } else {
        setIsEditing(false);
        onAddBelow?.(block.id);
      }
    } else if (e.key === 'Backspace' && latex === '') {
      e.preventDefault();
      onRemove?.(block.id);
    } else if (e.key === 'ArrowUp' && e.metaKey) {
      e.preventDefault();
      onArrowPrev?.(block.id);
    } else if (e.key === 'ArrowDown' && e.metaKey) {
      e.preventDefault();
      onArrowNext?.(block.id);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleLatexChange = (value: string) => {
    setLatex(value);
  };



  const toggleDisplayMode = () => {
    setDisplayMode(!displayMode);
  };

  const sampleEquations = [
    { label: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
    { label: 'Euler\'s Identity', latex: 'e^{i\\pi} + 1 = 0' },
    { label: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
    { label: 'Integral', latex: '\\int_{a}^{b} f(x) dx' },
    { label: 'Sum', latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
    { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          📐 LaTeX Math
        </span>
        <button
          onClick={toggleDisplayMode}
          className={`px-2 py-1 text-xs rounded transition-colors ${displayMode
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          title={displayMode ? 'Switch to inline mode' : 'Switch to display mode'}
        >
          {displayMode ? 'Display' : 'Inline'}
        </button>
        {latex && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        )}
        <IconButton
          onClick={() => setIsSampleEquationsOpen(!isSampleEquationsOpen)}
          sx={{
            color: 'gray',
            '&:hover': {
              color: 'white',
            },
          }}
        >
          {isSampleEquationsOpen ? <CancelIcon /> : <MenuBookIcon />}
          {/* {isSampleEquationsOpen ? 'Close' : 'Sample Equations'} */}
        </IconButton>
      </div>

      {isEditing || !latex ? (
        <div className="space-y-3">
          <textarea
            value={latex}
            onChange={(e) => handleLatexChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter LaTeX equation... (e.g., x^2 + y^2 = r^2)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            autoFocus
          />

          {/* Sample equations */}
          {isSampleEquationsOpen && (
            <>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick insert:</p>
              <div className="grid grid-cols-2 gap-1">
                {sampleEquations.map((eq) => (
                  <button
                    key={eq.label}
                    onClick={() => handleLatexChange(eq.latex)}
                    className="text-left p-1 text-xs bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-600 rounded transition-colors"
                    title={`Insert: ${eq.latex}`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use <code>\frac{"{a}"}{"{b}"}</code> for fractions</li>
                <li>Use <code>^{"{superscript}"}</code> and <code>_{"{subscript}"}</code></li>
                <li>Use <code>\sum</code>, <code>\int</code>, <code>\sqrt{"{}"}</code> for operators</li>
                <li>Press Enter to finish, Shift+Enter for new line, Escape to cancel</li>
              </ul>
            </div>
            </>
          )}
        </div>
      ) : (
        <div
          className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${displayMode ? 'text-center' : ''
            }`}
          onClick={() => setIsEditing(true)}
        >
          <div className="latex-container">
            <Latex
              delimiters={displayMode ? [
                { left: '$$', right: '$$', display: true },
                { left: '\\[', right: '\\]', display: true }
              ] : [
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false }
              ]}
              strict={false}
            >
              {displayMode ? `$$${latex}$$` : `$${latex}$`}
            </Latex>
          </div>
        </div>
      )}

      {/* Show raw LaTeX in small text when not editing */}
      {!isEditing && latex && (
        <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
          Raw: {latex}
        </div>
      )}
    </div>
  );
};

export default LaTeXBlock; 