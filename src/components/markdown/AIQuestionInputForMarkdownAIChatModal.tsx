import { forwardRef } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { grayColor2, blackColor1 } from '@/constants/color';

interface AIQuestionInputForMarkdownAIChatModalProps {
  question: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSearch: () => void;
  isBusy: boolean;
}

const containerStyle: CSSProperties = {
  width: '100%',
};

const formShellStyle: CSSProperties = {
  width: '100%',
  backgroundColor: grayColor2,
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: '16px',
  overflow: 'hidden',
};

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '16px 20px',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '56px',
  maxHeight: '160px',
  border: 'none',
  outline: 'none',
  resize: 'none',
  backgroundColor: 'transparent',
  color: 'white',
  fontSize: '16px',
  lineHeight: 1.5,
  padding: '16px 20px',
  fontFamily: 'inherit',
};

const sendButtonBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: 'none',
  color: 'white',
  transition: 'background-color 150ms ease, color 150ms ease',
};

const disabledButtonStyle: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.3)',
  cursor: 'not-allowed',
};

const activeButtonStyle: CSSProperties = {
  backgroundColor: blackColor1,
  cursor: 'pointer',
};

const AIQuestionInputForMarkdownAIChatModal = forwardRef<
  HTMLDivElement,
  AIQuestionInputForMarkdownAIChatModalProps
>(function AIQuestionInputForMarkdownAIChatModal(
  { question, onChange, onKeyDown, onSearch, isBusy },
  ref
) {
  const isSendDisabled = isBusy || !question.trim();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onKeyDown(event);

    if (!event.defaultPrevented && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!isSendDisabled) {
        onSearch();
      }
    }
  };

  return (
    <div style={containerStyle} ref={ref}>
      <div style={formShellStyle}>
        <textarea
          id="ai-question-input"
          placeholder="Ask a question about markdown..."
          value={question}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy}
          rows={1}
          style={textareaStyle}
          className="no-scrollbar placeholder:text-white/60 disabled:text-white/50 disabled:placeholder:text-white/30"
          aria-label="Ask a question about markdown"
        />

        <div style={footerStyle}>
          <button
            type="button"
            onClick={onSearch}
            id="search-button"
            disabled={isSendDisabled}
            style={{
              ...sendButtonBaseStyle,
              ...(isSendDisabled ? disabledButtonStyle : activeButtonStyle),
            }}
            className={`focus:outline-none ${
              isSendDisabled
                ? ''
                : 'hover:bg-[#1976d2] focus-visible:ring-2 focus-visible:ring-[#1976d2]/60'
            }`}
            aria-label="Send question"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default AIQuestionInputForMarkdownAIChatModal;

interface IconProps {
  className?: string;
}

function ArrowUpIcon({ className }: IconProps) {
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
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}
