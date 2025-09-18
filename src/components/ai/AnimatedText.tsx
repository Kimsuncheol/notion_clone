'use client';

import React, { useEffect, useRef, useState } from 'react';

type AnimatedTextProps = {
  text: string;
  isActive: boolean;
  intervalMs?: number;
  className?: string;
  onAnimationComplete?: () => void;
};

const MIN_INTERVAL_MS = 12;

export default function AnimatedText({
  text,
  isActive,
  intervalMs = 22,
  className,
  onAnimationComplete,
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text);
      return () => undefined;
    }

    if (!text) {
      setDisplayedText('');
      return () => undefined;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setDisplayedText('');
    let index = 0;

    timerRef.current = setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));

      if (index >= text.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onAnimationComplete?.();
      }
    }, Math.max(intervalMs, MIN_INTERVAL_MS));

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, text, intervalMs, onAnimationComplete]);

  return <span className={className}>{displayedText}</span>;
}
