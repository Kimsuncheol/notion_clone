"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchNoteContent } from '@/services/firebase';
import type { FirebaseSubNoteContent } from '@/types/firebase';
import HoveringPreviewForSubNoteList from './subComponents/HoveringPreviewForSubNoteList';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface SubNoteListProps {
  pageId: string;
}

export default function SubNoteList({ pageId }: SubNoteListProps) {
  const router = useRouter();
  const [subNotes, setSubNotes] = useState<FirebaseSubNoteContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredSubNoteItem, setHoveredSubNoteItem] = useState<string | null>(null);
  // const IconStyle = { fontSize: '16px', color: '#99a1af' };

  const load = useCallback(async () => {
    if (!pageId) return;
    try {
      setIsLoading(true);
      const noteWithSubs = await fetchNoteContent(pageId);
      const list = noteWithSubs?.subNotes || [];
      setSubNotes(list);
    } catch (err) {
      console.error('Failed to load sub-notes:', err);
      setSubNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when global event notifies sub-notes changed
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ parentIds?: string[] }>;
      const affected = ev.detail?.parentIds || [];
      if (affected.includes(pageId)) {
        load();
      }
    };
    window.addEventListener('subnotes-changed', handler as EventListener);
    return () => window.removeEventListener('subnotes-changed', handler as EventListener);
  }, [pageId, load]);

  const sortedSubNotes = useMemo(() => {
    return [...subNotes].sort((a, b) => {
      const aTime = (a.updatedAt || a.createdAt)?.getTime?.() || 0;
      const bTime = (b.updatedAt || b.createdAt)?.getTime?.() || 0;
      return bTime - aTime; // newest first
    });
  }, [subNotes]);

  const handleOpen = (subNoteId: string) => {
    router.push(`/note/${pageId}/subnote/${subNoteId}`);
  };

  return (
    <div className="mt-6 p-4 w-1/2">
      {isLoading ? (
        <div className="text-xs text-gray-500">Loading sub-notes...</div>
      ) : sortedSubNotes.length === 0 ? (
        <div className="text-xs text-gray-500">No sub-notes yet.</div>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10 rounded-md overflow-visible border border-black/10 dark:border-white/10">
          {sortedSubNotes.map((sn) => (
            <li
              key={sn.id}
              className="px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between relative group"
              onClick={() => handleOpen(sn.id)}
              onMouseEnter={() => setHoveredSubNoteItem(sn.id)}
              onMouseLeave={() => setHoveredSubNoteItem(null)}
            >
              <div className='flex gap-2'>
                {hoveredSubNoteItem === sn.id ? <ArrowForwardIosIcon sx={{ fontSize: '14px', color: '#99a1af' }} /> : <TextSnippetIcon sx={{ fontSize: '16px', color: '#99a1af' }} />}
                <div className="flex flex-col">
                  <span className="text-sm text-[color:var(--foreground)] truncate max-w-[40ch]">
                    {sn.title?.trim() ? sn.title : 'Untitled'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {(sn.updatedAt || sn.createdAt)?.toLocaleDateString?.() || ''}
                  </span>
                </div>
              </div>
              {/* {hoveredSubNoteItem === sn.id && ( */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[500ms] absolute top-0 left-1/4 -translate-x-1/2 z-50">
                <HoveringPreviewForSubNoteList
                  title={sn.title?.trim() ? sn.title : 'Untitled'}
                  content={(sn.content || '').toString()}
                  handleOpen={handleOpen}
                  subNoteId={sn.id}
                />
              </div>
              {/* )} */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
