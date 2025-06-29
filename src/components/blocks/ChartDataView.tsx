'use client';
import React, { useState, useRef, useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface Props {
    labels: string[]; // Now passed as prop instead of from Redux
    values: number[];
    updateLabel: (idx: number, label: string) => void;
    updateValue: (idx: number, value: number) => void;
    handleTriggerClick: (e: React.MouseEvent<HTMLButtonElement>, rowIdx: number) => void;
    anchorEl: HTMLElement | null;
    closeMenu: () => void;
    handleMenuAction: (action: 'delete' | 'above' | 'below') => void;
    addRowToEnd: () => void;
}

const ChartDataView: React.FC<Props> = ({
    labels, // Now using labels prop instead of Redux
    values,
    updateLabel,
    updateValue,
    handleTriggerClick,
    anchorEl,
    closeMenu,
    handleMenuAction,
    addRowToEnd,
}) => {
    const [hoveredRowIdx, setHoveredRowIdx] = useState<number | null>(null);
    const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
    
    // Refs for input elements
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Label redundancy detection
    const duplicateLabels = useMemo(() => {
        const labelCounts: { [label: string]: number[] } = {};
        const duplicates: number[] = [];
        
        labels.forEach((label, index) => {
            if (label.trim() === '') return; // Skip empty labels
            
            const normalizedLabel = label.trim().toLowerCase();
            if (!labelCounts[normalizedLabel]) {
                labelCounts[normalizedLabel] = [];
            }
            labelCounts[normalizedLabel].push(index);
        });
        
        Object.values(labelCounts).forEach(indices => {
            if (indices.length > 1) {
                duplicates.push(...indices);
            }
        });
        
        return duplicates;
    }, [labels]);

    // Generate unique label suggestion
    const generateUniqueLabel = (baseLabel: string, currentIndex: number): string => {
        const trimmedBase = baseLabel.trim();
        if (trimmedBase === '') return 'Label';
        
        const existingLabels = labels
            .map((label, idx) => idx !== currentIndex ? label.trim().toLowerCase() : '')
            .filter(Boolean);
        
        let counter = 1;
        let suggestion = trimmedBase;
        
        while (existingLabels.includes(suggestion.toLowerCase())) {
            counter++;
            suggestion = `${trimmedBase} (${counter})`;
        }
        
        return suggestion;
    };

    // Auto-fix duplicates
    const handleAutoFixDuplicates = () => {
        const newLabels = [...labels];
        const processed = new Set<string>();
        
        labels.forEach((label, index) => {
            const normalizedLabel = label.trim().toLowerCase();
            if (normalizedLabel === '' || !processed.has(normalizedLabel)) {
                processed.add(normalizedLabel);
                return;
            }
            
            // This is a duplicate, generate unique name
            const uniqueLabel = generateUniqueLabel(label, index);
            newLabels[index] = uniqueLabel;
            updateLabel(index, uniqueLabel);
        });
    };

    const getInputRef = (row: number, col: number) => `${row}-${col}`;

    const setInputRef = (row: number, col: number, ref: HTMLInputElement | null) => {
        inputRefs.current[getInputRef(row, col)] = ref;
    };

    const focusCell = (row: number, col: number, cursorPosition?: 'start' | 'end') => {
        const ref = inputRefs.current[getInputRef(row, col)];
        if (ref) {
            ref.focus();
            
            // Set cursor position
            if (cursorPosition === 'start') {
                ref.setSelectionRange(0, 0);
            } else if (cursorPosition === 'end') {
                const length = ref.value.length;
                ref.setSelectionRange(length, length);
            } else {
                ref.select();
            }
            
            setActiveCell({ row, col });
        }
    };

    // Helper function to check if cursor is at the start of input
    const isCursorAtStart = (input: HTMLInputElement): boolean => {
        return input.selectionStart === 0;
    };

    // Helper function to check if cursor is at the end of input
    const isCursorAtEnd = (input: HTMLInputElement): boolean => {
        return input.selectionStart === input.value.length;
    };

    // Helper function to check if text is selected
    const hasTextSelected = (input: HTMLInputElement): boolean => {
        return input.selectionStart !== input.selectionEnd;
    };

    const handleKeyDown = (e: React.KeyboardEvent, currentRow: number, currentCol: number) => {
        const maxRow = labels.length - 1;
        const maxCol = 1; // 0 = label, 1 = value
        const currentInput = e.target as HTMLInputElement;

        switch (e.key) {
            case 'ArrowUp':
                // Always allow vertical navigation
                e.preventDefault();
                if (currentRow > 0) {
                    focusCell(currentRow - 1, currentCol);
                }
                break;
                
            case 'ArrowDown':
                // Always allow vertical navigation
                e.preventDefault();
                if (currentRow < maxRow) {
                    focusCell(currentRow + 1, currentCol);
                }
                break;
                
            case 'ArrowLeft':
                // Only navigate between cells if cursor is at start or text is selected
                if (isCursorAtStart(currentInput) || hasTextSelected(currentInput)) {
                    e.preventDefault();
                    if (currentCol > 0) {
                        focusCell(currentRow, currentCol - 1, 'end');
                    } else if (currentRow > 0) {
                        // Move to end of previous row
                        focusCell(currentRow - 1, maxCol, 'end');
                    }
                }
                // If cursor is not at start, let the default behavior handle cursor movement within input
                break;
                
            case 'ArrowRight':
                // Only navigate between cells if cursor is at end or text is selected
                if (isCursorAtEnd(currentInput) || hasTextSelected(currentInput)) {
                    e.preventDefault();
                    if (currentCol < maxCol) {
                        focusCell(currentRow, currentCol + 1, 'start');
                    } else if (currentRow < maxRow) {
                        // Move to beginning of next row
                        focusCell(currentRow + 1, 0, 'start');
                    }
                }
                // If cursor is not at end, let the default behavior handle cursor movement within input
                break;
                
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift+Tab - move backwards
                    if (currentCol > 0) {
                        focusCell(currentRow, currentCol - 1, 'end');
                    } else if (currentRow > 0) {
                        focusCell(currentRow - 1, maxCol, 'end');
                    }
                } else {
                    // Tab - move forwards
                    if (currentCol < maxCol) {
                        focusCell(currentRow, currentCol + 1, 'start');
                    } else if (currentRow < maxRow) {
                        focusCell(currentRow + 1, 0, 'start');
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentRow < maxRow) {
                    focusCell(currentRow + 1, currentCol, 'start');
                } else {
                    // If on last row, add a new row and focus it
                    addRowToEnd();
                    // Use setTimeout to ensure new row is rendered
                    setTimeout(() => focusCell(currentRow + 1, currentCol, 'start'), 0);
                }
                break;
                
            case 'Home':
                // Navigate to first cell of current row if Ctrl is pressed
                if (e.ctrlKey) {
                    e.preventDefault();
                    focusCell(currentRow, 0, 'start');
                }
                // Otherwise, let default behavior handle cursor movement to start of input
                break;
                
            case 'End':
                // Navigate to last cell of current row if Ctrl is pressed
                if (e.ctrlKey) {
                    e.preventDefault();
                    focusCell(currentRow, maxCol, 'end');
                }
                // Otherwise, let default behavior handle cursor movement to end of input
                break;
        }
    };

    const handleCellFocus = (row: number, col: number) => {
        setActiveCell({ row, col });
    };

    const handleCellBlur = () => {
        // Small delay to allow other focus events to fire first
        setTimeout(() => {
            if (!document.activeElement || !document.activeElement.closest('.chart-data-table')) {
                setActiveCell(null);
            }
        }, 0);
    };

    return (
        <div className="bg-gray-700 rounded p-3">
            {/* Duplicate Labels Warning */}
            {duplicateLabels.length > 0 && (
                <div className="mb-3 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-200">
                        <WarningIcon fontSize="small" />
                        <span className="text-sm">
                            {duplicateLabels.length} duplicate label{duplicateLabels.length > 1 ? 's' : ''} detected
                        </span>
                    </div>
                    <button
                        onClick={handleAutoFixDuplicates}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        title="Automatically rename duplicate labels"
                    >
                        <AutoFixHighIcon fontSize="small" />
                        Auto-fix
                    </button>
                </div>
            )}
            
            <div className="relative">
                <TableContainer component={Paper} className="chart-data-table" sx={{ backgroundColor: 'transparent' }}>
                    <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                            <TableRow sx={{ borderTop: '4px solid #ffffff' }}>
                                <TableCell sx={{ color: 'white', borderRight: '1px solid #ffffff', backgroundColor: 'transparent' }}>Label</TableCell>
                                <TableCell sx={{ color: 'white', borderRight: '1px solid #ffffff', backgroundColor: 'transparent' }}>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {labels.map((lbl, idx) => (
                                <TableRow 
                                    key={idx} 
                                    onMouseEnter={() => setHoveredRowIdx(idx)} 
                                    onMouseLeave={() => setHoveredRowIdx(null)} 
                                    onDoubleClick={addRowToEnd} 
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: 'rgba(255,255,255,0.05)', 
                                            borderBottom: `${idx === labels.length - 1 ? '4px' : '1px'} solid #ffffff` 
                                        },
                                        // Highlight active row
                                        ...(activeCell?.row === idx && {
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                        })
                                    }}
                                >
                                    <TableCell sx={{ 
                                        borderRight: '1px solid #ffffff', 
                                        position: 'relative', 
                                        paddingLeft: '2rem',
                                        // Highlight active cell
                                        ...(activeCell?.row === idx && activeCell?.col === 0 && {
                                            backgroundColor: 'rgba(255,255,255,0.12)',
                                        })
                                    }}>
                                        {/* Trigger button */}
                                        {hoveredRowIdx === idx && (
                                            <button
                                                className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-gray-800 hover:bg-gray-900 p-1 rounded"
                                                onClick={(e) => handleTriggerClick(e, idx)}
                                                title="Row actions"
                                            >
                                                ☰
                                            </button>
                                        )}
                                        <div className="relative">
                                            <input
                                                ref={(ref) => setInputRef(idx, 0, ref)}
                                                value={lbl}
                                                onChange={(e) => updateLabel(idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, idx, 0)}
                                                onFocus={() => handleCellFocus(idx, 0)}
                                                onBlur={handleCellBlur}
                                                className={`w-full px-2 py-1 text-white bg-transparent focus:outline-none rounded ${
                                                    duplicateLabels.includes(idx) 
                                                        ? 'border border-yellow-500 bg-yellow-900/20' 
                                                        : ''
                                                }`}
                                                placeholder="Label"
                                                aria-label="Label"
                                                tabIndex={0}
                                            />
                                            {duplicateLabels.includes(idx) && (
                                                <WarningIcon 
                                                    fontSize="small" 
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none"
                                                    titleAccess="Duplicate label"
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        borderRight: '1px solid #ffffff',
                                        // Highlight active cell
                                        ...(activeCell?.row === idx && activeCell?.col === 1 && {
                                            backgroundColor: 'rgba(255,255,255,0.12)',
                                        })
                                    }}>
                                        <input
                                            ref={(ref) => setInputRef(idx, 1, ref)}
                                            type="text"
                                            value={values[idx] ?? 0}
                                            onChange={(e) => updateValue(idx, Number(e.target.value))}
                                            onKeyDown={(e) => handleKeyDown(e, idx, 1)}
                                            onFocus={() => handleCellFocus(idx, 1)}
                                            onBlur={handleCellBlur}
                                            className="w-full px-2 py-1 text-white bg-transparent focus:outline-none rounded"
                                            placeholder="Value"
                                            aria-label="Value"
                                            tabIndex={0}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Menu Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={closeMenu}
                anchorReference="anchorPosition"
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                anchorPosition={
                    anchorEl ? {
                        top: anchorEl.getBoundingClientRect().top + anchorEl.getBoundingClientRect().height / 2,
                        left: anchorEl.getBoundingClientRect().right + 8
                    } : { top: 0, left: 0 }
                }
                PaperProps={{ sx: { backgroundColor: 'rgba(94, 94, 94, 0.8)', borderRadius: '4px', p: '16px', backdropFilter: 'blur(10px)', position: 'absolute', top: '0', left: '0' } }}
            >
                <div className="flex flex-col gap-2">
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white text-xs rounded p-2 flex items-center gap-1"
                        onClick={() => handleMenuAction('delete')}
                    >
                        <DeleteIcon /> <span>Delete</span>
                    </button>
                    <button
                        className="bg-gray-800 hover:bg-gray-900 text-white text-xs rounded p-2 flex items-center gap-1"
                        onClick={() => handleMenuAction('above')}
                    >
                        <KeyboardArrowUpIcon /> <span>Insert Above</span>
                    </button>
                    <button
                        className="bg-gray-800 hover:bg-gray-900 text-white text-xs rounded p-2 flex items-center gap-1"
                        onClick={() => handleMenuAction('below')}
                    >
                        <KeyboardArrowDownIcon /> <span>Insert Below</span>
                    </button>
                </div>
            </Popover>
        </div>
    );
};

export default ChartDataView;