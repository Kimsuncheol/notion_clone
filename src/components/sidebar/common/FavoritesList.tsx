import React, { useRef, useEffect, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { FavoriteNote, FirebaseSubNoteContent } from '@/types/firebase';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SkeletonForFavoritesList from './skeletonUI/skeletonForFavoritesList';
import { useSidebarStore } from '@/store/sidebarStore';
import { useOffsetStore } from '@/store/offsetStore';
import { getPositionById } from '../utils/offsetUtils';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { fetchSubNotes, addSubNotePage } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
import { addSubNote as addSubNoteAction } from '@/store/slices/sidebarSlice';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

interface FavoritesListProps {
  favoriteNotes: FavoriteNote[];
  isLoadingFavorites: boolean;
  selectedPageId: string;
  onPageClick: (pageId: string) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteNotes,
  isLoadingFavorites,
  selectedPageId,
  onPageClick,
}) => {
  const favoritesListRef = useRef<HTMLDivElement | null>(null);
  const [onHoveredPageId, setOnHoveredPageId] = useState<string | null>(null);
  const [onHoveredSubNoteId, setOnHoveredSubNoteId] = useState<string | null>(null);
  const [subNotesMap, setSubNotesMap] = useState<Record<string, FirebaseSubNoteContent[]>>({});
  const { setOffset } = useOffsetStore();
  const { setSelectedParentSubNoteId, setSelectedSubNoteId, setSelectedNoteId } = useAddaSubNoteSidebarStore();
  const { whereToOpenSubNote, toggleShowMoreOptionsAddaSubNoteSidebar, setHasSubNotes } = useSidebarStore();
  const dispatch = useAppDispatch();
  const auth = getAuth(firebaseApp);


  useEffect(() => {
    const loadSubNotesForFavoriteNotes = async () => {
      if (!favoriteNotes || favoriteNotes.length === 0) return;
      
      for (const favorite of favoriteNotes) {
        console.log('favorite.noteId: ', favorite.noteId);
        // Only load if we haven't loaded them yet and are not currently loading
        if (!subNotesMap[favorite.noteId]) {
          // if (!subNotesMap[favorite.noteId] && !loadingSubNotes[favorite.noteId]) {
          // setLoadingSubNotes(prev => ({ ...prev, [favorite.noteId]: true }));

          try {
            const subNotes = await fetchSubNotes(favorite.noteId);
            setSubNotesMap(prev => ({ ...prev, [favorite.noteId]: subNotes as unknown as FirebaseSubNoteContent[] }));
          } catch (error) {
            console.error(`Error fetching sub-notes for note ${favorite.noteId}:`, error);
            setSubNotesMap(prev => ({ ...prev, [favorite.noteId]: [] }));
          } finally {
            // setLoadingSubNotes(prev => ({ ...prev, [favorite.noteId]: false }));
          }
        }
      }
    }

    loadSubNotesForFavoriteNotes();
  }, [favoriteNotes, subNotesMap]);

  // Listen for external sub-notes changes (trash/restore/delete) to refresh favorites view
  useEffect(() => {
    const handler = (e: CustomEvent<{ parentIds: string[] }>) => {
      const parentIds: string[] = e?.detail?.parentIds || [];
      parentIds.forEach(async (pid) => {
        try {
          const updated = await fetchSubNotes(pid);
          setSubNotesMap(prev => ({ ...prev, [pid]: updated as unknown as FirebaseSubNoteContent[] }));
        } catch (err) {
          console.error('Failed to refresh favorite sub-notes for', pid, err);
        }
      });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('subnotes-changed', handler as unknown as EventListener);
      return () => window.removeEventListener('subnotes-changed', handler as unknown as EventListener);
    }
  }, []);

  if (isLoadingFavorites) {
    return <SkeletonForFavoritesList />;
  }

  return (
    <div className="" ref={favoritesListRef}>
      <div className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-sm">
        <StarIcon className="text-yellow-500" sx={{ fontSize: '16px' }} /> Favorites
      </div>
      <div className="ml-4 mt-1 flex flex-col gap-[6px]">
        {favoriteNotes && favoriteNotes.length > 0 && (
          favoriteNotes.map((favorite) => {
            // Generate unique key for main note vs sub-note favorites
            const uniqueKey = favorite.subNoteId
              ? `subnote-${favorite.noteId}-${favorite.subNoteId}`
              : `note-${favorite.noteId}`;

            // If this is a sub-note favorite, render it as a sub-note item
            if (favorite.subNoteId) {
              return (
                <div
                  key={uniqueKey}
                  className='px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer flex items-center justify-between ml-4'
                  id={favorite.subNoteId + 'subnote-favorite'}
                  onMouseEnter={() => setOnHoveredSubNoteId(favorite.subNoteId || null)}
                  onMouseLeave={() => setOnHoveredSubNoteId(null)}
                >
                  <div
                    className='flex items-center gap-2 cursor-pointer overflow-hidden'
                    onClick={() => {
                      // Navigate to sub-note page
                      onPageClick(`${favorite.noteId}/subnote/${favorite.subNoteId}`);
                    }}
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="truncate text-xs font-medium">
                      {favorite.subNoteTitle || 'Untitled Sub-note'}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      in {favorite.noteTitle}
                    </span>
                  </div>
                  {onHoveredSubNoteId === favorite.subNoteId && (
                    <div className="flex items-center gap-1">
                      <MoreHorizIcon sx={{ fontSize: '12px' }} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const offset = getPositionById(favorite.subNoteId + 'subnote-favorite');
                        setOffset(offset.x, offset.y);
                        setSelectedParentSubNoteId(favorite.noteId, favorite.subNoteId!);
                        toggleShowMoreOptionsAddaSubNoteSidebar(favorite.noteId, null, null, null);
                      }} id='more-options-for-subnote' />
                    </div>
                  )}
                </div>
              );
            }

            // Otherwise render as a main note favorite
            return (
              <div className='flex flex-col gap-1' key={uniqueKey}>
                <div
                  className={`group relative px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === favorite.noteId ? 'bg-black/10 dark:bg-white/10' : ''}`}
                  id={favorite.noteId + 'page'}
                  onMouseEnter={() => setOnHoveredPageId(favorite.noteId)}
                  onMouseLeave={() => setOnHoveredPageId(null)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onPageClick(favorite.noteId)}>
                    <TextSnippetIcon sx={{ fontSize: '12px' }} />
                    <span className="truncate">{favorite.noteTitle}</span>
                  </div>
                  {onHoveredPageId === favorite.noteId && (
                    <div className="flex items-center gap-1">
                      <MoreHorizIcon sx={{ fontSize: '12px' }} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const offset = getPositionById(favorite.noteId + 'page');
                        console.log('offsetY: ', offset.y);
                        setOffset(offset.x, offset.y);
                        setSelectedSubNoteId(null);
                        toggleShowMoreOptionsAddaSubNoteSidebar(favorite.noteId, null, null, null);
                        setHasSubNotes(subNotesMap[favorite.noteId] && subNotesMap[favorite.noteId].length > 0);
                      }} id='more-options-for-note' />
                      <AddIcon sx={{ fontSize: '12px', transform: whereToOpenSubNote === favorite.noteId + ' in favorites list' ? 'rotate(90deg)' : 'rotate(0deg)' }} onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          const user = auth.currentUser;
                          if (!user) return;
                          const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
                          const created = await addSubNotePage(favorite.noteId, user.uid, authorName);
                          const isStringId = typeof created === 'string';
                          const newSubNormalized: FirebaseSubNoteContent = isStringId
                            ? {
                              id: created as string,
                              pageId: created as string,
                              parentId: favorite.noteId,
                              title: '',
                              content: '',
                              userId: user.uid,
                              authorName,
                              createdAt: new Date(),
                              updatedAt: null,
                            }
                            : (created as FirebaseSubNoteContent);
                          setSubNotesMap(prev => ({
                            ...prev,
                            [favorite.noteId]: [newSubNormalized, ...(prev[favorite.noteId] || [])]
                          }));
                          dispatch(addSubNoteAction({ noteId: favorite.noteId, subNote: { id: newSubNormalized.id, title: newSubNormalized.title, createdAt: newSubNormalized.createdAt, updatedAt: newSubNormalized.updatedAt || null } }));

                          // Open AddaSubNoteSidebar for this parent and focus the new sub-note
                          setSelectedNoteId(newSubNormalized.id);
                          toggleShowMoreOptionsAddaSubNoteSidebar(null, null, null, favorite.noteId);
                        } catch (e) {
                          console.error('Failed to add sub-note', e);
                        }
                      }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FavoritesList;