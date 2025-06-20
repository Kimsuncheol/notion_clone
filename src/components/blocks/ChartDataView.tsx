'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Props {
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
    values,
    updateLabel,
    updateValue,
    handleTriggerClick,
    anchorEl,
    closeMenu,
    handleMenuAction,
    addRowToEnd,
}) => {
    const labels = useAppSelector((state) => state.labels.labels);
    const [hoveredRowIdx, setHoveredRowIdx] = useState<number | null>(null);
    const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
    
    // Refs for input elements
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
                                        <input
                                            ref={(ref) => setInputRef(idx, 0, ref)}
                                            value={lbl}
                                            onChange={(e) => updateLabel(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, idx, 0)}
                                            onFocus={() => handleCellFocus(idx, 0)}
                                            onBlur={handleCellBlur}
                                            className="w-full px-2 py-1 text-white bg-transparent focus:outline-none rounded"
                                            placeholder="Label"
                                            aria-label="Label"
                                            tabIndex={0}
                                        />
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
// 'use client';
// import React, { useState, useRef, useEffect } from 'react';
// import { useAppSelector } from '@/store/hooks';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
// import Popover from '@mui/material/Popover';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// interface Props {
//     values: number[];
//     updateLabel: (idx: number, label: string) => void;
//     updateValue: (idx: number, value: number) => void;
//     handleTriggerClick: (e: React.MouseEvent<HTMLButtonElement>, rowIdx: number) => void;
//     anchorEl: HTMLElement | null;
//     closeMenu: () => void;
//     handleMenuAction: (action: 'delete' | 'above' | 'below') => void;
//     addRowToEnd: () => void;
// }

// const ChartDataView: React.FC<Props> = ({
//     values,
//     updateLabel,
//     updateValue,
//     handleTriggerClick,
//     anchorEl,
//     closeMenu,
//     handleMenuAction,
//     addRowToEnd,
// }) => {
//     const labels = useAppSelector((state) => state.labels.labels);
//     const [hoveredRowIdx, setHoveredRowIdx] = useState<number | null>(null);
//     const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
    
//     // Refs for input elements
//     const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

//     const getInputRef = (row: number, col: number) => `${row}-${col}`;

//     const setInputRef = (row: number, col: number, ref: HTMLInputElement | null) => {
//         inputRefs.current[getInputRef(row, col)] = ref;
//     };

//     const focusCell = (row: number, col: number) => {
//         const ref = inputRefs.current[getInputRef(row, col)];
//         if (ref) {
//             ref.focus();
//             ref.select();
//             setActiveCell({ row, col });
//         }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent, currentRow: number, currentCol: number) => {
//         const maxRow = labels.length - 1;
//         const maxCol = 1; // 0 = label, 1 = value

//         switch (e.key) {
//             case 'ArrowUp':
//                 e.preventDefault();
//                 if (currentRow > 0) {
//                     focusCell(currentRow - 1, currentCol);
//                 }
//                 break;
//             case 'ArrowDown':
//                 e.preventDefault();
//                 if (currentRow < maxRow) {
//                     focusCell(currentRow + 1, currentCol);
//                 }
//                 break;
//             case 'ArrowLeft':
//                 e.preventDefault();
//                 if (currentCol > 0) {
//                     focusCell(currentRow, currentCol - 1);
//                 } else if (currentRow > 0) {
//                     // Move to end of previous row
//                     focusCell(currentRow - 1, maxCol);
//                 }
//                 break;
//             case 'ArrowRight':
//                 e.preventDefault();
//                 if (currentCol < maxCol) {
//                     focusCell(currentRow, currentCol + 1);
//                 } else if (currentRow < maxRow) {
//                     // Move to beginning of next row
//                     focusCell(currentRow + 1, 0);
//                 }
//                 break;
//             case 'Tab':
//                 e.preventDefault();
//                 if (e.shiftKey) {
//                     // Shift+Tab - move backwards
//                     if (currentCol > 0) {
//                         focusCell(currentRow, currentCol - 1);
//                     } else if (currentRow > 0) {
//                         focusCell(currentRow - 1, maxCol);
//                     }
//                 } else {
//                     // Tab - move forwards
//                     if (currentCol < maxCol) {
//                         focusCell(currentRow, currentCol + 1);
//                     } else if (currentRow < maxRow) {
//                         focusCell(currentRow + 1, 0);
//                     }
//                 }
//                 break;
//             case 'Enter':
//                 e.preventDefault();
//                 if (currentRow < maxRow) {
//                     focusCell(currentRow + 1, currentCol);
//                 } else {
//                     // If on last row, add a new row and focus it
//                     addRowToEnd();
//                     // Use setTimeout to ensure new row is rendered
//                     setTimeout(() => focusCell(currentRow + 1, currentCol), 0);
//                 }
//                 break;
//         }
//     };

//     const handleCellFocus = (row: number, col: number) => {
//         setActiveCell({ row, col });
//     };

//     const handleCellBlur = () => {
//         // Small delay to allow other focus events to fire first
//         setTimeout(() => {
//             if (!document.activeElement || !document.activeElement.closest('.chart-data-table')) {
//                 setActiveCell(null);
//             }
//         }, 0);
//     };

//     return (
//         <div className="bg-gray-700 rounded p-3">
//             <div className="relative">
//                 <TableContainer component={Paper} className="chart-data-table" sx={{ backgroundColor: 'transparent' }}>
//                     <Table size="small" sx={{ borderCollapse: 'collapse' }}>
//                         <TableHead>
//                             <TableRow sx={{ borderTop: '4px solid #ffffff' }}>
//                                 <TableCell sx={{ color: 'white', borderRight: '1px solid #ffffff', backgroundColor: 'transparent' }}>Label</TableCell>
//                                 <TableCell sx={{ color: 'white', borderRight: '1px solid #ffffff', backgroundColor: 'transparent' }}>Value</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {labels.map((lbl, idx) => (
//                                 <TableRow 
//                                     key={idx} 
//                                     onMouseEnter={() => setHoveredRowIdx(idx)} 
//                                     onMouseLeave={() => setHoveredRowIdx(null)} 
//                                     onDoubleClick={addRowToEnd} 
//                                     sx={{ 
//                                         '&:hover': { 
//                                             backgroundColor: 'rgba(255,255,255,0.05)', 
//                                             borderBottom: `${idx === labels.length - 1 ? '4px' : '1px'} solid #ffffff` 
//                                         },
//                                         // Highlight active row
//                                         ...(activeCell?.row === idx && {
//                                             backgroundColor: 'rgba(255,255,255,0.08)',
//                                         })
//                                     }}
//                                 >
//                                     <TableCell sx={{ 
//                                         borderRight: '1px solid #ffffff', 
//                                         position: 'relative', 
//                                         paddingLeft: '2rem',
//                                         // Highlight active cell
//                                         ...(activeCell?.row === idx && activeCell?.col === 0 && {
//                                             backgroundColor: 'rgba(255,255,255,0.12)',
//                                         })
//                                     }}>
//                                         {/* Trigger button */}
//                                         {hoveredRowIdx === idx && (
//                                             <button
//                                                 className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-gray-800 hover:bg-gray-900 p-1 rounded"
//                                                 onClick={(e) => handleTriggerClick(e, idx)}
//                                                 title="Row actions"
//                                             >
//                                                 ☰
//                                             </button>
//                                         )}
//                                         <input
//                                             ref={(ref) => setInputRef(idx, 0, ref)}
//                                             value={lbl}
//                                             onChange={(e) => updateLabel(idx, e.target.value)}
//                                             onKeyDown={(e) => handleKeyDown(e, idx, 0)}
//                                             onFocus={() => handleCellFocus(idx, 0)}
//                                             onBlur={handleCellBlur}
//                                             className="w-full px-2 py-1 text-white bg-transparent focus:outline-none rounded"
//                                             placeholder="Label"
//                                             aria-label="Label"
//                                             tabIndex={0}
//                                         />
//                                     </TableCell>
//                                     <TableCell sx={{ 
//                                         borderRight: '1px solid #ffffff',
//                                         // Highlight active cell
//                                         ...(activeCell?.row === idx && activeCell?.col === 1 && {
//                                             backgroundColor: 'rgba(255,255,255,0.12)',
//                                         })
//                                     }}>
//                                         <input
//                                             ref={(ref) => setInputRef(idx, 1, ref)}
//                                             type="number"
//                                             value={values[idx] ?? 0}
//                                             onChange={(e) => updateValue(idx, Number(e.target.value))}
//                                             onKeyDown={(e) => handleKeyDown(e, idx, 1)}
//                                             onFocus={() => handleCellFocus(idx, 1)}
//                                             onBlur={handleCellBlur}
//                                             className="w-full px-2 py-1 text-white bg-transparent focus:outline-none rounded"
//                                             placeholder="Value"
//                                             aria-label="Value"
//                                             tabIndex={0}
//                                         />
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </div>

//             {/* Menu Popover */}
//             <Popover
//                 open={Boolean(anchorEl)}
//                 anchorEl={anchorEl}
//                 onClose={closeMenu}
//                 anchorReference="anchorPosition"
//                 transformOrigin={{
//                     vertical: 'center',
//                     horizontal: 'left',
//                 }}
//                 anchorPosition={
//                     anchorEl ? {
//                         top: anchorEl.getBoundingClientRect().top + anchorEl.getBoundingClientRect().height / 2,
//                         left: anchorEl.getBoundingClientRect().right + 8
//                     } : { top: 0, left: 0 }
//                 }
//                 PaperProps={{ sx: { backgroundColor: 'rgba(94, 94, 94, 0.8)', borderRadius: '4px', p: '16px', backdropFilter: 'blur(10px)', position: 'absolute', top: '0', left: '0' } }}
//             >
//                 <div className="flex flex-col gap-2">
//                     <button
//                         className="bg-red-600 hover:bg-red-700 text-white text-xs rounded p-2 flex items-center gap-1"
//                         onClick={() => handleMenuAction('delete')}
//                     >
//                         <DeleteIcon /> <span>Delete</span>
//                     </button>
//                     <button
//                         className="bg-gray-800 hover:bg-gray-900 text-white text-xs rounded p-2 flex items-center gap-1"
//                         onClick={() => handleMenuAction('above')}
//                     >
//                         <KeyboardArrowUpIcon /> <span>Insert Above</span>
//                     </button>
//                     <button
//                         className="bg-gray-800 hover:bg-gray-900 text-white text-xs rounded p-2 flex items-center gap-1"
//                         onClick={() => handleMenuAction('below')}
//                     >
//                         <KeyboardArrowDownIcon /> <span>Insert Below</span>
//                     </button>
//                 </div>
//             </Popover>
//         </div>
//     );
// };

// export default ChartDataView;
