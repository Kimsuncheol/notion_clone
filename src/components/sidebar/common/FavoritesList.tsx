import React, { useRef, useEffect, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { FavoriteNote, FirebaseSubNoteContent } from '@/types/firebase';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SkeletonForFavoritesList from './skeletonUI/skeletonForFavoritesList';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import { useOffsetStore } from '@/store/offsetStore';
import { getPositionById } from '../utils/offsetUtils';
import { useSidebarStore } from '@/store/sidebarStore';
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
  // const [loadingSubNotes, setLoadingSubNotes] = useState<Record<string, boolean>>({});
  const { toggleShowMoreOptionsAddaSubNoteSidebar } = useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore();
  const { setOffset } = useOffsetStore();
  const { setSelectedParentSubNoteId } = useAddaSubNoteSidebarStore();
  const { whereToOpenSubNote, setWhereToOpenSubNote } = useSidebarStore();
  const { setSelectedNoteId } = useAddaSubNoteSidebarStore();
  const dispatch = useAppDispatch();
  const auth = getAuth(firebaseApp);


  useEffect(() => {
    const loadSubNotesForFavoriteNotes = async () => {
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

  useEffect(() => {
    if (favoritesListRef.current) {
      const height = favoritesListRef.current.offsetHeight;
      console.log(`FavoritesList height: ${height}px`);
    }
  }, [favoriteNotes, isLoadingFavorites]);

  if (isLoadingFavorites) {
    return <SkeletonForFavoritesList />;
  }

  return (
    <div className="" ref={favoritesListRef}>
      <div className="flex items-center gap-1 px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-sm">
        <StarIcon className="text-yellow-500" style={{ fontSize: '16px' }} /> Favorites
      </div>
      <div className="ml-4 mt-1 flex flex-col gap-1">
        {favoriteNotes.length > 0 ? (
          favoriteNotes.map((favorite) => (
            <div className='flex flex-col gap-1' key={favorite.noteId}>
              <div
                className={`group relative px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === favorite.noteId ? 'bg-black/10 dark:bg-white/10' : ''}`}
                id={favorite.noteId + 'page'}
                onMouseEnter={() => setOnHoveredPageId(favorite.noteId)}
                onMouseLeave={() => setOnHoveredPageId(null)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onPageClick(favorite.noteId)}>
                  {onHoveredPageId === favorite.noteId ? (
                    <ArrowForwardIosIcon style={{ fontSize: '12px', transform: whereToOpenSubNote === favorite.noteId ? 'rotate(90deg)' : 'rotate(0deg)' }} onClick={(e) => {
                      e.stopPropagation();
                      setWhereToOpenSubNote(favorite.noteId + 'in favorites list');
                      console.log('whereToOpenSubNote in favorites list: ', whereToOpenSubNote);
                    }} />
                  ) : (
                    <TextSnippetIcon style={{ fontSize: '12px' }} />
                  )}
                  <span className="truncate">{favorite.noteTitle}</span>
                </div>
                {onHoveredPageId === favorite.noteId && (
                  <div className="flex items-center gap-1">
                    <MoreHorizIcon style={{ fontSize: '12px' }} onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const offset = getPositionById(favorite.noteId + 'page');
                      console.log('offsetY: ', offset.y);
                      setOffset(offset.x, offset.y);
                      toggleShowMoreOptionsAddaSubNoteSidebar(favorite.noteId, null, null, null);
                    }} />
                    <AddIcon style={{ fontSize: '12px' }} onClick={async (e) => {
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
                        setWhereToOpenSubNote(favorite.noteId + 'in favorites list');
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
              {whereToOpenSubNote === (favorite.noteId + 'in favorites list') && subNotesMap[favorite.noteId] && subNotesMap[favorite.noteId].length > 0 && (
                <div className='flex flex-col gap-1 ml-4 mt-1' id={favorite.noteId + 'subnotes in favorites list'}>
                  {subNotesMap[favorite.noteId].map((subNote) => (
                    <div
                      key={subNote.id}
                      className='px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer flex items-center justify-between'
                      id={subNote.id + 'subnote in favorites list'}
                      onMouseEnter={() => setOnHoveredSubNoteId(subNote.id)}
                      onMouseLeave={() => setOnHoveredSubNoteId(null)}
                    >
                      <div
                        className='flex items-center gap-2 cursor-pointer overflow-hidden'
                        onClick={() => {
                          toggleShowMoreOptionsAddaSubNoteSidebar(null, null, null, favorite.noteId);
                        }}
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <span className="truncate text-xs font-medium text-gray-300 group-hover:text-white">
                          {subNote.title || 'Untitled'}
                        </span>
                      </div>
                      {onHoveredSubNoteId === subNote.id && (
                        <div className="flex items-center gap-1">
                          <MoreHorizIcon style={{ fontSize: '12px' }} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const offset = getPositionById(subNote.id + 'subnote in favorites list');
                            setOffset(offset.x, offset.y);
                            setSelectedParentSubNoteId(favorite.noteId, subNote.id);
                            toggleShowMoreOptionsAddaSubNoteSidebar(favorite.noteId, null, null, null);
                          }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="px-2 py-1 text-xs text-gray-500 italic">
            No favorites yet
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesList; 