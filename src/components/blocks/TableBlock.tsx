import React, { useState, useRef, useEffect, KeyboardEvent, useCallback, MouseEvent } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';

interface TableContent {
  cells: { [key: string]: string }; // e.g., "0,0": "cell value"
  rows: number;
  cols: number;
}

interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface Props {
  initialData?: TableContent;
  onContentChange?: (content: TableContent) => void;
  onArrowPrevBlock?: (row: number, col: number) => void;
  onArrowNextBlock?: (row: number, col: number) => void;
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
  const { isEditMode } = useEditMode();
  
  // Selection state
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);

  const inputsRef = useRef<Array<Array<HTMLInputElement | null>>>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
  );
  const tableRef = useRef<HTMLTableElement>(null);

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

  // Helper function to check if a cell is selected
  const isCellSelected = (row: number, col: number): boolean => {
    return selectedCells.has(`${row},${col}`);
  };

  // Helper function to get selection range bounds
  const getSelectionBounds = (range: SelectionRange) => {
    return {
      minRow: Math.min(range.startRow, range.endRow),
      maxRow: Math.max(range.startRow, range.endRow),
      minCol: Math.min(range.startCol, range.endCol),
      maxCol: Math.max(range.startCol, range.endCol),
    };
  };

  // Update selected cells based on selection range
  const updateSelectedCells = (range: SelectionRange) => {
    const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(range);
    const newSelectedCells = new Set<string>();
    
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        newSelectedCells.add(`${r},${c}`);
      }
    }
    
    setSelectedCells(newSelectedCells);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCells(new Set());
    setSelectionRange(null);
  };

  // Handle mouse down on cell
  const handleMouseDown = (e: MouseEvent<HTMLInputElement>, row: number, col: number) => {
    // Don't start selection if clicking on an input that's focused
    if (document.activeElement === e.currentTarget) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    setDragStart({ row, col });
    
    const newRange: SelectionRange = {
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col,
    };
    
    setSelectionRange(newRange);
    updateSelectedCells(newRange);
  };

  // Handle mouse enter on cell during drag
  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging && dragStart && selectionRange) {
      const newRange: SelectionRange = {
        startRow: dragStart.row,
        startCol: dragStart.col,
        endRow: row,
        endCol: col,
      };
      
      setSelectionRange(newRange);
      updateSelectedCells(newRange);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Handle click outside table to clear selection
  const handleTableClick = (e: MouseEvent<HTMLTableElement>) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  // Handle keyboard operations on selected cells
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedCells.size === 0) return;

    // Delete selected cells content
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      setCells(prev => {
        const newCells = { ...prev };
        selectedCells.forEach(cellKey => {
          delete newCells[cellKey];
        });
        return newCells;
      });
    }
    
    // Copy selected cells (Ctrl+C)
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (selectionRange) {
        const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(selectionRange);
        const clipboardData: string[][] = [];
        
        for (let r = minRow; r <= maxRow; r++) {
          const row: string[] = [];
          for (let c = minCol; c <= maxCol; c++) {
            row.push(getCellValue(r, c));
          }
          clipboardData.push(row);
        }
        
        // Convert to tab-separated values
        const tsvData = clipboardData.map(row => row.join('\t')).join('\n');
        navigator.clipboard.writeText(tsvData).catch(console.error);
      }
    }
    
    // Escape to clear selection
    if (e.key === 'Escape') {
      clearSelection();
    }
  }, [selectedCells, selectionRange, getCellValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (!isEditMode) return;
    
    // Handle global keyboard shortcuts first
    handleGlobalKeyDown(e);
    
    const focusCell = (row: number, col: number) => {
      if (row < 0) {
        console.log(`TableBlock: Arrow UP out of bounds from (${r}, ${c}) - calling onArrowPrevBlock`);
        onArrowPrevBlock?.(r, c);
        return;
      }
      if (row >= rows) {
        console.log(`TableBlock: Arrow DOWN out of bounds from (${r}, ${c}) - calling onArrowNextBlock`);
        onArrowNextBlock?.(r, c);
        return;
      }
      // Handle horizontal navigation out of table bounds
      if (col < 0) {
        // Left edge - could navigate to previous block, but for now stay within table
        col = 0;
      }
      if (col >= cols) {
        // Right edge - could navigate to next block, but for now stay within table
        col = cols - 1;
      }
      setTimeout(() => inputsRef.current[row][col]?.focus(), 0);
    };

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        clearSelection();
        focusCell(r - 1, c);
        break;
      case 'ArrowDown':
        e.preventDefault();
        clearSelection();
        focusCell(r + 1, c);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        clearSelection();
        focusCell(r, c - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        clearSelection();
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
        clearSelection();
        break;
      default:
        break;
    }
  };

  // Handle input focus to clear selection
  const handleInputFocus = () => {
    clearSelection();
  };

  // Handle double-click on cell to focus input
  const handleCellDoubleClick = (row: number, col: number) => {
    clearSelection();
    setTimeout(() => {
      inputsRef.current[row][col]?.focus();
    }, 0);
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (isEditMode) {
      setCellValue(row, col, value);
    }
  };

  return (
    <table 
      ref={tableRef}
      className="min-w-full border border-gray-300 text-sm my-2 select-none"
      onClick={handleTableClick}
    >
      <tbody>
        {Array.from({ length: rows }, (_, rIdx) => (
          <tr key={rIdx}>
            {Array.from({ length: cols }, (_, cIdx) => (
              <td 
                key={cIdx} 
                className={`border p-1 relative ${
                  isCellSelected(rIdx, cIdx) 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : ''
                }`}
                onDoubleClick={() => handleCellDoubleClick(rIdx, cIdx)}
              >
                <input
                  ref={(el) => {
                    if (!inputsRef.current[rIdx]) inputsRef.current[rIdx] = [];
                    inputsRef.current[rIdx][cIdx] = el;
                  }}
                  type="text"
                  aria-label={`Row ${rIdx} Col ${cIdx}`}
                  className={`w-full bg-transparent focus:outline-none ${
                    isCellSelected(rIdx, cIdx) 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : ''
                  } ${!isEditMode ? 'cursor-default' : ''}`}
                  placeholder="Cell"
                  value={getCellValue(rIdx, cIdx)}
                  onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                  onMouseDown={(e) => handleMouseDown(e, rIdx, cIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                  onFocus={handleInputFocus}
                  disabled={!isEditMode}
                  readOnly={!isEditMode}
                />
                {isCellSelected(rIdx, cIdx) && (
                  <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableBlock; 