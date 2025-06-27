'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import TitleInput from './TitleInput';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Skeleton, Box } from '@mui/material';
import { Block, BlockType } from '@/types/blocks';
import type { TextBlock as TextBlockType, StyledTextBlock as StyledBlockType, ListBlock as ListBlockType, OrderedListBlock as OrderedListBlockType, TableBlock as TableBlockType, ImageBlock as ImageBlockType, ChartBlock as ChartBlockType, CodeBlock as CodeBlockType, LaTeXBlock as LaTeXBlockType } from '@/types/blocks';
import { fetchNoteContent, updateNoteContent, updatePageName } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import {
  TextBlock as TextBlockComponent,
  StyledTextBlock,
  ListBlock,
  OrderedListBlock,
  TableBlock,
  ChartBlock,
  ImageBlock,
  CodeBlock,
  LaTeXBlock,
} from './blocks';
import BlockWrapper from './BlockWrapper';
import { Comment } from '@/types/comments';
import { useEditMode } from '@/contexts/EditModeContext';
import { useAppDispatch } from '@/store/hooks';
import { movePageBetweenFolders } from '@/store/slices/sidebarSlice';
import { getUserWorkspaceRole } from '@/services/firebase';
import { useModalStore } from '@/store/modalStore';


// Simple id generator to avoid external dependency and prevent hydration issues
let idCounter = 0;
const generateId = () => {
  // Use predictable counter-based IDs to prevent hydration mismatches
  return `block_${++idCounter}_${Date.now()}`;
};

function createTextBlock(): Block {
  return { id: generateId(), type: 'text', content: '' };
}

function createListBlock(): ListBlockType {
  return { id: generateId(), type: 'list', content: [{ text: '', level: 0 }] };
}

function createOrderedListBlock(): OrderedListBlockType {
  return { id: generateId(), type: 'orderedlist', content: [{ text: '', level: 0, numberType: '1' }] };
}

function createTableBlock(): TableBlockType {
  return { 
    id: generateId(), 
    type: 'table', 
    content: { 
      cells: {},
      rows: 3,
      cols: 3
    } 
  };
}

function createImageBlock(): ImageBlockType {
  return { id: generateId(), type: 'image', content: { src: null } };
}



function createCodeBlock(): CodeBlockType {
  return { id: generateId(), type: 'code', content: { code: '', language: 'javascript' } };
}

function createLatexBlock(): LaTeXBlockType {
  return { id: generateId(), type: 'latex', content: { latex: '', displayMode: false } };
}

function createChartBlock(chartType: string = 'bar'): ChartBlockType {
  return { 
    id: generateId(), 
    type: 'chart', 
    content: { 
      chartType,
      data: {
        labels: ['A', 'B', 'C', 'D'],
        values: [10, 20, 15, 25]
      },
      config: {
        width: 600,
        height: 300,
        title: `Sample ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
      }
    } 
  };
}

interface Props { 
  pageId: string;
  onSaveTitle: (title: string) => void; 
  onBlockCommentsChange?: (blockComments: Record<string, Comment[]>) => void;
}

// Drag item interface
interface DragItem {
  type: string;
  index: number;
  id: string;
}

// Drop zone component for between blocks
const DropZone: React.FC<{ 
  index: number; 
  onDrop: (dragIndex: number, hoverIndex: number) => void;
  isDragging: boolean;
}> = ({ index, onDrop, isDragging }) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: 'block',
    drop: (item: DragItem) => {
      onDrop(item.index, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  return (
    <div
      ref={dropRef}
      className={`transition-all duration-200 ${
        isDragging 
          ? 'h-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-md my-1' 
          : 'h-0'
      } ${
        isDragging && isOver 
          ? 'bg-blue-100 dark:bg-blue-800/40 border-blue-500 dark:border-blue-400' 
          : ''
      }`}
    >
      {isDragging && (
        <div className="flex items-center justify-center h-full">
          {isOver ? (
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Drop here
            </span>
          ) : (
            <span className="text-blue-500 dark:text-blue-500 text-xs">
              Drop zone
            </span>
          )}
          </div>
      )}
    </div>
  );
};

// Draggable block wrapper
const DraggableBlock: React.FC<{
  block: Block;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
  isDragDisabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}> = ({ block, index, onMove, children, isDragDisabled = false, onDragStart, onDragEnd }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { type: 'block', index, id: block.id },
    canDrag: !isDragDisabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }, [index, isDragDisabled]);

  const [, drop] = useDrop({
    accept: 'block',
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  }, [index, onMove]);

  // Effect to track drag state
  useEffect(() => {
    if (isDragging && onDragStart) {
      onDragStart();
    } else if (!isDragging && onDragEnd) {
      onDragEnd();
    }
  }, [isDragging, onDragStart, onDragEnd]);

  useEffect(() => {
    if (ref.current) {
      drag(drop(ref.current));
    }
  }, [drag, drop]);

  return (
    <div
      ref={ref}
      className={`group transition-all duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${!isDragDisabled ? 'hover:bg-gray-50 dark:hover:bg-blue-800/20 cursor-move rounded-sm' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      title={!isDragDisabled ? "Click and drag to reorder this block" : ""}
    >
      {/* Drag indicator - only visible on hover */}
      {!isDragDisabled && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="text-gray-400 dark:text-gray-500 text-sm">⋮⋮</div>
        </div>
      )}
      {children}
    </div>
  );
};



const Editor: React.FC<Props> = ({ pageId, onSaveTitle, onBlockCommentsChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([createTextBlock()]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [blockComments, setBlockComments] = useState<Record<string, Comment[]>>({});
  const [isPublic, setIsPublic] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const auth = getAuth(firebaseApp);
  const titleRef = useRef<string>('');
  const blocksRef = useRef<Block[]>([]);
  const { isEditMode } = useEditMode();
  const { currentWorkspace } = useModalStore();
  const dispatch = useAppDispatch();

  // Block types that should be skipped during arrow navigation because they cannot receive keyboard focus
  const NON_NAVIGABLE_TYPES: BlockType[] = ['image', 'chart'];

  // Update refs when state changes
  useEffect(() => {
    titleRef.current = title;
    blocksRef.current = blocks;
  }, [title, blocks]);

  // Notify parent component when block comments change
  useEffect(() => {
    if (onBlockCommentsChange) {
      onBlockCommentsChange(blockComments);
    }
  }, [blockComments, onBlockCommentsChange]);

  // Load note content and user role when pageId changes
  useEffect(() => {
    const loadNoteContent = async () => {
      if (!pageId || !auth.currentUser) return;

      setIsLoading(true);
      try {
        // Load note content
        const noteContent = await fetchNoteContent(pageId);
        if (noteContent) {
          setTitle(noteContent.title);
          setBlocks(noteContent.blocks.length > 0 ? noteContent.blocks : [createTextBlock()]);
          setIsPublic(noteContent.isPublic || false);
        } else {
          // New page - start with empty content
          setTitle('');
          setBlocks([createTextBlock()]);
          setIsPublic(false);
        }
        
        // Check user role in current workspace
        if (currentWorkspace?.id) {
          const role = await getUserWorkspaceRole(currentWorkspace.id);
          setUserRole(role);
        }
        
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading note content:', error);
        toast.error('Failed to load note content');
      } finally {
        setIsLoading(false);
      }
    };

    loadNoteContent();
  }, [pageId, auth.currentUser, currentWorkspace?.id]);

  // Save function
  const saveNote = useCallback(async (showToast = true) => {
    if (!pageId || !auth.currentUser) return;

    try {
      await updateNoteContent(pageId, titleRef.current, blocksRef.current, isPublic);
      setHasUnsavedChanges(false);
      if (showToast) {
        const authorName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous';
        toast.success(`Note saved by ${authorName}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      if (showToast) {
        toast.error('Failed to save note');
      }
    }
  }, [pageId, auth.currentUser, isPublic]);

  // Auto-save when user stops typing (debounced)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      saveNote(false); // Don't show toast for auto-save
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, saveNote, title, blocks]);

  // Keyboard shortcut for save (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Only save if in edit mode
        if (auth.currentUser && isEditMode) {
          saveNote(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveNote, auth.currentUser, isEditMode]);

  // Helper to find block index by id
  const findIndexById = (id: string) => blocks.findIndex((b) => b.id === id);

  const focusBlock = useCallback((index: number, selector: string = 'input') => {
    if (index < 0 || index >= blocks.length) return;
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-index="${index}"] ${selector}`);
      el?.focus();
    }, 0);
  }, [blocks]);

  // Memoized drag handlers to prevent infinite re-renders
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Block reordering function
  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    setBlocks((prevBlocks) => {
      const newBlocks = [...prevBlocks];
      const draggedBlock = newBlocks[dragIndex];
      
      // Remove the dragged block
      newBlocks.splice(dragIndex, 1);
      
      // Insert it at the new position
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, []);

  const addTextAfter = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks.splice(idx + 1, 0, createTextBlock());
      // After state update, focus new block
      setTimeout(() => focusBlock(idx + 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [blocks, focusBlock]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx <= 0) return prev; // don't remove first block
      const newBlocks = [...prev];
      newBlocks.splice(idx, 1);
      // focus previous block
      setTimeout(() => focusBlock(idx - 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const listToText = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks[idx] = { id, type: 'text', content: '' } as Block;
      setTimeout(() => focusBlock(idx), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  // Enhanced navigation with coordinate support for inter-table navigation
  const moveFocusPrev = useCallback((id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => {
    const idx = findIndexById(id);
    if (idx <= 0) return;
    
    const currentBlock = blocks[idx];

    // Find the previous focusable block index, skipping non-navigable types
    let targetIndex = idx - 1;
    while (targetIndex >= 0 && NON_NAVIGABLE_TYPES.includes(blocks[targetIndex].type as BlockType)) {
      targetIndex--;
    }
    if (targetIndex < 0) return;

    const targetBlock = blocks[targetIndex];
    
    // Navigate to the appropriate position in the target block
    if (targetBlock.type === 'table') {
      const tableContent = (targetBlock as TableBlockType).content;
      let targetRow = tableContent.rows - 1; // Default to last row
      let targetCol = 0; // Default to first column
      
      // Enhanced logic for table-to-table navigation
      if (currentBlock.type === 'table' && fromCoordinate?.row !== undefined && fromCoordinate?.col !== undefined) {
        // Case: Moving from table to table above
        // Position: (current_table_index, fromCoordinate.row, fromCoordinate.col) -> (target_table_index, target_row, target_col)
        targetRow = Math.max(0, tableContent.rows - 1); // Last row of target table (ensure >= 0)
        targetCol = Math.min(Math.max(0, fromCoordinate.col), tableContent.cols - 1); // Same column or last available column
        
        // Debug logging for development
        console.log(`Inter-table navigation UP: from table ${idx} (${fromCoordinate.row}, ${fromCoordinate.col}) to table ${targetIndex} (${targetRow}, ${targetCol})`);
        console.log(`Target table dimensions: ${tableContent.rows}x${tableContent.cols}`);
      } else if (fromCoordinate?.col !== undefined) {
        // From other block types with column info
        targetCol = Math.min(Math.max(0, fromCoordinate.col), tableContent.cols - 1);
      }
      
      setTimeout(() => {
        const selector = `[data-block-index="${targetIndex}"] input[aria-label="Row ${targetRow} Col ${targetCol}"]`;
        console.log(`UP Navigation - Looking for element with selector: ${selector}`);
        console.log(`UP Navigation - Available elements in target block:`, document.querySelectorAll(`[data-block-index="${targetIndex}"] input`));
        const el = document.querySelector<HTMLInputElement>(selector);
        console.log(`UP Navigation - Found element:`, el);
        if (el) {
          el.focus();
          console.log(`UP Navigation - Successfully focused element at (${targetRow}, ${targetCol})`);
        } else {
          console.error(`UP Navigation - Could not find target element`);
          // Fallback: try to focus the first cell of the target table
          const fallbackEl = document.querySelector<HTMLInputElement>(`[data-block-index="${targetIndex}"] input`);
          if (fallbackEl) {
            console.log(`UP Navigation - Using fallback element:`, fallbackEl);
            fallbackEl.focus();
          }
        }
      }, 50);
    } else if (targetBlock.type === 'list') {
      const listContent = (targetBlock as ListBlockType).content;
      const targetItemIndex = listContent.length - 1; // Last item
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(`[data-block-index="${targetIndex}"] input[aria-label="List item ${targetItemIndex}"]`);
        el?.focus();
      }, 0);
    } else if (targetBlock.type === 'orderedlist') {
      const listContent = (targetBlock as OrderedListBlockType).content;
      const targetItemIndex = listContent.length - 1; // Last item
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(`[data-block-index="${targetIndex}"] input[aria-label="Ordered list item ${targetItemIndex}"]`);
        el?.focus();
      }, 0);
    } else if (targetBlock.type === 'code') {
      // Code block - focus the textarea
      setTimeout(() => {
        const el = document.querySelector<HTMLTextAreaElement>(`[data-block-index="${targetIndex}"] textarea`);
        if (el) {
          el.focus();
          // Position cursor at the end of the content
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 0);
    } else {
      // Text or styled block
      focusBlock(targetIndex);
    }
  }, [blocks, focusBlock]);

  const moveFocusNext = useCallback((id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => {
    const idx = findIndexById(id);
    if (idx >= blocks.length - 1) return;
    
    const currentBlock = blocks[idx];

    // Find the next focusable block index, skipping non-navigable types
    let targetIndex = idx + 1;
    while (targetIndex < blocks.length && NON_NAVIGABLE_TYPES.includes(blocks[targetIndex].type as BlockType)) {
      targetIndex++;
    }
    if (targetIndex >= blocks.length) return;

    const targetBlock = blocks[targetIndex];
    
    // Navigate to the appropriate position in the target block
    if (targetBlock.type === 'table') {
      const tableContent = (targetBlock as TableBlockType).content;
      let targetRow = 0; // Default to first row
      let targetCol = 0; // Default to first column
      
      // Enhanced logic for table-to-table navigation
      if (currentBlock.type === 'table' && fromCoordinate?.row !== undefined && fromCoordinate?.col !== undefined) {
        // Case: Moving from table to table below
        // Position: (current_table_index, fromCoordinate.row, fromCoordinate.col) -> (target_table_index, target_row, target_col)
        targetRow = 0; // First row of target table
        targetCol = Math.min(Math.max(0, fromCoordinate.col), tableContent.cols - 1); // Same column or last available column
        
        // Debug logging for development
        console.log(`Inter-table navigation DOWN: from table ${idx} (${fromCoordinate.row}, ${fromCoordinate.col}) to table ${targetIndex} (${targetRow}, ${targetCol})`);
        console.log(`Target table dimensions: ${tableContent.rows}x${tableContent.cols}`);
      } else if (fromCoordinate?.col !== undefined) {
        // From other block types with column info
        targetCol = Math.min(Math.max(0, fromCoordinate.col), tableContent.cols - 1);
      }
      
      setTimeout(() => {
        const selector = `[data-block-index="${targetIndex}"] input[aria-label="Row ${targetRow} Col ${targetCol}"]`;
        console.log(`DOWN Navigation - Looking for element with selector: ${selector}`);
        console.log(`DOWN Navigation - Available elements in target block:`, document.querySelectorAll(`[data-block-index="${targetIndex}"] input`));
        const el = document.querySelector<HTMLInputElement>(selector);
        console.log(`DOWN Navigation - Found element:`, el);
        if (el) {
          el.focus();
          console.log(`DOWN Navigation - Successfully focused element at (${targetRow}, ${targetCol})`);
        } else {
          console.error(`DOWN Navigation - Could not find target element`);
          // Fallback: try to focus the first cell of the target table
          const fallbackEl = document.querySelector<HTMLInputElement>(`[data-block-index="${targetIndex}"] input`);
          if (fallbackEl) {
            console.log(`DOWN Navigation - Using fallback element:`, fallbackEl);
            fallbackEl.focus();
          }
        }
      }, 50);
    } else if (targetBlock.type === 'list') {
      const targetItemIndex = 0; // First item
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(`[data-block-index="${targetIndex}"] input[aria-label="List item ${targetItemIndex}"]`);
        el?.focus();
      }, 0);
    } else if (targetBlock.type === 'orderedlist') {
      const targetItemIndex = 0; // First item
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(`[data-block-index="${targetIndex}"] input[aria-label="Ordered list item ${targetItemIndex}"]`);
        el?.focus();
      }, 0);
    } else if (targetBlock.type === 'code') {
      // Code block - focus the textarea
      setTimeout(() => {
        const el = document.querySelector<HTMLTextAreaElement>(`[data-block-index="${targetIndex}"] textarea`);
        if (el) {
          el.focus();
          // Position cursor at the beginning of the content
          el.setSelectionRange(0, 0);
        }
      }, 0);
    } else {
      // Text or styled block
      focusBlock(targetIndex);
    }
  }, [blocks, focusBlock]);

  const updateBlockContent = useCallback((id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id && (b.type === 'text' || b.type === 'styled') ? { ...b, content } : b)));
    setHasUnsavedChanges(true);
  }, []);

  // New function to update component block content
  const updateComponentBlockContent = useCallback((id: string, content: unknown) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } as Block : b)));
    setHasUnsavedChanges(true);
  }, []);

  const convertBlock = useCallback((id: string, component: BlockType, options?: { chartType?: string }) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      
      // Create the appropriate block type with content
      let newBlock: Block;
      switch (component) {
        case 'list':
          newBlock = createListBlock();
          break;
        case 'orderedlist':
          newBlock = createOrderedListBlock();
          break;
        case 'table':
          newBlock = createTableBlock();
          break;
        case 'image':
          newBlock = createImageBlock();
          break;
        case 'chart':
          newBlock = createChartBlock(options?.chartType || 'bar');
          break;

        case 'code':
          newBlock = createCodeBlock();
          break;
        case 'latex':
          newBlock = createLatexBlock();
          break;
        default:
          newBlock = createTextBlock();
      }
      
      newBlock.id = id; // Keep the same ID
      newBlocks[idx] = newBlock;
      newBlocks.splice(idx + 1, 0, createTextBlock());
      // focus new block below
      setTimeout(() => focusBlock(idx + 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const convertStyled = useCallback((id: string, className: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks[idx] = { id, type: 'styled', className, content: '' } as Block;
      newBlocks.splice(idx + 1, 0, createTextBlock());
      setTimeout(() => focusBlock(idx + 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const handleTitleSave = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
    onSaveTitle(newTitle);
    
    // Update the sidebar to reflect the new title
    dispatch(movePageBetweenFolders({ 
      pageId, 
      isPublic, 
      title: newTitle 
    }));
    
    // Also update the page name in Firebase to sync with sidebar
    if (pageId && auth.currentUser) {
      updatePageName(pageId, newTitle).catch((error) => {
        console.error('Error updating page name:', error);
        // Don't show error toast as this is a background operation
      });
    }
  }, [onSaveTitle, pageId, auth.currentUser, dispatch, isPublic]);

  // Comment management functions
  const addComment = useCallback((blockId: string, text: string) => {
    const newComment: Comment = {
      id: generateId(),
      text,
      author: auth.currentUser?.email || 'Anonymous',
      timestamp: new Date(),
    };
    
    setBlockComments(prev => ({
      ...prev,
      [blockId]: [...(prev[blockId] || []), newComment],
    }));
    setHasUnsavedChanges(true);
  }, [auth.currentUser]);

  const deleteComment = useCallback((blockId: string, commentId: string) => {
    setBlockComments(prev => ({
      ...prev,
      [blockId]: (prev[blockId] || []).filter(comment => comment.id !== commentId),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Create stable callback functions for each block
  const createContentChangeCallback = useCallback((blockId: string) => {
    return (content: unknown) => updateComponentBlockContent(blockId, content);
  }, [updateComponentBlockContent]);

  const renderBlock = (block: Block, index: number) => {
    const blockContent = (() => {
      switch (block.type) {
        case 'text':
          return (
            <TextBlockComponent
              block={block}
              onUpdate={updateBlockContent}
              onConvert={convertBlock}
              onAddBelow={addTextAfter}
              onArrowPrev={moveFocusPrev}
              onArrowNext={moveFocusNext}
              onRemove={removeBlock}
              onConvertStyled={convertStyled}
            />
          );
        case 'list':
          return (
            <ListBlock
              initialItems={(block as ListBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
              onArrowPrevBlock={(itemIndex) => moveFocusPrev(block.id, { itemIndex })}
              onArrowNextBlock={(itemIndex) => moveFocusNext(block.id, { itemIndex })}
              toTextBlock={() => listToText(block.id)}
            />
          );
        case 'orderedlist':
          return (
            <OrderedListBlock
              initialItems={(block as OrderedListBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
              onArrowPrevBlock={(itemIndex) => moveFocusPrev(block.id, { itemIndex })}
              onArrowNextBlock={(itemIndex) => moveFocusNext(block.id, { itemIndex })}
              toTextBlock={() => listToText(block.id)}
            />
          );
        case 'table':
          return (
            <TableBlock
              initialData={(block as TableBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
              onArrowPrevBlock={(row, col) => moveFocusPrev(block.id, { row, col })}
              onArrowNextBlock={(row, col) => moveFocusNext(block.id, { row, col })}
            />
          );
        case 'image':
          return (
            <ImageBlock 
              initialContent={(block as ImageBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
            />
          );
        case 'chart':
          return (
            <ChartBlock 
              initialContent={(block as ChartBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
            />
          );

        case 'styled':
          return (
            <StyledTextBlock
              block={block as StyledBlockType}
              onUpdate={updateBlockContent}
              onArrowPrev={moveFocusPrev}
              onArrowNext={moveFocusNext}
              onConvertToText={listToText}
            />
          );
        case 'code':
          return (
            <CodeBlock
              block={block as CodeBlockType}
              onUpdate={createContentChangeCallback(block.id)}
              onAddBelow={addTextAfter}
              onArrowPrev={moveFocusPrev}
              onArrowNext={moveFocusNext}
              onRemove={removeBlock}
            />
          );
        case 'latex':
          return (
            <LaTeXBlock
              initialContent={(block as LaTeXBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
            />
          );
        default:
          return null;
      }
    })();

    // Disable dragging for viewer/read-only AND for the last empty TextBlock placeholder
    const isLastBlock = index === blocks.length - 1;
    const isEmptyTextBlockPlaceholder =
      isLastBlock &&
      block.type === 'text' &&
      (block as TextBlockType).content.trim() === '';

    // Check if dragging is disabled (for viewer role, read-only mode, or placeholder)
    const isDragDisabled =
      !isEditMode || userRole === 'viewer' || userRole === null || isEmptyTextBlockPlaceholder;

    return (
      <div key={block.id}>
        <DropZone index={index} onDrop={moveBlock} isDragging={isDragging} />
        <DraggableBlock
          block={block}
          index={index}
          onMove={moveBlock}
          isDragDisabled={isDragDisabled}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div data-block-index={index}>
        <BlockWrapper
          blockId={block.id}
          blockType={block.type}
          onConvertBlock={convertBlock}
          onConvertStyled={convertStyled}
          onRemoveBlock={removeBlock}
          comments={blockComments[block.id] || []}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
        >
          {blockContent}
        </BlockWrapper>
          </div>
        </DraggableBlock>
        {/* Last drop zone after the last block */}
        {index === blocks.length - 1 && (
          <DropZone index={index + 1} onDrop={moveBlock} isDragging={isDragging} />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DndProvider backend={HTML5Backend}>
        <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
          <article className="w-full max-w-3xl px-4 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="text" width="60%" height={40} />
              <div className="flex items-center gap-2">
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </div>
            </div>
            <Box className="space-y-3">
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="90%" height={60} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="95%" height={60} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="85%" height={60} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
            </Box>
          </article>
        </main>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className={`flex-1 flex flex-col items-center overflow-y-auto py-10 transition-colors duration-200 ${
        isDragging ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
      }`}>
        <article className={`w-full max-w-3xl px-4 space-y-1 transition-all duration-200 ${
          isDragging ? 'ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg p-6' : ''
        }`} id="editor-content">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <TitleInput onSave={handleTitleSave} initialValue={title} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {hasUnsavedChanges && (
                  <span className="text-orange-500">Unsaved changes</span>
                )}
                
                {/* Role indicator */}
                {userRole && (
                  <span className={`px-2 py-1 text-xs rounded ${
                    userRole === 'owner' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    userRole === 'editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {userRole}
                  </span>
                )}
                
                {isEditMode && userRole && (userRole === 'owner' || userRole === 'editor') && (
                  <button
                    onClick={() => saveNote(true)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!hasUnsavedChanges}
                  >
                    Save (⌘S)
                  </button>
                )}
                
                {/* Viewer mode or not authenticated */}
                {(!isEditMode || userRole === 'viewer' || !userRole) && (
                  <span className="text-gray-400 text-xs">
                    {userRole === 'viewer' ? 'View-only mode' : 'Read-only mode'}
                  </span>
                )}
              </div>
            </div>
            {blocks.map((b, idx) => renderBlock(b, idx))}
          </article>
        </main>
        

    </DndProvider>
  );
};

export default Editor; 