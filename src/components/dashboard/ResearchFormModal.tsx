import React, { useEffect, useRef } from 'react';
import CreateNoteForm from './CreateNoteForm';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ResearchFormModalProps {
  open: boolean;
  onClose: () => void;
  askText: string;
  onAskTextChange: (text: string) => void;
  isUserAuthenticated: boolean;
  selectedFiles: File[];
  onFilesSelect: (files: File[]) => void;
}

const ResearchFormModal: React.FC<ResearchFormModalProps> = ({
  open,
  onClose,
  askText,
  onAskTextChange,
  isUserAuthenticated,
  selectedFiles,
  onFilesSelect,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={modalRef}
        className="relative bg-[color:var(--background)] text-[color:var(--foreground)] rounded-lg shadow-xl w-full max-w-2xl mx-4 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Research</h2>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Close
          </button>
        </div>
        <DndProvider backend={HTML5Backend}>
          <CreateNoteForm
            askText={askText}
            onAskTextChange={onAskTextChange}
            isUserAuthenticated={isUserAuthenticated}
            onFilesSelect={onFilesSelect}
            selectedFiles={selectedFiles}
            hideModeSelector
          />
        </DndProvider>
      </div>
    </div>
  );
};

export default ResearchFormModal;


