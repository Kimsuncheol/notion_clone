import React, { useState, useRef, useEffect, KeyboardEvent, useCallback, MouseEvent } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';

interface TableContent {
  cells: { [key: string]: string }; // e.g., "0,0": "cell value"
  rows: number;
  cols: number;
  columnWidths?: number[];
  rowHeights?: number[];
}

interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface ResizeState {
  isResizing: boolean;
  type: 'column' | 'row' | null;
  index: number;
  startPos: number;
  startSize: number;
}

interface Props {
  initialData?: TableContent;
  onContentChange?: (content: TableContent) => void;
  onArrowPrevBlock?: (row: number, col: number) => void;
  onArrowNextBlock?: (row: number, col: number) => void;
}

const DEFAULT_COLUMN_WIDTH = 120;
const DEFAULT_ROW_HEIGHT = 36;
const MIN_COLUMN_WIDTH = 60;
const MIN_ROW_HEIGHT = 24;
const MAX_TABLE_WIDTH = 720; // Maximum table width
const MAX_COLUMNS = 6; // Maximum number of columns

const TableBlock: React.FC<Props> = ({ 
  initialData = { 
    cells: {},
    rows: 3,
    cols: 3,
    columnWidths: Array(3).fill(DEFAULT_COLUMN_WIDTH),
    rowHeights: Array(3).fill(DEFAULT_ROW_HEIGHT)
  },
  onContentChange,
  onArrowPrevBlock, 
  onArrowNextBlock 
}) => {
  const [cells, setCells] = useState<{ [key: string]: string }>(initialData.cells);
  const [rows, setRows] = useState(initialData.rows);
  const [cols, setCols] = useState(initialData.cols);
  const [columnWidths, setColumnWidths] = useState<number[]>(
    initialData.columnWidths || Array(initialData.cols).fill(DEFAULT_COLUMN_WIDTH)
  );
  const [rowHeights, setRowHeights] = useState<number[]>(
    initialData.rowHeights || Array(initialData.rows).fill(DEFAULT_ROW_HEIGHT)
  );
  
  // Hover state for add column/row borders
  const [isHoveringRightBorder, setIsHoveringRightBorder] = useState(false);
  const [isHoveringBottomBorder, setIsHoveringBottomBorder] = useState(false);
  
  const { isEditMode } = useEditMode();
  
  // Selection state
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);

  // Resize state
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    type: null,
    index: -1,
    startPos: 0,
    startSize: 0
  });

  const inputsRef = useRef<Array<Array<HTMLInputElement | null>>>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
  );
  const tableRef = useRef<HTMLTableElement>(null);

  // Detect platform for keyboard shortcuts
  const isMac = typeof navigator !== 'undefined' && /Mac|iPad|iPhone|iPod/.test(navigator.platform);

  // Calculate total table width - grows up to MAX_TABLE_WIDTH
  const totalTableWidth = Math.min(
    columnWidths.reduce((sum, width) => sum + width, 0),
    MAX_TABLE_WIDTH
  );

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, rows).map((rowArr) => {
      const newRowArr = rowArr.slice(0, cols);
      // Ensure we have enough space for all columns
      while (newRowArr.length < cols) {
        newRowArr.push(null);
      }
      return newRowArr;
    });
    
    // Ensure we have enough rows
    while (inputsRef.current.length < rows) {
      inputsRef.current.push(Array.from({ length: cols }, () => null));
    }
  }, [rows, cols]);

  // Update column widths when cols change
  useEffect(() => {
    setColumnWidths(prev => {
      const newWidths = [...prev];
      
      // If adding columns, give them default width
      if (newWidths.length < cols) {
        while (newWidths.length < cols) {
          newWidths.push(DEFAULT_COLUMN_WIDTH);
        }
      }
      
      return newWidths.slice(0, cols);
    });
  }, [cols]);

  // Update row heights when rows change
  useEffect(() => {
    setRowHeights(prev => {
      const newHeights = [...prev];
      while (newHeights.length < rows) {
        newHeights.push(DEFAULT_ROW_HEIGHT);
      }
      return newHeights.slice(0, rows);
    });
  }, [rows]);

  // Update parent when data changes - but only if content actually changed
  const memoizedOnContentChange = useCallback((newContent: TableContent) => {
    onContentChange?.(newContent);
  }, [onContentChange]);

  useEffect(() => {
    // Only call if content is different from initialData to avoid infinite loops
    const currentContent = { cells, rows, cols, columnWidths, rowHeights };
    const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(initialData);
    if (contentChanged) {
      memoizedOnContentChange(currentContent);
    }
  }, [cells, rows, cols, columnWidths, rowHeights, memoizedOnContentChange, initialData]);

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

  // Check if selection is a full column
  const isFullColumnSelected = (range: SelectionRange): boolean => {
    const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(range);
    return minRow === 0 && maxRow === rows - 1 && minCol === maxCol;
  };

  // Check if selection is full columns
  const isFullColumnsSelected = (range: SelectionRange): boolean => {
    const { minRow, maxRow } = getSelectionBounds(range);
    return minRow === 0 && maxRow === rows - 1;
  };

  // Check if selection is a full row
  const isFullRowSelected = (range: SelectionRange): boolean => {
    const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(range);
    return minCol === 0 && maxCol === cols - 1 && minRow === maxRow;
  };

  // Check if selection is full rows
  const isFullRowsSelected = (range: SelectionRange): boolean => {
    const { minCol, maxCol } = getSelectionBounds(range);
    return minCol === 0 && maxCol === cols - 1;
  };

  // Get selected column indices
  const getSelectedColumns = (range: SelectionRange): number[] => {
    if (!isFullColumnsSelected(range)) return [];
    const { minCol, maxCol } = getSelectionBounds(range);
    const columns = [];
    for (let c = minCol; c <= maxCol; c++) {
      columns.push(c);
    }
    return columns;
  };

  // Get selected row indices  
  const getSelectedRows = (range: SelectionRange): number[] => {
    if (!isFullRowsSelected(range)) return [];
    const { minRow, maxRow } = getSelectionBounds(range);
    const rows = [];
    for (let r = minRow; r <= maxRow; r++) {
      rows.push(r);
    }
    return rows;
  };

  // Add a new column
  const addColumn = () => {
    if (!isEditMode || cols >= MAX_COLUMNS) return;
    
    const newCols = cols + 1;
    setCols(newCols);
    clearSelection();
  };

  // Add a new row
  const addRow = () => {
    if (!isEditMode) return;
    
    const newRows = rows + 1;
    setRows(newRows);
    clearSelection();
  };

  // Delete columns
  const deleteColumns = (columnIndices: number[]) => {
    if (columnIndices.length === 0 || cols <= 1) return;
    
    const newCols = cols - columnIndices.length;
    if (newCols < 1) return; // Prevent deleting all columns
    
    // Create new cells object
    const newCells: { [key: string]: string } = {};
    for (let r = 0; r < rows; r++) {
      let newColIndex = 0;
      for (let c = 0; c < cols; c++) {
        if (!columnIndices.includes(c)) {
          const oldValue = getCellValue(r, c);
          if (oldValue) {
            newCells[`${r},${newColIndex}`] = oldValue;
          }
          newColIndex++;
        }
      }
    }
    
    // Update column widths
    const newColumnWidths = columnWidths.filter((_, index) => !columnIndices.includes(index));
    
    setCells(newCells);
    setCols(newCols);
    setColumnWidths(newColumnWidths);
    clearSelection();
  };

  // Delete rows
  const deleteRows = (rowIndices: number[]) => {
    if (rowIndices.length === 0 || rows <= 1) return;
    
    const newRows = rows - rowIndices.length;
    if (newRows < 1) return; // Prevent deleting all rows
    
    // Create new cells object
    const newCells: { [key: string]: string } = {};
    let newRowIndex = 0;
    for (let r = 0; r < rows; r++) {
      if (!rowIndices.includes(r)) {
        for (let c = 0; c < cols; c++) {
          const oldValue = getCellValue(r, c);
          if (oldValue) {
            newCells[`${newRowIndex},${c}`] = oldValue;
          }
        }
        newRowIndex++;
      }
    }
    
    // Update row heights
    const newRowHeights = rowHeights.filter((_, index) => !rowIndices.includes(index));
    
    setCells(newCells);
    setRows(newRows);
    setRowHeights(newRowHeights);
    clearSelection();
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

  // Handle resize start
  const handleResizeStart = (e: MouseEvent, type: 'column' | 'row', index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startPos = type === 'column' ? e.clientX : e.clientY;
    const startSize = type === 'column' ? columnWidths[index] : rowHeights[index];
    
    setResizeState({
      isResizing: true,
      type,
      index,
      startPos,
      startSize
    });
  };

  // Handle resize move for DOM events
  const handleResizeMoveDOM = useCallback((e: Event) => {
    if (!resizeState.isResizing) return;
    
    const mouseEvent = e as globalThis.MouseEvent;
    const currentPos = resizeState.type === 'column' ? mouseEvent.clientX : mouseEvent.clientY;
    const delta = currentPos - resizeState.startPos;
    
    if (resizeState.type === 'column') {
      setColumnWidths(prev => {
        const newWidths = [...prev];
        const currentColumnIndex = resizeState.index;
        const currentWidth = prev[currentColumnIndex];
        const newSize = Math.max(MIN_COLUMN_WIDTH, resizeState.startSize + delta);
        const sizeDelta = newSize - currentWidth;
        
        // If the size delta is 0, no change needed
        if (Math.abs(sizeDelta) < 1) return prev;
        
        // For growing table, just expand the column
        const currentTotal = prev.reduce((sum, width) => sum + width, 0);
        if (currentTotal + sizeDelta <= MAX_TABLE_WIDTH) {
          newWidths[currentColumnIndex] = newSize;
          return newWidths;
        }
        
        // If at max width, use redistributive approach
        let redistributeToIndex = -1;
        if (currentColumnIndex < prev.length - 1) {
          redistributeToIndex = currentColumnIndex + 1;
        } else if (currentColumnIndex > 0) {
          redistributeToIndex = currentColumnIndex - 1;
        }
        
        if (redistributeToIndex >= 0) {
          const redistributeCurrentWidth = prev[redistributeToIndex];
          const redistributeNewWidth = redistributeCurrentWidth - sizeDelta;
          
          if (redistributeNewWidth >= MIN_COLUMN_WIDTH) {
            newWidths[currentColumnIndex] = newSize;
            newWidths[redistributeToIndex] = redistributeNewWidth;
          }
        }
        
        return newWidths;
      });
    } else {
      // Row resizing remains the same (no total height constraint)
      const newSize = Math.max(MIN_ROW_HEIGHT, resizeState.startSize + delta);
      setRowHeights(prev => {
        const newHeights = [...prev];
        newHeights[resizeState.index] = newSize;
        return newHeights;
      });
    }
  }, [resizeState]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setResizeState({
      isResizing: false,
      type: null,
      index: -1,
      startPos: 0,
      startSize: 0
    });
  }, []);

  // Global resize listeners
  useEffect(() => {
    if (resizeState.isResizing) {
      const handleMouseMove = (e: Event) => handleResizeMoveDOM(e);
      const handleMouseUp = () => handleResizeEnd();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizeState.isResizing, handleResizeMoveDOM, handleResizeEnd]);

  // Handle mouse down on cell
  const handleMouseDown = (e: MouseEvent<HTMLInputElement>, row: number, col: number) => {
    // Don't start selection if clicking on an input that's focused or if resizing
    if (document.activeElement === e.currentTarget || resizeState.isResizing) {
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
    if (isDragging && dragStart && selectionRange && !resizeState.isResizing) {
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

    // Handle column/row deletion with Backspace
    if (e.key === 'Backspace' && selectionRange) {
      e.preventDefault();
      
      // Check if full columns are selected
      if (isFullColumnsSelected(selectionRange)) {
        const selectedColumns = getSelectedColumns(selectionRange);
        if (selectedColumns.length > 0 && cols > selectedColumns.length) {
          deleteColumns(selectedColumns);
          return;
        }
      }
      
      // Check if full rows are selected
      if (isFullRowsSelected(selectionRange)) {
        const selectedRows = getSelectedRows(selectionRange);
        if (selectedRows.length > 0 && rows > selectedRows.length) {
          deleteRows(selectedRows);
          return;
        }
      }
      
      // Otherwise, delete cell content
      setCells(prev => {
        const newCells = { ...prev };
        selectedCells.forEach(cellKey => {
          delete newCells[cellKey];
        });
        return newCells;
      });
    }

    // Delete selected cells content
    if (e.key === 'Delete') {
      e.preventDefault();
      setCells(prev => {
        const newCells = { ...prev };
        selectedCells.forEach(cellKey => {
          delete newCells[cellKey];
        });
        return newCells;
      });
    }
    
    // Copy selected cells (Ctrl+C or Cmd+C)
    if (e.key === 'c' && (isMac ? e.metaKey : e.ctrlKey)) {
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
  }, [selectedCells, selectionRange, getCellValue, isFullColumnsSelected, isFullRowsSelected, getSelectedColumns, getSelectedRows, deleteColumns, deleteRows, cols, rows, isMac]);

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
          addRow();
          setTimeout(() => inputsRef.current[r + 1]?.[0]?.focus(), 0);
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
    <div className="overflow-auto">
      <div className="relative inline-block">
        <table 
          ref={tableRef}
          className="border-collapse border border-gray-300 text-sm select-none"
          onClick={handleTableClick}
          style={{ 
            tableLayout: 'fixed',
            width: totalTableWidth + 'px'
          }}
        >
          <tbody>
            {Array.from({ length: rows }, (_, rIdx) => (
              <tr key={rIdx} style={{ height: rowHeights[rIdx] + 'px' }}>
                {Array.from({ length: cols }, (_, cIdx) => (
                  <td 
                    key={cIdx} 
                    className={`border border-gray-300 p-0 relative ${
                      isCellSelected(rIdx, cIdx) 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : ''
                    }`}
                    style={{ 
                      width: columnWidths[cIdx] + 'px',
                      height: rowHeights[rIdx] + 'px'
                    }}
                    onDoubleClick={() => handleCellDoubleClick(rIdx, cIdx)}
                  >
                    <input
                      ref={(el) => {
                        if (!inputsRef.current[rIdx]) inputsRef.current[rIdx] = [];
                        inputsRef.current[rIdx][cIdx] = el;
                      }}
                      type="text"
                      aria-label={`Row ${rIdx} Col ${cIdx}`}
                      className={`w-full h-full bg-transparent focus:outline-none px-2 py-1 ${
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
                    
                    {/* Column resize handle (right edge) */}
                    {isEditMode && cIdx < cols - 1 && selectionRange && isFullColumnSelected(selectionRange) && 
                     getSelectedColumns(selectionRange).includes(cIdx) && (
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-blue-500 opacity-50 hover:opacity-100"
                        onMouseDown={(e) => handleResizeStart(e, 'column', cIdx)}
                      />
                    )}
                    
                    {/* Row resize handle (bottom edge) */}
                    {isEditMode && rIdx < rows - 1 && selectionRange && isFullRowSelected(selectionRange) && 
                     getSelectedRows(selectionRange).includes(rIdx) && (
                      <div
                        className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize bg-blue-500 opacity-50 hover:opacity-100"
                        onMouseDown={(e) => handleResizeStart(e, 'row', rIdx)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Column Border (Right) */}
        {isEditMode && cols < MAX_COLUMNS && (
          <div
            className={`absolute top-0 right-0 w-1 h-full cursor-pointer flex items-center justify-center transition-all duration-200 ${
              isHoveringRightBorder 
                ? 'bg-sky-400 border-r-4 border-sky-400' 
                : 'bg-transparent hover:bg-sky-100 border-r-4 border-gray-300 hover:border-sky-400'
            }`}
            onMouseEnter={() => setIsHoveringRightBorder(true)}
            onMouseLeave={() => setIsHoveringRightBorder(false)}
            onClick={addColumn}
            title={`Add column (${cols}/${MAX_COLUMNS})`}
          >
            {isHoveringRightBorder && (
              <span className="text-white px-1 rounded-full bg-sky-400 font-bold text-xs absolute left-[-5.5px]">+</span>
            )}
          </div>
        )}

        {/* Add Row Border (Bottom) */}
        {isEditMode && (
          <div
            className={`absolute bottom-0 left-0 w-full h-1 cursor-pointer flex items-center justify-center transition-all duration-200 ${
              isHoveringBottomBorder 
                ? 'bg-sky-400 border-b-4 border-sky-400' 
                : 'bg-transparent hover:bg-sky-100 border-b-4 border-gray-300 hover:border-sky-400'
            }`}
            onMouseEnter={() => setIsHoveringBottomBorder(true)}
            onMouseLeave={() => setIsHoveringBottomBorder(false)}
            onClick={addRow}
            title="Add row"
          >
            {isHoveringBottomBorder && (
              <span className="text-white px-1 rounded-full bg-sky-400 font-bold text-xs absolute top-[-5.5px]">+</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableBlock; 