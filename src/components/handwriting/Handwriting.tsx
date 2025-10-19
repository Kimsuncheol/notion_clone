'use client';

import React from 'react';
import Canvas from './Canvas';

interface HandwritingProps {
  handwritingId?: string;
}

export default function Handwriting({ handwritingId }: HandwritingProps) {
  const hasSelectedHandwriting = Boolean(handwritingId);
  const headline = hasSelectedHandwriting ? 'Handwriting Preview' : 'Start a Handwriting Canvas';
  const subheadline = hasSelectedHandwriting
    ? 'Review the latest strokes, export the drawing, or keep iterating with your stylus.'
    : 'Open a blank canvas to sketch, annotate, or leave handwritten feedback.';

  return (
    <div className="flex h-full w-full flex-col p-10 backdrop-blur">
      <section className="w-full h-full">
        <Canvas handwritingId={handwritingId} />
      </section>
    </div>
  );
}
