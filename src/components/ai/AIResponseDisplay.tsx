'use client';

import { memo, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import AnimatedText from './AnimatedText';

type AIResponseDisplayProps = {
  response: string;
  isLoading: boolean;
  isStreaming?: boolean;
  isLatestResponse?: boolean;
  prompt?: string;
  style?: CSSProperties;
  onAnimationFinished?: () => void;
  userAvatarUrl?: string;
  userDisplayName?: string;
  aiAvatarUrl?: string;
  disableAnimation?: boolean;
};

function AIResponseDisplayComponent({
  response,
  isLoading,
  isStreaming = false,
  isLatestResponse = false,
  prompt,
  style,
  onAnimationFinished,
  userAvatarUrl,
  userDisplayName,
  aiAvatarUrl,
  disableAnimation = false,
}: AIResponseDisplayProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hasStreamedRef = useRef(false);
  const hasAnimatedRef = useRef(false);
  const previousResponseRef = useRef<string | null>(null);

  useEffect(() => {
    if (isStreaming) {
      hasStreamedRef.current = true;
      hasAnimatedRef.current = false;
      setShouldAnimate(false);
      previousResponseRef.current = response;
      return;
    }

    if (!isLoading && !response) {
      hasStreamedRef.current = false;
      hasAnimatedRef.current = false;
      setShouldAnimate(false);
      previousResponseRef.current = null;
      return;
    }

    if (isLoading || !isLatestResponse || disableAnimation) {
      setShouldAnimate(false);
      return;
    }

    if (response) {
      const isNewResponse = response !== previousResponseRef.current || hasStreamedRef.current;
      if (isNewResponse) {
        hasAnimatedRef.current = false;
        hasStreamedRef.current = false;
      }

      previousResponseRef.current = response;

      if (!hasAnimatedRef.current) {
        setShouldAnimate(true);
      }
    }
  }, [isLoading, isStreaming, isLatestResponse, response, disableAnimation]);

  const containerStyle: CSSProperties = {
    width: '100%',
    marginTop: 24,
    ...(style ?? {}),
  };

  const showSpinner = isLoading && !isStreaming;
  const resolvedUserAvatar = userAvatarUrl?.trim() || undefined;
  const userInitial = userDisplayName?.trim()?.[0]?.toUpperCase() ?? 'U';
  const hasResponseContent = Boolean(response?.trim());
  const shouldShowResponseBubble = hasResponseContent || showSpinner || isStreaming;

  return (
    <div style={containerStyle} className="no-scrollbar">
      {prompt && (
        <div className="flex w-full justify-end">
          <div className="flex justify-end gap-2">
            <div
              className="max-w-[75%] rounded-2xl rounded-tr-sm p-4 text-left shadow-[0_12px_30px_rgba(37,99,235,0.18)]"
              style={{
                backgroundColor: 'rgba(96, 165, 250, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                color: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <p className="whitespace-pre-wrap text-[15px] leading-[1.55]">{prompt}</p>
            </div>
            <CircleAvatar
              src={resolvedUserAvatar}
              alt={userDisplayName ?? 'You'}
              fallback={userInitial}
              size={36}
              backgroundColor="rgba(96, 165, 250, 0.35)"
              color="rgba(255, 255, 255, 0.95)"
              fontSize={14}
              fontWeight={600}
            />
          </div>
        </div>
      )}

      {shouldShowResponseBubble && (
        <div
          className="flex w-full justify-start"
          style={{ marginTop: prompt ? 6 : 0 }}
        >
          <div className="w-full flex items-start gap-1.5">
            <CircleAvatar
              src={aiAvatarUrl?.trim() || undefined}
              alt="AI"
              fallback="🤖"
              size={36}
              backgroundColor="rgba(59, 130, 246, 0.25)"
              color="rgba(147, 197, 253, 0.95)"
              fontSize={16}
            />
            <div
              className="flex w-fit max-w-[80%] flex-col gap-1.5 rounded-2xl rounded-tl-sm p-4 text-left"
              style={{
                backgroundColor: 'rgba(7, 11, 23, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.92)',
              }}
            >
              {showSpinner && (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
                  <p className="text-sm" style={{ color: 'rgba(191, 219, 254, 0.9)' }}>
                    Thinking through a response...
                  </p>
                </div>
              )}

              {isStreaming && (
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  <p className="text-sm" style={{ color: 'rgba(147, 197, 253, 0.85)' }}>
                    Streaming response...
                  </p>
                </div>
              )}

              {response && (isStreaming || !isLoading) && (
                <div
                  className="mr-[-4px] max-h-[320px] overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <div className="whitespace-pre-wrap text-[16px] leading-[1.6]">
                    <AnimatedText
                      text={response}
                      isActive={shouldAnimate && !isStreaming}
                      onAnimationComplete={() => {
                        hasAnimatedRef.current = true;
                        setShouldAnimate(false);
                        onAnimationFinished?.();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const areEqual = (prev: AIResponseDisplayProps, next: AIResponseDisplayProps) =>
  prev.response === next.response &&
  prev.isLoading === next.isLoading &&
  prev.isStreaming === next.isStreaming &&
  prev.isLatestResponse === next.isLatestResponse &&
  prev.prompt === next.prompt &&
  prev.style === next.style &&
  prev.userAvatarUrl === next.userAvatarUrl &&
  prev.userDisplayName === next.userDisplayName &&
  prev.aiAvatarUrl === next.aiAvatarUrl &&
  prev.onAnimationFinished === next.onAnimationFinished &&
  prev.disableAnimation === next.disableAnimation;

export default memo(AIResponseDisplayComponent, areEqual);

type CircleAvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  size: number;
  backgroundColor: string;
  color: string;
  fontSize?: number;
  fontWeight?: number;
};

function CircleAvatar({
  src,
  alt,
  fallback,
  size,
  backgroundColor,
  color,
  fontSize = 14,
  fontWeight = 500,
}: CircleAvatarProps) {
  if (src) {
    return (
      <div
        className="overflow-hidden rounded-full"
        style={{ width: size, height: size, backgroundColor }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- avatar image rendering outside Next Image */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor,
        color,
        fontSize,
        fontWeight,
      }}
    >
      <span>{fallback}</span>
    </div>
  );
}
