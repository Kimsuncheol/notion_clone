// hooks/useFavoriteStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { isNoteFavorite, addToFavorites, removeFromFavorites, realTimeFavoriteStatus } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';

export const useFavoriteStatus = (noteId: string) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(firebaseApp);

  // Load favorite status
  const loadFavoriteStatus = useCallback(async () => {
    if (!noteId || !auth.currentUser) return;
    
    try {
      const favoriteStatus = await isNoteFavorite(noteId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  }, [noteId, auth.currentUser]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!noteId || !auth.currentUser) return;
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(noteId);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(noteId);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update favorites';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, isFavorite, auth.currentUser]);

  // Load favorite status on mount and when noteId changes
  useEffect(() => {
    loadFavoriteStatus();
  }, [loadFavoriteStatus]);

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
    refreshFavoriteStatus: loadFavoriteStatus
  };
};