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

interface CompactToolbarState {
  isVisible: boolean;
  type: 'column' | 'row';
  position: { x: number; y: number };
  targetIndex: number;
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

  // Compact toolbar state
  const [compactToolbar, setCompactToolbar] = useState<CompactToolbarState>({
    isVisible: false,
    type: 'column',
    position: { x: 0, y: 0 },
    targetIndex: -1
  });

  // Color submenu state
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);

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

  // Helper function to get the currently focused cell
  const getFocusedCell = (): { row: number; col: number } | null => {
    const activeElement = document.activeElement as HTMLInputElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      // Find the cell coordinates from the input ref
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (inputsRef.current[r] && inputsRef.current[r][c] === activeElement) {
            return { row: r, col: c };
          }
        }
      }
    }
    return null;
  };

  // Helper function to get the currently selected cell (first selected cell)
  const getSelectedCell = (): { row: number; col: number } | null => {
    if (selectionRange) {
      return { row: selectionRange.startRow, col: selectionRange.startCol };
    }
    return null;
  };

  // Helper function to get the active cell (focused or selected)
  const getActiveCell = (): { row: number; col: number } | null => {
    return getFocusedCell() || getSelectedCell();
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

  // Handle dial icon click
  const handleDialClick = (e: MouseEvent<HTMLDivElement>, type: 'column' | 'row', index: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCompactToolbar({
      isVisible: true,
      type,
      position: { x: rect.left, y: rect.top - 50 }, // Position above the dial
      targetIndex: index
    });
  };

  // Close compact toolbar
  const closeCompactToolbar = () => {
    setCompactToolbar(prev => ({ ...prev, isVisible: false }));
    setShowColorSubmenu(false);
  };

  // Compact toolbar functions
  const duplicateColumn = (colIndex: number) => {
    if (cols >= MAX_COLUMNS) return;
    
    const newCols = cols + 1;
    const newCells: { [key: string]: string } = {};
    const newColumnWidths = [...columnWidths];
    
    // Insert new column width
    newColumnWidths.splice(colIndex + 1, 0, columnWidths[colIndex]);
    
    // Rebuild cells with shifted indices
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const oldValue = getCellValue(r, c);
        if (c <= colIndex) {
          if (oldValue) newCells[`${r},${c}`] = oldValue;
        } else {
          if (oldValue) newCells[`${r},${c + 1}`] = oldValue;
        }
      }
      // Duplicate the column content
      const duplicateValue = getCellValue(r, colIndex);
      if (duplicateValue) newCells[`${r},${colIndex + 1}`] = duplicateValue;
    }
    
    setCells(newCells);
    setCols(newCols);
    setColumnWidths(newColumnWidths);
    closeCompactToolbar();
  };

  const duplicateRow = (rowIndex: number) => {
    const newRows = rows + 1;
    const newCells: { [key: string]: string } = {};
    const newRowHeights = [...rowHeights];
    
    // Insert new row height
    newRowHeights.splice(rowIndex + 1, 0, rowHeights[rowIndex]);
    
    // Rebuild cells with shifted indices
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const oldValue = getCellValue(r, c);
        if (r <= rowIndex) {
          if (oldValue) newCells[`${r},${c}`] = oldValue;
        } else {
          if (oldValue) newCells[`${r + 1},${c}`] = oldValue;
        }
      }
    }
    
    // Duplicate the row content
    for (let c = 0; c < cols; c++) {
      const duplicateValue = getCellValue(rowIndex, c);
      if (duplicateValue) newCells[`${rowIndex + 1},${c}`] = duplicateValue;
    }
    
    setRows(newRows);
    setRowHeights(newRowHeights);
    setCells(newCells);
    closeCompactToolbar();
  };

  const insertColumn = (colIndex: number, direction: 'left' | 'right') => {
    if (cols >= MAX_COLUMNS) return;
    
    const insertIndex = direction === 'left' ? colIndex : colIndex + 1;
    const newCols = cols + 1;
    const newCells: { [key: string]: string } = {};
    const newColumnWidths = [...columnWidths];
    
    // Insert new column width
    newColumnWidths.splice(insertIndex, 0, DEFAULT_COLUMN_WIDTH);
    
    // Rebuild cells with shifted indices
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const oldValue = getCellValue(r, c);
        if (c < insertIndex) {
          if (oldValue) newCells[`${r},${c}`] = oldValue;
        } else {
          if (oldValue) newCells[`${r},${c + 1}`] = oldValue;
        }
      }
    }
    
    setCells(newCells);
    setCols(newCols);
    setColumnWidths(newColumnWidths);
    closeCompactToolbar();
  };

  const insertRow = (rowIndex: number, direction: 'above' | 'below') => {
    const insertIndex = direction === 'above' ? rowIndex : rowIndex + 1;
    const newRows = rows + 1;
    const newCells: { [key: string]: string } = {};
    const newRowHeights = [...rowHeights];
    
    // Insert new row height
    newRowHeights.splice(insertIndex, 0, DEFAULT_ROW_HEIGHT);
    
    // Rebuild cells with shifted indices
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const oldValue = getCellValue(r, c);
        if (r < insertIndex) {
          if (oldValue) newCells[`${r},${c}`] = oldValue;
        } else {
          if (oldValue) newCells[`${r + 1},${c}`] = oldValue;
        }
      }
    }
    
    setRows(newRows);
    setRowHeights(newRowHeights);
    setCells(newCells);
    closeCompactToolbar();
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
    // Don't start selection if resizing
    if (resizeState.isResizing) {
      return;
    }

    // If clicking on the currently focused cell, don't interfere with normal input behavior
    if (document.activeElement === e.currentTarget) {
      return;
    }

    e.preventDefault();
    
    // If there's a currently focused cell (input), blur it
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      (document.activeElement as HTMLInputElement).blur();
    }
    
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

  // Handle clicks outside compact toolbar to close it
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      if (compactToolbar.isVisible && 
          !target.closest('.compact-toolbar') && 
          !target.closest('.dial-icon')) {
        closeCompactToolbar();
      }
    };

    if (compactToolbar.isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [compactToolbar.isVisible]);

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

  // Handle input focus - don't clear selection to maintain focus/selection distinction
  const handleInputFocus = () => {
    // Keep selection when input gets focus to maintain the distinction
    // between focused (input has focus) and selected (highlighted cell)
  };

  // Handle double-click on cell to focus input
  const handleCellDoubleClick = (row: number, col: number) => {
    // On double-click, we want to focus the input for editing
    // Clear selection since we're now focusing for editing
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

  // Render dial icon component
  const renderDialIcon = (type: 'column' | 'row', index: number, position: { top?: number; left?: number; right?: number; bottom?: number }) => {
    const dots = type === 'column' 
      ? Array(6).fill('•') // 2x3 for columns (6 dots total)
      : Array(6).fill('•'); // 3x2 for rows (6 dots total)
    
    return (
      <div
        className="dial-icon absolute p-1.5 font-bold bg-gray-800 rounded cursor-pointer z-50 hover:bg-gray-700 transition-colors shadow-lg border border-gray-600 hover:border-gray-400 animate-in fade-in duration-200"
        style={position}
        onClick={(e) => handleDialClick(e, type, index)}
      >
        <div className={`grid ${type === 'column' ? 'grid-cols-3 grid-rows-2 w-6 h-4' : 'grid-cols-2 grid-rows-3 w-4 h-6'} gap-0.5`}>
          {dots.map((dot, idx) => (
            <div key={idx} className="text-gray-100 font-bold text-[10px] leading-none flex items-center justify-center">
              {dot}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render compact toolbar
  const renderCompactToolbar = () => {
    if (!compactToolbar.isVisible) return null;

    const { type, position, targetIndex } = compactToolbar;

    return (
      <div
        className="compact-toolbar fixed bg-gray-900 p-1 rounded shadow-lg z-30 flex gap-1 border border-gray-700"
        style={{ left: position.x, top: position.y }}
      >
        {/* Duplicate button */}
        <button
          className="text-sm p-1 bg-gray-800 rounded hover:bg-gray-700 text-white transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
          onClick={() => type === 'column' ? duplicateColumn(targetIndex) : duplicateRow(targetIndex)}
          title="Duplicate"
        >
          📋
        </button>

        {/* Insert buttons */}
        {type === 'column' ? (
          <>
            <button
              className="text-sm p-1 bg-gray-800 rounded hover:bg-gray-700 text-white transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
              onClick={() => insertColumn(targetIndex, 'left')}
              title="Insert Left"
            >
              ⬅️
            </button>
            <button
              className="text-sm p-1 bg-gray-800 rounded hover:bg-gray-700 text-white transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
              onClick={() => insertColumn(targetIndex, 'right')}
              title="Insert Right"
            >
              ➡️
            </button>
          </>
        ) : (
          <>
            <button
              className="text-sm p-1 bg-gray-800 rounded hover:bg-gray-700 text-white transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
              onClick={() => insertRow(targetIndex, 'above')}
              title="Insert Above"
            >
              ⬆️
            </button>
            <button
              className="text-sm p-1 bg-gray-800 rounded hover:bg-gray-700 text-white transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
              onClick={() => insertRow(targetIndex, 'below')}
              title="Insert Below"
            >
              ⬇️
            </button>
          </>
        )}

        {/* Color button with submenu */}
        <div className="relative">
          <button
            className="text-sm p-1 bg-gray-800 rounded hover:bg-gray-700 text-white transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
            title="Color"
            onClick={() => setShowColorSubmenu(!showColorSubmenu)}
          >
            🎨
          </button>
          
          {/* Color submenu */}
          {showColorSubmenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg p-2 z-40 min-w-[120px]">
              <div className="text-xs text-gray-300 mb-1">Text Color</div>
              <div className="flex gap-1 mb-2">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map(color => (
                  <button
                    key={color}
                    className="w-4 h-4 rounded border border-gray-600 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                    title={`Text color: ${color}`}
                    onClick={() => {
                      // TODO: Apply text color
                      setShowColorSubmenu(false);
                    }}
                  />
                ))}
              </div>
              
              <div className="text-xs text-gray-300 mb-1">Background</div>
              <div className="flex gap-1">
                {['transparent', '#FFCCCC', '#CCFFCC', '#CCCCFF', '#FFFFCC'].map(color => (
                  <button
                    key={color}
                    className="w-4 h-4 rounded border border-gray-600 hover:border-gray-400"
                    style={{ backgroundColor: color === 'transparent' ? '#ffffff' : color }}
                    title={`Background: ${color}`}
                    onClick={() => {
                      // TODO: Apply background color
                      setShowColorSubmenu(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-auto">
      <div className="relative inline-block" style={{ margin: '40px' }}>
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
                      className={`w-full h-full bg-transparent focus:outline-none focus:bg-green-50 dark:focus:bg-green-900/20 px-2 py-1 ${
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
                    
                    {/* Focused cell indicator - shows when input has focus */}
                    <div className="absolute inset-0 border-2 border-transparent focus-within:border-green-500 pointer-events-none" />
                    
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

        {/* Dial Icons */}
        {isEditMode && (() => {
          const activeCell = getActiveCell();
          if (!activeCell) return null;
          
          const { row, col } = activeCell;
          
          // Calculate positions for dial icons - adjusted for better visibility
          const topBorderDialPosition = {
            top: -16, // Please don't change this value
            left: columnWidths.slice(0, col).reduce((sum, width) => sum + width, 0) + columnWidths[col] / 2 - 16
          };
          
          const leftBorderDialPosition = {
            top: rowHeights.slice(0, row).reduce((sum, height) => sum + height, 0) + rowHeights[row] / 2 - 18, // Adjusted for 3x2 icon height
            left: -16 // Please don't change this value
          };
          
          return (
            <>
              {/* Column dial icon on top border */}
              {renderDialIcon('column', col, topBorderDialPosition)}
              
              {/* Row dial icon on left border */}
              {renderDialIcon('row', row, leftBorderDialPosition)}
            </>
          );
        })()}

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

        {/* Compact Toolbar */}
        {renderCompactToolbar()}
      </div>
    </div>
  );
};

export default TableBlock; 