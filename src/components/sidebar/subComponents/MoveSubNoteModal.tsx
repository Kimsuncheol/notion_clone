"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchNotesList, moveSubNoteToParent } from '@/services/firebase';
import type { FirebaseNoteForSubNote } from '@/types/firebase';
import toast from 'react-hot-toast';
import { modalBgColor } from '@/constants/bgColorConstants';

interface MoveSubNoteModalProps {
  open: boolean;
  parentId: string;
  subNoteId: string;
  onClose: () => void;
}

const tokenize = (text: string): string[] => {
  const t = (text || '').toLowerCase().trim();
  const grams: string[] = [];
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= t.length; i++) {
      grams.push(t.slice(i, i + n));
    }
  }
  return grams;
};

const score = (query: string, candidate: string): number => {
  if (!query) return 0;
  const qGrams = new Set(tokenize(query));
  const cGrams = new Set(tokenize(candidate));
  let matches = 0;
  qGrams.forEach(g => { if (cGrams.has(g)) matches++; });
  return matches;
};

const MoveSubNoteModal: React.FC<MoveSubNoteModalProps> = ({ open, parentId, subNoteId, onClose }) => {
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<FirebaseNoteForSubNote[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const list = await fetchNotesList(50);
        setNotes(list.filter(n => n.id !== parentId));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [open, parentId]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, onClose]);

  const results = useMemo(() => {
    return [...notes]
      .map(n => ({ n, s: score(search, n.title) }))
      .filter(x => x.s > 0 || !search)
      .sort((a, b) => b.s - a.s)
      .map(x => x.n)
      .slice(0, 20);
  }, [notes, search]);

  const onSelect = async (newParentId: string) => {
    try {
      await moveSubNoteToParent(parentId, subNoteId, newParentId);
      toast.success('Sub-note moved');
      window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: [parentId, newParentId] } }));
      onClose();
    } catch (e) {
      toast.error('Failed to move sub-note');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center" >
      <div className="absolute inset-0 bg-black/50" />
      <div ref={containerRef} className="relative w-full max-w-lg rounded-md shadow-xl p-4 mx-4" style={{ backgroundColor: modalBgColor }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Move sub-note to...</h3>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20">Close</button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-3 py-2 rounded border border-black/20 dark:border-white/20 bg-transparent outline-none mb-3"
        />
        <div className="max-h-72 overflow-y-auto divide-y divide-black/10 dark:divide-white/10">
          {results.map(n => (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              className="w-full text-left px-3 py-2 hover:bg-black/10 dark:hover:bg-white/10"
              title={n.title}
            >
              {n.title}
            </button>
          ))}
          {results.length === 0 && (
            <div className="text-sm text-gray-500 px-3 py-6">No results</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoveSubNoteModal;


