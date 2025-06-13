import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';

interface TableContent {
  cells: { [key: string]: string }; // e.g., "0,0": "cell value"
  rows: number;
  cols: number;
}

interface Props {
  initialData?: TableContent;
  onContentChange?: (content: TableContent) => void;
  onArrowPrevBlock?: () => void;
  onArrowNextBlock?: () => void;
}

const TableBlock: React.FC<Props> = ({ 
  initialData = { 
    cells: {},
    rows: 5,
    cols: 5
  },
  onContentChange,
  onArrowPrevBlock, 
  onArrowNextBlock 
}) => {
  const [cells, setCells] = useState<{ [key: string]: string }>(initialData.cells);
  const [rows, setRows] = useState(initialData.rows);
  const cols = initialData.cols;

  const inputsRef = useRef<Array<Array<HTMLInputElement | null>>>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
  );

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, rows).map(rowArr =>
      rowArr.slice(0, cols)
    );
  }, [rows, cols]);

  // Update parent when data changes - but only if content actually changed
  const memoizedOnContentChange = useCallback((newContent: TableContent) => {
    onContentChange?.(newContent);
  }, [onContentChange]);

  useEffect(() => {
    // Only call if content is different from initialData to avoid infinite loops
    const currentContent = { cells, rows, cols };
    const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(initialData);
    if (contentChanged) {
      memoizedOnContentChange(currentContent);
    }
  }, [cells, rows, cols, memoizedOnContentChange, initialData]);

  // Helper function to get cell value
  const getCellValue = (row: number, col: number): string => {
    return cells[`${row},${col}`] || '';
  };

  // Helper function to set cell value
  const setCellValue = (row: number, col: number, value: string) => {
    setCells(prev => ({
      ...prev,
      [`${row},${col}`]: value
    }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const focusCell = (row: number, col: number) => {
      if (row < 0) {
        onArrowPrevBlock?.();
        return;
      }
      if (row >= rows) {
        onArrowNextBlock?.();
        return;
      }
      if (col < 0) col = 0;
      if (col >= cols) col = cols - 1;
      setTimeout(() => inputsRef.current[row][col]?.focus(), 0);
    };

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        focusCell(r - 1, c);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusCell(r + 1, c);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusCell(r, c - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusCell(r, c + 1);
        break;
      case 'Enter':
        if (r === rows - 1) {
          e.preventDefault();
          const newRows = rows + 1;
          setRows(newRows);
          inputsRef.current.push(Array.from({ length: cols }, () => null));
          setTimeout(() => inputsRef.current[r + 1][0]?.focus(), 0);
        }
        break;
      default:
        break;
    }
  };

  return (
    <table className="min-w-full border border-gray-300 text-sm my-2">
      <tbody>
        {Array.from({ length: rows }, (_, rIdx) => (
          <tr key={rIdx}>
            {Array.from({ length: cols }, (_, cIdx) => (
              <td key={cIdx} className="border p-1">
                <input
                  ref={(el) => {
                    if (!inputsRef.current[rIdx]) inputsRef.current[rIdx] = [];
                    inputsRef.current[rIdx][cIdx] = el;
                  }}
                  type="text"
                  aria-label={`Row ${rIdx} Col ${cIdx}`}
                  className="w-full bg-transparent focus:outline-none"
                  placeholder="Cell"
                  value={getCellValue(rIdx, cIdx)}
                  onChange={(e) => {
                    setCellValue(rIdx, cIdx, e.target.value);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableBlock; 