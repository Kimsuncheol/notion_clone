import React, { useState, useEffect } from 'react';
import { PageNode } from '@/store/slices/sidebarSlice';
import { permanentlyDeleteNote, restoreFromTrash } from '@/services/firebase';
import toast from 'react-hot-toast';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';

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
    <div className={`min-w-80 max-w-[480px] h-auto max-h-[60vh] p-3 rounded-lg fixed left-60 bottom-4 bg-gray-800 border border-gray-700 text-gray-200 shadow-2xl z-50 text-sm trash-sidebar-content flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <DeleteOutlineIcon fontSize="small" className="text-red-400" />
          <h3 className="font-semibold">Trash</h3>
          <span className="text-xs text-gray-400">({trashFolder?.pages.length || 0})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          title="Close trash sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Trash Actions */}
      {selectedNotes.size > 0 && (
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center justify-between bg-gray-900 p-2 rounded-md">
            <div className="flex items-center gap-2">
              <Checkbox
                size="small"
                checked={!!trashFolder && selectedNotes.size === trashFolder.pages.length && trashFolder.pages.length > 0}
                onChange={handleSelectAll}
                sx={{ padding: 0, color: '#ffffff', '&.Mui-checked': { color: 'primary.main' } }}
                aria-label="Select all notes"
              />
              <label className="text-xs text-gray-400 select-none">
                {selectedNotes.size} selected
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRestore}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <RestoreIcon fontSize="inherit" />
                <span>Restore</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <DeleteOutlineIcon fontSize="inherit" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash Content */}
      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        {!trashFolder || trashFolder.pages.length === 0 ? (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center h-full">
            <DeleteOutlineIcon sx={{ fontSize: 40 }} className="mb-3 text-gray-600" />
            <p className="font-semibold text-gray-400">Trash is empty</p>
            <p className="text-xs mt-1">Deleted notes will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {trashFolder.pages.map((page) => (
              <div
                key={page.id}
                className={`group p-1.5 rounded-md cursor-pointer hover:bg-gray-700/70 flex items-center justify-between transition-colors ${selectedNotes.has(page.id) ? 'bg-blue-900/40' : ''
                  }`}
                onClick={() => handleToggleSelection(page.id)}
              >
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Checkbox
                    size="small"
                    checked={selectedNotes.has(page.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSelection(page.id);
                    }}
                    aria-label={`Select ${page.name}`}
                    sx={{ padding: '4px', marginRight: '4px' }}
                  />
                  <NoteAltIcon fontSize="small" className="text-gray-500 group-hover:text-gray-300" />
                  <span className="truncate text-sm font-medium text-gray-300 group-hover:text-white">
                    {page.name}
                  </span>
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