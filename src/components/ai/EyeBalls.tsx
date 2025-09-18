import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { blackColor1 } from '@/constants/color';

export default function EyeBalls() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const blinkTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const eyeSize = 24;
  const eyeSpacing = 10;
  const eyeBallSize = 8;

  const updateEyePosition = useCallback((mouseX: number, mouseY: number) => {
    if (!containerRef.current || !leftEyeRef.current || !rightEyeRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const centerX = container.left + container.width / 2;
    const centerY = container.top + container.height / 2;

    const leftEyeCenterX = centerX - eyeSpacing / 2;
    const rightEyeCenterX = centerX + eyeSpacing / 2;

    const calculateEyePosition = (eyeCenterX: number, eyeCenterY: number) => {
      const deltaX = mouseX - eyeCenterX;
      const deltaY = mouseY - eyeCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = (eyeSize - eyeBallSize) / 2;
      
      if (distance === 0) return { x: 0, y: 0 };
      
      const constrainedDistance = Math.min(distance, maxDistance);
      // The current position of the eyeballs
      const x = (deltaX / distance) * constrainedDistance - 4; 
      const y = (deltaY / distance) * constrainedDistance - 4;
      
      return { x, y };
    };

    const leftEyePos = calculateEyePosition(leftEyeCenterX, centerY);
    const rightEyePos = calculateEyePosition(rightEyeCenterX, centerY);

    leftEyeRef.current.style.transform = `translate(${leftEyePos.x}px, ${leftEyePos.y}px)`;
    rightEyeRef.current.style.transform = `translate(${rightEyePos.x}px, ${rightEyePos.y}px)`;
  }, []);

  const startBlinkTimer = useCallback(() => {
    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
    }
    
    blinkTimeoutRef.current = setTimeout(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        startBlinkTimer();
      }, 300);
    }, 10000);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startBlinkTimer();

    animationFrameRef.current = requestAnimationFrame(() => {
      updateEyePosition(event.clientX, event.clientY);
    });
  }, [updateEyePosition, startBlinkTimer]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    startBlinkTimer();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [handleMouseMove, startBlinkTimer]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: 'fit-content',
        height: 'fit-content',
        backgroundColor: blackColor1,
        padding: '4px',
        borderRadius: '50%',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: eyeSize + 8,
        minWidth: (eyeSize * 2) + eyeSpacing + 8,
      }}
    >
      <Box
        sx={{
          width: eyeSize,
          height: isBlinking ? 2 : eyeSize,
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'relative',
          overflow: 'hidden',
          transition: 'height 0.1s ease-out',
        }}
      >
        <Box
          ref={leftEyeRef}
          sx={{
            width: eyeBallSize,
            height: eyeBallSize,
            borderRadius: '50%',
            backgroundColor: 'black',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.1s ease-out',
          }}
        />
      </Box>
      <Box
        sx={{
          width: eyeSize,
          height: isBlinking ? 2 : eyeSize,
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'relative',
          overflow: 'hidden',
          transition: 'height 0.1s ease-out',
        }}
      >
        <Box
          ref={rightEyeRef}
          sx={{
            width: eyeBallSize,
            height: eyeBallSize,
            borderRadius: '50%',
            backgroundColor: 'black',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.1s ease-out',
          }}
        />
      </Box>
    </Box>
  );
}