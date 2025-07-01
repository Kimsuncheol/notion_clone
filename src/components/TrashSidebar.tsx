import React, { useState, useEffect } from 'react';
import { PageNode } from '@/store/slices/sidebarSlice';
import { permanentlyDeleteNote, restoreFromTrash } from '@/services/firebase';
import toast from 'react-hot-toast';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

interface TrashSidebarProps {
  open: boolean;
  onClose: () => void;
  onSelectPage: (id: string) => void;
  trashFolder: { pages: PageNode[] } | undefined;
  selectedPageId: string;
  onRefreshData: () => void;
}

const TrashSidebar: React.FC<TrashSidebarProps> = ({
  open,
  onClose,
  onSelectPage,
  trashFolder,
  selectedPageId,
  onRefreshData,
}) => {
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'delete' | 'restore' | null>(null);

  const handleTrashOperation = async (operation: 'delete' | 'restore') => {
    if (selectionMode === operation) {
      // Execute the operation
      if (selectedNotes.size === 0) {
        toast.error('No notes selected');
        return;
      }

      try {
        if (operation === 'delete') {
          await Promise.all(Array.from(selectedNotes).map(id => permanentlyDeleteNote(id)));
          toast.success(`${selectedNotes.size} note(s) permanently deleted`);
        } else {
          await Promise.all(Array.from(selectedNotes).map(id => restoreFromTrash(id)));
          toast.success(`${selectedNotes.size} note(s) restored`);
        }
        
        onRefreshData();
        setSelectedNotes(new Set());
        setSelectionMode(null);

      } catch (error) {
        console.error(`Error ${operation}ing notes:`, error);
        toast.error(`Failed to ${operation} notes`);
      }
    } else {
      // Enter selection mode
      setSelectionMode(operation);
      setSelectedNotes(new Set());
    }
  };
  
  // Close trash sidebar on outside click or ESC
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.trash-sidebar-content') && !target.closest('#bottom-section1')) {
        onClose();
        setSelectionMode(null);
        setSelectedNotes(new Set());
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        setSelectionMode(null);
        setSelectedNotes(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);


  if (!open) return null;

  return (
    <div className={`w-[480px] h-[480px] p-4 rounded-lg fixed left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm trash-sidebar-content`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <DeleteOutlineIcon fontSize="small" className="text-red-400" />
          <h3 className="font-semibold">Trash</h3>
          <span className="text-xs text-gray-400">({trashFolder?.pages.length || 0})</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          title="Close trash sidebar"
        >
          ✕
        </button>
      </div>

      {/* Trash Actions */}
      <div className="mb-4">
        {selectionMode && (
          <div className="mb-2 text-xs text-gray-400">
            {selectedNotes.size} note(s) selected. Click the button again to {selectionMode}.
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleTrashOperation('restore')}
            className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${selectionMode === 'restore' ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
          >
            <RestoreIcon fontSize="inherit" />
            <span>{selectionMode === 'restore' ? `Restore ${selectedNotes.size}` : 'Restore'}</span>
          </button>

          <button
            onClick={() => handleTrashOperation('delete')}
            className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${selectionMode === 'delete' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'
              } text-white`}
          >
            <DeleteOutlineIcon fontSize="inherit" />
            <span>{selectionMode === 'delete' ? `Delete ${selectedNotes.size}` : 'Delete'}</span>
          </button>

          {selectionMode && (
            <button
              onClick={() => {
                setSelectionMode(null);
                setSelectedNotes(new Set());
              }}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Trash Content */}
      <div className="flex-1 overflow-y-auto max-h-80">
        {!trashFolder || trashFolder.pages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <DeleteOutlineIcon fontSize="large" className="mb-2" />
            <p>Trash is empty</p>
          </div>
        ) : (
          <div className="space-y-1">
            {trashFolder.pages.map((page) => (
              <div
                key={page.id}
                className={`group px-2 py-2 rounded cursor-pointer hover:bg-gray-800 flex items-center justify-between ${selectedPageId === page.id ? 'bg-gray-800' : ''
                  }`}
                onClick={() => {
                  if (selectionMode) {
                    // Toggle selection in trash mode
                    const newSelected = new Set(selectedNotes);
                    if (newSelected.has(page.id)) {
                      newSelected.delete(page.id);
                    } else {
                      newSelected.add(page.id);
                    }
                    setSelectedNotes(newSelected);
                  } else {
                    onSelectPage(page.id);
                  }
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedNotes.has(page.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedNotes);
                        if (newSelected.has(page.id)) {
                          newSelected.delete(page.id);
                        } else {
                          newSelected.add(page.id);
                        }
                        setSelectedNotes(newSelected);
                      }}
                      className="mr-1"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${page.name}`}
                    />
                  )}
                  <NoteAltIcon fontSize="small" className="text-gray-400" />
                  <span className="truncate text-sm">{page.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashSidebar; 