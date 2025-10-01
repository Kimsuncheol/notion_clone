'use client';

import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown as markdownLanguage } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import { EditorView } from '@codemirror/view';
import { components, sanitizeSchema } from './constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';

interface MarkdownSummarySectionProps {
  summary: string;
  summaryError: string | null;
  hasSummary: boolean;
  isSummarizing: boolean;
  onSummaryChange: (value: string) => void;
  backgroundColor?: string;
}

const MarkdownSummarySection: React.FC<MarkdownSummarySectionProps> = ({
  summary,
  summaryError,
  hasSummary,
  isSummarizing,
  onSummaryChange,
  backgroundColor = 'transparent',
}) => {
  const summaryEditorExtensions = useMemo(() => [
    markdownLanguage(),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
        fontSize: '0.875rem',
        color: '#0f172a',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit',
        maxHeight: '200px',
      },
      '.cm-content': {
        padding: '0px',
      },
      '.cm-line': {
        paddingLeft: '0px',
      },
      '.cm-gutters': {
        display: 'none',
      },
    })
  ], []);

  if (summaryError) {
    return <p className="mt-1 text-red-500">{summaryError}</p>;
  }

  if (hasSummary) {
    return (
      <div className="rounded border" style={{ backgroundColor }}>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm, [remarkBreaks, { breaks: true }]]}
          rehypePlugins={[
            rehypeRaw,
            rehypeRemoveNbspInCode,
            rehypeKatex,
            [rehypeSanitize, sanitizeSchema],
            rehypeHighlight,
          ]}
          components={components}
        >
          {summary}
        </ReactMarkdown>
      </div>
    );
  }

  if (isSummarizing) {
    return <p className="italic text-gray-500">Generating summary…</p>;
  }

  return (
    <div className="rounded border p-2" style={{ backgroundColor }}>
      <CodeMirror
        value={summary}
        onChange={onSummaryChange}
        extensions={summaryEditorExtensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
        }}
        editable
        theme={EditorView.theme({}, { dark: false })}
        height="200px"
      />
    </div>
  );
};

export default MarkdownSummarySection;

