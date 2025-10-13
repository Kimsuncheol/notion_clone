'use client';

import { useMemo } from 'react';
import type { CSSProperties, KeyboardEvent, RefObject } from 'react';
import AIHeader from '../ai/AIHeader';
import AIResponseDisplay from '../ai/AIResponseDisplay';
import AIQuestionInputForMarkdownAIChatModal from './AIQuestionInputForMarkdownAIChatModal';

type ConversationEntry = {
  id: number;
  prompt: string;
  response: string;
  isLoading: boolean;
};

interface AIChatContentProps {
  responses: ConversationEntry[];
  question: string;
  onQuestionChange: (question: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSearch: () => void;
  isBusy: boolean;
  userAvatarUrl?: string;
  userDisplayName?: string;
  responseContainerRef: RefObject<HTMLDivElement | null>;
  onAnimationFinished?: (responseId: number) => void;
  latestResponseId: number | null;
}

export default function AIChatContent({
  responses,
  question,
  onQuestionChange,
  onKeyDown,
  onSearch,
  isBusy,
  userAvatarUrl,
  userDisplayName,
  responseContainerRef,
  onAnimationFinished,
  latestResponseId,
}: AIChatContentProps) {
  const shouldShowResponse = responses.length > 0;
  const stackedResponseStyle = useMemo<CSSProperties>(() => ({ marginTop: 0 }), []);

  const responseContainerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: shouldShowResponse ? 'flex-start' : 'center',
    gap: shouldShowResponse ? 24 : 32,
    width: '100%',
    overflowY: 'auto',
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 8,
    paddingRight: 8,
    marginRight: -8,
  };

  return (
    <>
      <div
        ref={responseContainerRef}
        className="no-scrollbar"
        style={responseContainerStyle}
      >
        {shouldShowResponse ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {responses.map((entry) => (
              <AIResponseDisplay
                key={entry.id}
                response={entry.response}
                isLoading={entry.isLoading}
                prompt={entry.prompt}
                style={stackedResponseStyle}
                userAvatarUrl={userAvatarUrl}
                userDisplayName={userDisplayName}
                onAnimationFinished={
                  !entry.isLoading && latestResponseId === entry.id && onAnimationFinished
                    ? () => onAnimationFinished(entry.id)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <AIHeader />
        )}
      </div>

      <div
        style={{
          width: '100%',
          paddingTop: shouldShowResponse ? 8 : 0,
        }}
      >
        <AIQuestionInputForMarkdownAIChatModal
          question={question}
          onChange={onQuestionChange}
          onKeyDown={onKeyDown}
          onSearch={onSearch}
          isBusy={isBusy}
        />
      </div>
    </>
  );
}
