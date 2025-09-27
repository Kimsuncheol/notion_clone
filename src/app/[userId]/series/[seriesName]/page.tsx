import React from 'react';
import { fetchSeriesByName } from '@/services/series/firebase';
import { notFound } from 'next/navigation';
import SeriesDetailView from '@/components/series/SeriesDetailView';
import { MySeries } from '@/types/firebase';
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail';
import { fetchNoteBySeries } from '@/services/markdown/firebase';

interface SeriesNamePageProps {
  params: Promise<{
    userId: string;
    seriesName: string;
  }>;
}

// Serialize the series data to ensure it's safe for client components
function serializeSeries(series: MySeries): MySeries {
  return {
    ...series,
    createdAt: series.createdAt ? new Date(series.createdAt) : new Date(),
    updatedAt: series.updatedAt ? new Date(series.updatedAt) : new Date(),
    subNotes: Array.isArray(series.subNotes)
      ? series.subNotes.map(subNote => ({
          ...subNote,
          createdAt: subNote?.createdAt ? new Date(subNote.createdAt) : undefined,
          updatedAt: subNote?.updatedAt ? new Date(subNote.updatedAt) : undefined,
        }))
      : undefined,
  };
}

export default async function SeriesNamePage({ params }: SeriesNamePageProps) {
  const { userId, seriesName } = await params;
  const userEmail = convertToNormalUserEmail(userId);
  
  // Fetch the specific series
  const rawSeries = await fetchSeriesByName(userEmail, seriesName);
  
  if (!rawSeries) {
    notFound();
  }

  const notes = await fetchNoteBySeries(userEmail, rawSeries, 'descending');

  const seriesWithNotes: MySeries = {
    ...rawSeries,
    subNotes: notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      thumbnailUrl: note.thumbnailUrl,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt ?? undefined,
    })),
  };

  // Serialize the data for client component
  const series = serializeSeries(seriesWithNotes);

  return <SeriesDetailView series={series} userEmail={userEmail} />;
}
