import React from 'react';
import { fetchSeriesByName } from '@/services/series/firebase';
import { notFound } from 'next/navigation';
import SeriesDetailView from '@/components/series/SeriesDetailView';
import { MySeries } from '@/types/firebase';
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail';

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
    // trashedAt: series.trashedAt? new Date(series.trashedAt) : new Date(),
    // subNotes: Array.isArray(series.subNotes) 
      // ? series.subNotes.map(subNote => ({
          // ...subNote,
          // createdAt: subNote.createdAt ? new Date(subNote.createdAt) : new Date(),
        //   updatedAt: subNote.updatedAt ? new Date(subNote.updatedAt) : new Date(),
        // }))
      // : [],
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

  // Serialize the data for client component
  const series = serializeSeries(rawSeries);

  return <SeriesDetailView series={series} userEmail={userEmail} />;
}
