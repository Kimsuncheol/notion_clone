'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Canvas from './Canvas';
import { useAuth } from '@/contexts/AuthContext';
import {
  createHandwriting,
  deleteHandwriting,
  fetchHandwritingsForUser,
  updateHandwriting,
} from '@/services/handwriting/firebase';
import { HandwritingEntry } from '@/types/handwriting';

interface HandwritingProps {
  handwritingId?: string;
}

export default function Handwriting({ handwritingId }: HandwritingProps) {
  const router = useRouter();
  const params = useParams<{ userId?: string }>();
  const { currentUser, loading: isAuthLoading } = useAuth();

  const [handwritings, setHandwritings] = useState<HandwritingEntry[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedHandwritingId, setSelectedHandwritingId] = useState<string | null>(handwritingId ?? null);
  const [title, setTitle] = useState('');
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const baseHandwritingPath = useMemo(() => {
    if (params?.userId) {
      return `/${params.userId}/handwriting`;
    }
    return '/handwriting';
  }, [params?.userId]);

  const selectedHandwriting = useMemo(
    () => handwritings.find((entry) => entry.id === selectedHandwritingId) ?? null,
    [handwritings, selectedHandwritingId],
  );

  const initialCanvases = useMemo<(string | null)[]>(() => {
    if (selectedHandwriting?.canvases && selectedHandwriting.canvases.length > 0) {
      return selectedHandwriting.canvases;
    }

    return [null];
  }, [selectedHandwriting]);

  useEffect(() => {
    setSelectedHandwritingId(handwritingId ?? null);
  }, [handwritingId]);

  useEffect(() => {
    let cancelled = false;

    const loadHandwritings = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!currentUser) {
        setHandwritings([]);
        setIsListLoading(false);
        setHasAttemptedLoad(true);
        return;
      }

      setIsListLoading(true);
      try {
        const entries = await fetchHandwritingsForUser(currentUser.uid);
        if (!cancelled) {
          setHandwritings(entries);
        }
      } catch (error) {
        console.error('Failed to load handwriting canvases:', error);
        if (!cancelled) {
          toast.error('Could not load your handwriting canvases.');
          setHandwritings([]);
        }
      } finally {
        if (!cancelled) {
          setIsListLoading(false);
          setHasAttemptedLoad(true);
        }
      }
    };

    loadHandwritings();

    return () => {
      cancelled = true;
    };
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    if (selectedHandwriting) {
      setTitle(selectedHandwriting.title ?? '');
    } else if (!selectedHandwritingId) {
      setTitle('');
    }
  }, [selectedHandwriting, selectedHandwritingId]);

  useEffect(() => {
    if (!selectedHandwritingId && hasAttemptedLoad && !isListLoading && handwritings.length > 0 && handwritingId) {
      toast.error('The requested handwriting could not be found. Showing your latest canvas instead.');
      setSelectedHandwritingId(handwritings[0].id);
      router.replace(`${baseHandwritingPath}/${handwritings[0].id}`);
    }
  }, [
    baseHandwritingPath,
    handwritings,
    handwritingId,
    hasAttemptedLoad,
    isListLoading,
    router,
    selectedHandwritingId,
  ]);

  const refreshHandwritingInState = useCallback(
    (updatedEntry: HandwritingEntry) => {
      setHandwritings((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === updatedEntry.id);
        if (existingIndex === -1) {
          return [updatedEntry, ...prev];
        }

        const next = [...prev];
        next[existingIndex] = updatedEntry;
        return next.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      });
    },
    [],
  );

  const handleSave = useCallback(
    async (canvases: (string | null)[]) => {
      if (!currentUser) {
        toast.error('You need to sign in to save your handwriting.');
        return;
      }

      const trimmedTitle = title.trim() || 'Untitled canvas';

      setIsSaving(true);
      try {
        if (selectedHandwritingId) {
          const updated = await updateHandwriting(selectedHandwritingId, {
            title: trimmedTitle,
            canvases,
          });

          if (!updated) {
            toast.error('Handwriting entry no longer exists.');
            setHandwritings((prev) => prev.filter((entry) => entry.id !== selectedHandwritingId));
            setSelectedHandwritingId(null);
            router.replace(baseHandwritingPath);
            return;
          }

          refreshHandwritingInState(updated);
          toast.success('Handwriting updated.');
        } else {
          const created = await createHandwriting({
            userId: currentUser.uid,
            title: trimmedTitle,
            canvases,
          });

          refreshHandwritingInState(created);
          setSelectedHandwritingId(created.id);
          router.push(`${baseHandwritingPath}/${created.id}`);
          toast.success('Handwriting saved.');
        }
      } catch (error) {
        console.error('Failed to save handwriting:', error);
        toast.error('Unable to save handwriting. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [
      baseHandwritingPath,
      currentUser,
      refreshHandwritingInState,
      router,
      selectedHandwritingId,
      title,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedHandwritingId) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHandwriting(selectedHandwritingId);

      setHandwritings((prev) => prev.filter((entry) => entry.id !== selectedHandwritingId));
      toast.success('Handwriting deleted.');

      if (handwritings.length <= 1) {
        setSelectedHandwritingId(null);
        setTitle('');
        router.push(baseHandwritingPath);
      } else {
        const next = handwritings.find((entry) => entry.id !== selectedHandwritingId);
        if (next) {
          setSelectedHandwritingId(next.id);
          router.push(`${baseHandwritingPath}/${next.id}`);
        } else {
          setSelectedHandwritingId(null);
          router.push(baseHandwritingPath);
        }
      }
    } catch (error) {
      console.error('Failed to delete handwriting:', error);
      toast.error('Unable to delete handwriting. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [
    baseHandwritingPath,
    handwritings,
    router,
    selectedHandwritingId,
  ]);

  if (isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your workspace…</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Sign in to access handwriting canvases
        </h2>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          Handwriting canvases are tied to your account. Create an account or sign in to save, revisit, and manage your sketches.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 md:p-10 backdrop-blur">
      <Canvas
        handwritingId={selectedHandwritingId ?? undefined}
        initialCanvases={initialCanvases}
        onSave={handleSave}
        onDelete={selectedHandwritingId ? handleDelete : undefined}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />
    </div>
  );
}
