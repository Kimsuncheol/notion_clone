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
  trashFolder: { pages: PageNode[] } | undefined;
  onRefreshData: () => void;
}

const TrashSidebar: React.FC<TrashSidebarProps> = ({
  open,
  onClose,
  trashFolder,
  onRefreshData,
}) => {
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  const handleRestore = async () => {
    if (selectedNotes.size === 0) {
      toast.error('No notes selected for restore');
      return;
    }
    try {
      await Promise.all(Array.from(selectedNotes).map(id => restoreFromTrash(id)));
      toast.success(`${selectedNotes.size} note(s) restored`);
      onRefreshData();
      setSelectedNotes(new Set());
    } catch (error) {
      console.error('Error restoring notes:', error);
      toast.error('Failed to restore notes');
    }
  };

  const handleDelete = async () => {
    if (selectedNotes.size === 0) {
      toast.error('No notes selected for deletion');
      return;
    }
    try {
      await Promise.all(Array.from(selectedNotes).map(id => permanentlyDeleteNote(id)));
      toast.success(`${selectedNotes.size} note(s) permanently deleted`);
      onRefreshData();
      setSelectedNotes(new Set());
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast.error('Failed to delete notes');
    }
  };

  const handleToggleSelection = (pageId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allPageIds = trashFolder?.pages.map(p => p.id) || [];
      setSelectedNotes(new Set(allPageIds));
    } else {
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
        setSelectedNotes(new Set());
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
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
    <div className={`min-w-72 max-w-[480px] h-auto max-h-[60vh] p-4 rounded-lg fixed left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm trash-sidebar-content flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700 flex-shrink-0">
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
      {selectedNotes.size > 0 && (
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!trashFolder && selectedNotes.size === trashFolder.pages.length && trashFolder.pages.length > 0}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                aria-label="Select all notes"
              />
              <label className="text-xs text-gray-400 select-none">
                {selectedNotes.size} / {trashFolder?.pages.length || 0} selected
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRestore}
                className="flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RestoreIcon fontSize="inherit" />
                <span>Restore</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors bg-red-500 hover:bg-red-600 text-white"
              >
                <DeleteOutlineIcon fontSize="inherit" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash Content */}
      <div className="flex-1 overflow-y-auto pr-1">
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
                className={`group px-2 py-2 rounded cursor-pointer hover:bg-gray-800 flex items-center justify-between ${selectedNotes.has(page.id) ? 'bg-gray-700' : ''
                  }`}
                onClick={() => handleToggleSelection(page.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedNotes.has(page.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSelection(page.id);
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 mr-2"
                    aria-label={`Select ${page.name}`}
                  />
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