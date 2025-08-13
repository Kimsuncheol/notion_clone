"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { templates, categories } from '@/data/templates';
import type { Template } from '@/types/templates';
import { addNotePage, updateNoteContent, fetchFolders } from '@/services/firebase';
import toast from 'react-hot-toast';
import { modalBgColor } from '@/constants/color';

interface FormTemplateModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'page' | 'subnote';
  onApplied?: () => void;
}

const FormTemplateModal: React.FC<FormTemplateModalProps> = ({ open, onClose, mode = 'page', onApplied }) => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const modalRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    // Reset view when reopening modal
    setSelectedCategory('all');
    setSelectedTemplate(null);
    setTempTitle('');
  }, [open]);

  const filteredTemplates = useMemo(() => {
    return selectedCategory === 'all' ? templates : templates.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setTempTitle(template.name);
  };

  const handleCreateNote = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    if (mode !== 'subnote' && !tempTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsCreating(true);
    try {
      if (mode === 'subnote') {
        // Apply template to current sub-note editor (live in store)
        const { setContent } = await import('@/store/AddaSubNoteSidebarStore').then(m => m.useAddaSubNoteSidebarStore.getState());
        setContent(selectedTemplate.content);
        toast.success('Template applied to sub-note');
        onClose();
        onApplied?.();
      } else {
        // Create a new page note from template
        const folders = await fetchFolders();
        const privateFolder = folders.find(f => f.folderType === 'private');
        if (!privateFolder) {
          toast.error('Private folder not found');
          return;
        }

        const pageId = await addNotePage(privateFolder.id, tempTitle);

        await updateNoteContent(
          pageId,
          tempTitle,
          tempTitle,
          selectedTemplate.content,
          '',
          false,
          false,
          undefined
        );

        toast.success('Note created from template!');
        onClose();
        router.push(`/note/${pageId}`);
      }
    } catch (error) {
      console.error('Error creating note from template:', error);
      toast.error('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div ref={modalRef} className="relative w-full max-w-3xl mx-4 text-[color: var(--foreground)] rounded-lg shadow-xl border border-black/10 dark:border-white/10" style={{ backgroundColor: modalBgColor }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
          <h2 className="text-base font-semibold">Create from template</h2>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* Left: Categories and Template list */}
          <div className="col-span-5 border-r border-black/10 dark:border-white/10 p-3">
            <div className="flex gap-2 flex-wrap mb-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-2 py-1 rounded ${selectedCategory === c.id ? 'bg-black/20 dark:bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}
                  title={`${c.name} (${c.count})`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="max-h-96 overflow-auto pr-1 space-y-1">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className={`w-full text-left px-2 py-2 rounded hover:bg-black/10 dark:hover:bg-white/10 ${selectedTemplate?.id === t.id ? 'bg-black/10 dark:bg-white/10' : ''}`}
                  title={t.description}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Preview and create */}
          <div className="col-span-7 p-4">
            {selectedTemplate ? (
              <div className="flex flex-col gap-3">
                <input
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/10 outline-none"
                  placeholder="Title"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                />
                <div className="border border-black/10 dark:border-white/10 rounded p-3 h-64 overflow-auto text-sm whitespace-pre-wrap">
                  {selectedTemplate.content}
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-sm px-3 py-1 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    Back
                  </button>
                  <button
                    disabled={isCreating}
                    onClick={handleCreateNote}
                    className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    title={mode === 'subnote' ? 'Apply template to sub-note' : 'Create note from template'}
                  >
                    {isCreating ? (mode === 'subnote' ? 'Applying…' : 'Creating…') : (mode === 'subnote' ? 'Apply to sub-note' : 'Create note')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Select a template to preview and create a note
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormTemplateModal;


