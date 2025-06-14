'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import TitleInput from './TitleInput';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Block, BlockType } from '@/types/blocks';
import type { StyledTextBlock as StyledBlockType, ListBlock as ListBlockType, OrderedListBlock as OrderedListBlockType, TableBlock as TableBlockType, ImageBlock as ImageBlockType, ChartBlock as ChartBlockType, PdfBlock as PdfBlockType } from '@/types/blocks';
import { fetchNoteContent, updateNoteContent } from '@/services/firebase';
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
  PdfBlock,
} from './blocks';
import BlockWrapper from './BlockWrapper';
import { Comment } from '@/types/comments';

// Simple id generator to avoid external dependency
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

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
      rows: 5,
      cols: 5
    } 
  };
}

function createImageBlock(): ImageBlockType {
  return { id: generateId(), type: 'image', content: { src: null } };
}

function createChartBlock(): ChartBlockType {
  return { id: generateId(), type: 'chart', content: { chartType: 'bar' } };
}

function createPdfBlock(): PdfBlockType {
  return { id: generateId(), type: 'pdf', content: { src: null } };
}

interface Props { 
  pageId: string;
  onSaveTitle: (title: string) => void; 
}



const Editor: React.FC<Props> = ({ pageId, onSaveTitle }) => {
  const [blocks, setBlocks] = useState<Block[]>([createTextBlock()]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [blockComments, setBlockComments] = useState<Record<string, Comment[]>>({});
  const auth = getAuth(firebaseApp);
  const titleRef = useRef<string>('');
  const blocksRef = useRef<Block[]>([]);

  // Update refs when state changes
  useEffect(() => {
    titleRef.current = title;
    blocksRef.current = blocks;
  }, [title, blocks]);

  // Load note content when pageId changes
  useEffect(() => {
    const loadNoteContent = async () => {
      if (!pageId || !auth.currentUser) return;

      setIsLoading(true);
      try {
        const noteContent = await fetchNoteContent(pageId);
        if (noteContent) {
          setTitle(noteContent.title);
          setBlocks(noteContent.blocks.length > 0 ? noteContent.blocks : [createTextBlock()]);
        } else {
          // New page - start with empty content
          setTitle('');
          setBlocks([createTextBlock()]);
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
  }, [pageId, auth.currentUser]);

  // Save function
  const saveNote = useCallback(async (showToast = true) => {
    if (!pageId || !auth.currentUser) return;

    try {
      await updateNoteContent(pageId, titleRef.current, blocksRef.current);
      setHasUnsavedChanges(false);
      if (showToast) {
        toast.success('Note saved');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      if (showToast) {
        toast.error('Failed to save note');
      }
    }
  }, [pageId, auth.currentUser]);

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
        saveNote(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveNote]);

  // Helper to find block index by id
  const findIndexById = (id: string) => blocks.findIndex((b) => b.id === id);

  const focusBlock = useCallback((index: number, selector: string = 'input') => {
    if (index < 0 || index >= blocks.length) return;
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-index="${index}"] ${selector}`);
      el?.focus();
    }, 0);
  }, [blocks]);

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
    const targetBlock = blocks[idx - 1];
    const targetIndex = idx - 1;
    
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
    } else {
      // Text or styled block
      focusBlock(targetIndex);
    }
  }, [blocks, focusBlock]);

  const moveFocusNext = useCallback((id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => {
    const idx = findIndexById(id);
    if (idx >= blocks.length - 1) return;
    
    const currentBlock = blocks[idx];
    const targetBlock = blocks[idx + 1];
    const targetIndex = idx + 1;
    
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

  const convertBlock = useCallback((id: string, component: BlockType) => {
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
          newBlock = createChartBlock();
          break;
        case 'pdf':
          newBlock = createPdfBlock();
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
  }, [onSaveTitle]);

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
        case 'chart':
          return (
            <ChartBlock 
              initialContent={(block as ChartBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
            />
          );
        case 'image':
          return (
            <ImageBlock 
              initialContent={(block as ImageBlockType).content}
              onContentChange={createContentChangeCallback(block.id)}
            />
          );
        case 'pdf':
          return (
            <PdfBlock 
              initialContent={(block as PdfBlockType).content}
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
        default:
          return null;
      }
    })();

    return (
      <div key={block.id} data-block-index={index}>
        <BlockWrapper
          blockId={block.id}
          blockType={block.type}
          onConvertBlock={convertBlock}
          onConvertStyled={convertStyled}
          comments={blockComments[block.id] || []}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
        >
          {blockContent}
        </BlockWrapper>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DndProvider backend={HTML5Backend}>
        <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-10">
          <div className="text-gray-500">Loading note...</div>
        </main>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
        <article className="w-full max-w-3xl px-6 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <TitleInput onSave={handleTitleSave} initialValue={title} />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {hasUnsavedChanges && (
                <span className="text-orange-500">Unsaved changes</span>
              )}
              <button
                onClick={() => saveNote(true)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!hasUnsavedChanges}
              >
                Save (⌘S)
              </button>
            </div>
          </div>
          {blocks.map((b, idx) => renderBlock(b, idx))}
        </article>
      </main>
    </DndProvider>
  );
};

export default Editor; 