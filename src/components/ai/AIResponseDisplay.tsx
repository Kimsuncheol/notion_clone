'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import AnimatedText from './AnimatedText';
import toast from 'react-hot-toast';

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
  onEditPrompt?: () => void;
  onRegenerateResponse?: () => void;
  isEditingPrompt?: boolean;
  disableActions?: boolean;
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
  onEditPrompt,
  onRegenerateResponse,
  isEditingPrompt = false,
  disableActions = false,
}: AIResponseDisplayProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hasStreamedRef = useRef(false);
  const hasAnimatedRef = useRef(false);
  const previousResponseRef = useRef<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copyAnnouncement, setCopyAnnouncement] = useState('');
  const promptCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trimmedPrompt = prompt?.trim() ?? '';
  const canEditPrompt = Boolean(onEditPrompt) && !disableActions && !isLoading && !isStreaming && Boolean(trimmedPrompt);
  const canRegenerateResponse =
    Boolean(onRegenerateResponse) &&
    !disableActions &&
    !isLoading &&
    !isStreaming &&
    Boolean(trimmedPrompt) &&
    !isEditingPrompt;
  const actionButtonBaseClass =
    'flex h-7 w-7 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30';
  const actionButtonEnabledClass = 'text-white/60 hover:bg-white/10 hover:text-white';
  const actionButtonDisabledClass = 'cursor-not-allowed text-white/30';
  const actionButtonActiveClass = 'bg-blue-500/15 text-blue-200';

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

  const announceCopy = useCallback((message: string) => {
    setCopyAnnouncement((prev) => (prev === message ? `${message} ` : message));
  }, []);

  useEffect(() => {
    return () => {
      if (promptCopyTimeoutRef.current) {
        clearTimeout(promptCopyTimeoutRef.current);
        promptCopyTimeoutRef.current = null;
      }

      if (responseCopyTimeoutRef.current) {
        clearTimeout(responseCopyTimeoutRef.current);
        responseCopyTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (promptCopyTimeoutRef.current) {
      clearTimeout(promptCopyTimeoutRef.current);
      promptCopyTimeoutRef.current = null;
    }

    if (copiedPrompt) {
      setCopiedPrompt(false);
    }
  }, [prompt, copiedPrompt]);

  useEffect(() => {
    if (responseCopyTimeoutRef.current) {
      clearTimeout(responseCopyTimeoutRef.current);
      responseCopyTimeoutRef.current = null;
    }

    if (copiedResponse) {
      setCopiedResponse(false);
    }
  }, [response, copiedResponse]);

  const handleCopyPrompt = useCallback(async () => {
    if (!prompt || !prompt.trim()) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      console.error('Clipboard API is not available for copying the prompt.');
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      announceCopy('Prompt copied to clipboard.');
      toast.success('Prompt copied to clipboard.');

      if (promptCopyTimeoutRef.current) {
        clearTimeout(promptCopyTimeoutRef.current);
      }

      promptCopyTimeoutRef.current = setTimeout(() => {
        setCopiedPrompt(false);
        promptCopyTimeoutRef.current = null;
      }, 1500);
    } catch (error) {
      console.error('Failed to copy prompt', error);
    }
  }, [announceCopy, prompt]);

  const handleCopyResponse = useCallback(async () => {
    const hasCopyableResponse = Boolean(response?.trim()) && !isStreaming && !(isLoading && !isStreaming);
    if (!hasCopyableResponse) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      console.error('Clipboard API is not available for copying the response.');
      return;
    }

    try {
      await navigator.clipboard.writeText(response);
      setCopiedResponse(true);
      announceCopy('Response copied to clipboard.');
      toast.success('Response copied to clipboard.');

      if (responseCopyTimeoutRef.current) {
        clearTimeout(responseCopyTimeoutRef.current);
      }

      responseCopyTimeoutRef.current = setTimeout(() => {
        setCopiedResponse(false);
        responseCopyTimeoutRef.current = null;
      }, 1500);
    } catch (error) {
      console.error('Failed to copy response', error);
    }
  }, [announceCopy, isLoading, isStreaming, response]);

  const handleEditPromptClick = useCallback(() => {
    if (!canEditPrompt || !onEditPrompt) {
      return;
    }

    onEditPrompt();
  }, [canEditPrompt, onEditPrompt]);

  const handleRegenerateResponseClick = useCallback(() => {
    if (!canRegenerateResponse || !onRegenerateResponse) {
      return;
    }

    onRegenerateResponse();
  }, [canRegenerateResponse, onRegenerateResponse]);

  const containerStyle: CSSProperties = {
    width: '100%',
    marginTop: 24,
    ...(style ?? {}),
  };

  const showSpinner = isLoading && !isStreaming;
  const resolvedUserAvatar = userAvatarUrl?.trim() || undefined;
  const userInitial = userDisplayName?.trim()?.[0]?.toUpperCase() ?? 'U';
  const hasResponseContent = Boolean(response?.trim());
  const canCopyPrompt = Boolean(trimmedPrompt);
  const canCopyResponse = hasResponseContent && !showSpinner && !isStreaming;
  const shouldShowResponseBubble = hasResponseContent || showSpinner || isStreaming;
  const shouldShowResponseActions = (canCopyResponse || canRegenerateResponse) && !shouldAnimate;
  const editButtonClass = `${actionButtonBaseClass} ${
    isEditingPrompt
      ? `${actionButtonActiveClass}`
      : canEditPrompt
      ? actionButtonEnabledClass
      : actionButtonDisabledClass
  }`;
  const regenerateButtonClass = `${actionButtonBaseClass} ${
    canRegenerateResponse ? actionButtonEnabledClass : actionButtonDisabledClass
  }`;

  return (
    <div style={containerStyle} className="no-scrollbar">
      <span aria-live="polite" className="sr-only">
        {copyAnnouncement}
      </span>
      {prompt && (
        <div className="flex w-full justify-end">
          <div className="flex justify-end gap-2">
            <div className="flex max-w-[75%] flex-col items-end gap-2">
              <div
                className="w-full rounded-2xl rounded-tr-sm p-4 text-left shadow-[0_12px_30px_rgba(37,99,235,0.18)]"
                style={{
                  backgroundColor: 'rgba(96, 165, 250, 0.15)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  color: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-[1.55]">{prompt}</p>
              </div>
              {(canCopyPrompt || Boolean(onEditPrompt)) && (
                <div className="flex items-center gap-2">
                  {canCopyPrompt && (
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                        copiedPrompt
                          ? 'bg-blue-500/15 text-blue-200'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={copiedPrompt ? 'Prompt copied' : 'Copy your prompt'}
                    >
                      {copiedPrompt ? (
                        <CheckIcon className="h-3.5 w-3.5" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}

                  {onEditPrompt && (
                    <button
                      type="button"
                      onClick={handleEditPromptClick}
                      className={editButtonClass}
                      aria-label={isEditingPrompt ? 'Editing prompt' : 'Edit your prompt'}
                      aria-pressed={isEditingPrompt ? true : false}
                      disabled={!canEditPrompt}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
              {isEditingPrompt && (
                <span className="self-end text-[11px] font-semibold uppercase tracking-wide text-blue-200/80">
                  Editing prompt
                </span>
              )}
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
              className="flex w-fit max-w-[80%] flex-col gap-2"
            >
              <div
                className="rounded-2xl rounded-tl-sm p-4 text-left"
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
              {shouldShowResponseActions && (
                <div className="ml-auto flex items-center gap-2">
                  {canRegenerateResponse && (
                    <button
                      type="button"
                      onClick={handleRegenerateResponseClick}
                      className={regenerateButtonClass}
                      aria-label="Regenerate AI response"
                      disabled={!canRegenerateResponse}
                    >
                      <RefreshIcon className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {canCopyResponse && (
                    <button
                      type="button"
                      onClick={handleCopyResponse}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                        copiedResponse
                          ? 'bg-blue-500/15 text-blue-200'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={copiedResponse ? 'Response copied' : 'Copy AI response'}
                    >
                      {copiedResponse ? (
                        <CheckIcon className="h-3.5 w-3.5" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
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
  prev.disableAnimation === next.disableAnimation &&
  prev.onEditPrompt === next.onEditPrompt &&
  prev.onRegenerateResponse === next.onRegenerateResponse &&
  prev.isEditingPrompt === next.isEditingPrompt &&
  prev.disableActions === next.disableActions;

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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 14.31-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-14.31 6.7L3 16" />
    </svg>
  );
}
