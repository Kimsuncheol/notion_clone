import React, { useRef, useEffect, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { FavoriteNote } from '@/types/firebase';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SkeletonForFavoritesList from './skeletonUI/skeletonForFavoritesList';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import { useOffsetStore } from '@/store/offsetStore';
import { getPositionById } from '../utils/offsetUtils';

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
  const { 
    // showMoreOptionsSidebarForFavorites, 
    // showAddaSubNoteSidebarForFavorites, 
    // resetShowMoreOptionsSidebarForFavorites,
    // resetShowAddaSubNoteSidebarForFavorites,
    toggleShowMoreOptionsAddaSubNoteSidebar,
  } = useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore();
  const { setOffset } = useOffsetStore();

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
            <div
              key={favorite.id}
              className={`group relative px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === favorite.noteId ? 'bg-black/10 dark:bg-white/10' : ''}`}
              id={favorite.noteId + 'page'}
              onMouseEnter={() => setOnHoveredPageId(favorite.noteId)}
              onMouseLeave={() => setOnHoveredPageId(null)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onPageClick(favorite.noteId)}>
                {onHoveredPageId === favorite.noteId ? (
                  <ArrowForwardIosIcon style={{ fontSize: '12px' }} />
                ) : (
                  <TextSnippetIcon style={{ fontSize: '12px' }} />
                )}
                <span className="truncate">{favorite.noteTitle}</span>
              </div>
              {onHoveredPageId === favorite.noteId && (
                <div className="flex items-center gap-1">
                  <MoreHorizIcon style={{ fontSize: '12px' }} onClick={() => {
                    const offset = getPositionById(favorite.noteId + 'page');
                    console.log('offsetY: ', offset.y);
                    setOffset(offset.x, offset.y);
                    toggleShowMoreOptionsAddaSubNoteSidebar(favorite.noteId, null, null, null);
                  }} />
                  <AddIcon style={{ fontSize: '12px' }} onClick={() => {
                    const offset = getPositionById(favorite.noteId + 'page');
                    console.log('offsetY: ', offset.y);
                    setOffset(offset.x, offset.y);
                    toggleShowMoreOptionsAddaSubNoteSidebar(null, favorite.noteId, null, null);
                  }} />
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