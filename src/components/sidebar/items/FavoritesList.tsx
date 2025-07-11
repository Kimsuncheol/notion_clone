import React, { useRef, useEffect } from 'react';
import { Skeleton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { FavoriteNote } from '@/services/firebase';

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

  useEffect(() => {
    if (favoritesListRef.current) {
      const height = favoritesListRef.current.offsetHeight;
      console.log(`FavoritesList height: ${height}px`);
    }
  }, [favoriteNotes, isLoadingFavorites]);

  if (isLoadingFavorites) {
    return (
      <div className="mb-4">
        <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
        <div className="ml-4 flex flex-col gap-1 mt-1">
          <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4" ref={favoritesListRef}>
      <div className="flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold">
        <span>
          <StarIcon className="text-yellow-500 text-sm" style={{ fontSize: '16px' }} /> Your Favorites
          <span className="ml-1 text-xs text-gray-400">({favoriteNotes.length})</span>
        </span>
      </div>
      <div className="ml-4 mt-1 flex flex-col gap-1">
        {favoriteNotes.length > 0 ? (
          favoriteNotes.map((favorite) => (
            <div
              key={favorite.id}
              className={`group px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === favorite.noteId ? 'bg-black/10 dark:bg-white/10' : ''
                }`}
              onClick={() => onPageClick(favorite.noteId)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <StarIcon className="text-yellow-500 text-sm" style={{ fontSize: '14px' }} />
                <span className="truncate">{favorite.noteTitle}</span>
              </div>
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