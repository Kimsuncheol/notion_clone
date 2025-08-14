import React, { useState, useEffect } from 'react';
import { NoteNode } from '@/store/slices/sidebarSlice';
import { permanentlyDeleteNote, restoreFromTrash, fetchTrashedSubNotes, permanentlyDeleteSubNote } from '@/services/firebase';
import { TrashedSubNote } from '@/types/firebase';
import toast from 'react-hot-toast';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import { useTrashSidebarStore } from '@/store/TrashsidebarStore';
import Chip from '@mui/material/Chip';

interface TrashSidebarProps {
  open: boolean;
  onClose: () => void;
  trashFolder: { notes: NoteNode[] } | undefined;
  onRefreshData: () => void;
}

const TrashSidebar: React.FC<TrashSidebarProps> = ({
  open,
  onClose,
  trashFolder,
  onRefreshData,
}) => {
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [trashedSubNotes, setTrashedSubNotes] = useState<TrashedSubNote[]>([]);
  const [selectedSubNotes, setSelectedSubNotes] = useState<Set<string>>(new Set()); // key format: parentId:subNoteId
  const { count, setCount } = useTrashSidebarStore();
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  // 개선된 Chip 스타일 함수
  const getChipStyle = (chipType: string) => ({
    backgroundColor: selectedChips.includes(chipType) ? '#2563eb' : '#6b7280', // blue-600 : gray-500
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '& .MuiChip-label': { 
      padding: '0px 12px' 
    },
    '&:hover': {
      backgroundColor: selectedChips.includes(chipType) ? '#1d4ed8' : '#374151', // blue-700 : gray-600
    }
  });

  // Chip 클릭 핸들러
  const handleChipClick = (chipType: string) => {
    setSelectedChips(prev => {
      if (prev.includes(chipType)) {
        // 이미 선택된 칩을 다시 클릭하면 제거
        return prev.filter(chip => chip !== chipType);
      } else {
        // 새로운 칩 추가
        return [...prev, chipType];
      }
    });
  };

  // 필터링된 데이터를 반환하는 함수
  const getFilteredNotes = () => {
    if (selectedChips.length === 0) {
      // 필터가 없으면 모든 항목 표시
      return {
        notes: trashFolder?.notes || [],
        subNotes: trashedSubNotes
      };
    }
    
    const showNotes = selectedChips.includes('note');
    const showSubNotes = selectedChips.includes('sub-note');
    
    return {
      notes: showNotes ? (trashFolder?.notes || []) : [],
      subNotes: showSubNotes ? trashedSubNotes : []
    };
  };

  // Select All 체크박스의 checked 상태 계산
  const getSelectAllCheckedState = () => {
    const { notes, subNotes } = getFilteredNotes();
    const totalFilteredItems = notes.length + subNotes.length;
    
    if (totalFilteredItems === 0) return false;
    
    const selectedFilteredNotes = notes.filter(note => selectedNotes.has(note.id)).length;
    const selectedFilteredSubNotes = subNotes.filter(sn => 
      selectedSubNotes.has(`${sn.parentId}:${sn.id}`)
    ).length;
    
    return (selectedFilteredNotes + selectedFilteredSubNotes) === totalFilteredItems;
  };

  const handleRestore = async () => {
    if (selectedNotes.size === 0 && selectedSubNotes.size === 0) {
      toast.error('No notes selected for restore');
      return;
    }
    try {
      const restoredParentIds: string[] = [];
      await Promise.all([
        ...Array.from(selectedNotes).map(id => restoreFromTrash(id)),
        ...Array.from(selectedSubNotes).map(key => {
          const [parentId, subId] = key.split(':');
          restoredParentIds.push(parentId);
          return restoreFromTrash(parentId, subId);
        })
      ]);
      toast.success(`${selectedNotes.size + selectedSubNotes.size} item(s) restored`);
      onRefreshData();
      setSelectedNotes(new Set());
      setSelectedSubNotes(new Set());
      // Refresh trashed sub-notes list
      const latest = await fetchTrashedSubNotes();
      setTrashedSubNotes(latest);
      // Notify other components to refresh sub-notes
      if (typeof window !== 'undefined') {
        const uniqueParents = Array.from(new Set(restoredParentIds));
        window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: uniqueParents } }));
      }
    } catch (error) {
      console.error('Error restoring notes:', error);
      toast.error('Failed to restore notes');
    }
  };

  const handleDelete = async () => {
    if (selectedNotes.size === 0 && selectedSubNotes.size === 0) {
      toast.error('No notes selected for deletion');
      return;
    }
    try {
      const affectedParentIds: string[] = [];
      await Promise.all([
        ...Array.from(selectedNotes).map(id => permanentlyDeleteNote(id)),
        ...Array.from(selectedSubNotes).map(key => {
          const [parentId, subId] = key.split(':');
          affectedParentIds.push(parentId);
          return permanentlyDeleteSubNote(parentId, subId);
        })
      ]);
      toast.success(`${selectedNotes.size + selectedSubNotes.size} item(s) permanently deleted`);
      onRefreshData();
      setSelectedNotes(new Set());
      setSelectedSubNotes(new Set());
      // Refresh trashed sub-notes list
      const latest = await fetchTrashedSubNotes();
      setTrashedSubNotes(latest);
      // Notify other components to refresh sub-notes
      if (typeof window !== 'undefined') {
        const uniqueParents = Array.from(new Set(affectedParentIds));
        window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: uniqueParents } }));
      }
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

  const handleToggleSubNoteSelection = (parentId: string, subNoteId: string) => {
    const key = `${parentId}:${subNoteId}`;
    const newSelected = new Set(selectedSubNotes);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedSubNotes(newSelected);
  };

  // 개선된 Select All 핸들러
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { notes, subNotes } = getFilteredNotes();
    
    if (e.target.checked) {
      const allPageIds = notes.map(p => p.id);
      const allSubNoteKeys = subNotes.map(sn => `${sn.parentId}:${sn.id}`);
      
      // 현재 선택된 항목들을 유지하면서 필터된 항목들 추가
      setSelectedNotes(prev => new Set([...prev, ...allPageIds]));
      setSelectedSubNotes(prev => new Set([...prev, ...allSubNoteKeys]));
    } else {
      const pageIdsToRemove = notes.map(p => p.id);
      const subNoteKeysToRemove = subNotes.map(sn => `${sn.parentId}:${sn.id}`);
      
      // 필터된 항목들만 선택 해제
      setSelectedNotes(prev => {
        const newSet = new Set(prev);
        pageIdsToRemove.forEach(id => newSet.delete(id));
        return newSet;
      });
      setSelectedSubNotes(prev => {
        const newSet = new Set(prev);
        subNoteKeysToRemove.forEach(key => newSet.delete(key));
        return newSet;
      });
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
        setSelectedSubNotes(new Set());
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        setSelectedNotes(new Set());
        setSelectedSubNotes(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  // Load trashed sub-notes when opening the sidebar
  useEffect(() => {
    const loadTrashedSubNotes = async () => {
      if (!open) return;
      try {
        const list = await fetchTrashedSubNotes();
        setTrashedSubNotes(list);
        setCount(list.length + (trashFolder?.notes.length || 0));
      } catch (e) {
        console.error('Failed to fetch trashed sub-notes', e);
      }
    };
    loadTrashedSubNotes();
  }, [open, setCount, trashFolder]);

  if (!open) return null;

  return (
    <div className={`min-w-80 max-w-[480px] h-auto max-h-[60vh] p-3 rounded-lg fixed left-60 bottom-4 bg-gray-800 border border-gray-700 text-gray-200 shadow-2xl z-50 text-sm trash-sidebar-content flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <DeleteOutlineIcon fontSize="small" className="text-red-400" />
          <h3 className="font-semibold">Trash</h3>
          <span className="text-xs text-gray-400">({count})</span>

          {/* 개선된 Chip 컴포넌트들 */}
          <Chip 
            label="Note" 
            sx={getChipStyle('note')} 
            onClick={() => handleChipClick('note')}
            variant={selectedChips.includes('note') ? 'filled' : 'outlined'}
          />
          <Chip 
            label="Sub-note" 
            sx={getChipStyle('sub-note')} 
            onClick={() => handleChipClick('sub-note')}
            variant={selectedChips.includes('sub-note') ? 'filled' : 'outlined'}
          />
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
      {(selectedNotes.size > 0 || selectedSubNotes.size > 0) && (
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center justify-between bg-gray-900 p-2 rounded-md">
            <div className="flex items-center gap-2">
              <Checkbox
                size="small"
                checked={getSelectAllCheckedState()}
                onChange={handleSelectAll}
                sx={{ padding: 0, color: '#ffffff', '&.Mui-checked': { color: 'primary.main' } }}
                aria-label="Select all notes"
              />
              <label className="text-xs text-gray-400 select-none">
                {selectedNotes.size + selectedSubNotes.size} selected
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
        {(() => {
          const { notes, subNotes } = getFilteredNotes();
          const hasNoItems = notes.length === 0 && subNotes.length === 0;
          
          if (!trashFolder || hasNoItems) {
            return (
              <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center h-full">
                <DeleteOutlineIcon sx={{ fontSize: 40 }} className="mb-3 text-gray-600" />
                <p className="font-semibold text-gray-400">
                  {selectedChips.length > 0 ? 
                    `No ${selectedChips.includes('note') ? 'notes' : ''}${selectedChips.includes('note') && selectedChips.includes('sub-note') ? ' or ' : ''}${selectedChips.includes('sub-note') ? 'sub-notes' : ''} in trash` : 
                    'Trash is empty'
                  }
                </p>
                <p className="text-xs mt-1">
                  {selectedChips.length > 0 ? 
                    `No deleted ${selectedChips.includes('note') ? 'notes' : ''}${selectedChips.includes('note') && selectedChips.includes('sub-note') ? ' or ' : ''}${selectedChips.includes('sub-note') ? 'sub-notes' : ''} found.` : 
                    'Deleted notes will appear here.'
                  }
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-1">
              {/* 필터링된 페이지 노트들 */}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`group p-1.5 rounded-md cursor-pointer hover:bg-gray-700/70 flex items-center justify-between transition-colors ${
                    selectedNotes.has(note.id) ? 'bg-blue-900/40' : ''
                  }`}
                  onClick={() => handleToggleSelection(note.id)}
                >
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <Checkbox
                      size="small"
                      checked={selectedNotes.has(note.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelection(note.id);
                      }}
                      aria-label={`Select ${note.name}`}
                      sx={{ padding: '4px', marginRight: '4px' }}
                    />
                    <NoteAltIcon fontSize="small" className="text-gray-500 group-hover:text-gray-300" />
                    <span className="truncate text-sm font-medium text-gray-300 group-hover:text-white">
                      {note.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* 필터링된 서브노트들 */}
              {subNotes.map((sn) => {
                const key = `${sn.parentId}:${sn.id}`;
                return (
                  <div
                    key={key}
                    className={`group p-1.5 rounded-md cursor-pointer hover:bg-gray-700/70 flex items-center justify-between transition-colors ${
                      selectedSubNotes.has(key) ? 'bg-blue-900/40' : ''
                    }`}
                    onClick={() => handleToggleSubNoteSelection(sn.parentId, sn.id)}
                  >
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <Checkbox
                        size="small"
                        checked={selectedSubNotes.has(key)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSubNoteSelection(sn.parentId, sn.id);
                        }}
                        aria-label={`Select sub-note ${sn.title}`}
                        sx={{ padding: '4px', marginRight: '4px' }}
                      />
                      <NoteAltIcon fontSize="small" className="text-gray-500 group-hover:text-gray-300" />
                      <span className="truncate text-sm font-medium text-gray-300 group-hover:text-white">
                        {sn.parentTitle ? `${sn.parentTitle} › ${sn.title}` : sn.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default TrashSidebar;