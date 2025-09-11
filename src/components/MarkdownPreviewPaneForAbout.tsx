import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import { componenetsForAbout, sanitizeSchema } from './markdown/constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';
import 'katex/dist/katex.min.css';

interface MarkdownPreviewPaneForAboutProps {
  contentForAbout?: string;
}

const MarkdownPreviewPaneForAbout: React.FC<MarkdownPreviewPaneForAboutProps> = ({ contentForAbout: contentForAbout }) => {
  const processContent = (content: string) => {
    if (!content) return content;

    return content.replace(/\n{2,}/g, (match) => {
      const lineCount = match.length;
      return '\n\n' + '\u00A0\n\n'.repeat(Math.max(0, lineCount - 1));
    });
  };

  return (
    <div className="flex flex-col no-scrollbar overflow-y-auto" style={{ width: '100%', height: 'calc(100vh - 169px)' }}>
      <div className={`flex-1 p-4 prose prose-lg dark:prose-invert
        [&_.katex]:text-inherit [&_.katex-display]:my-6 [&_.katex-display]:text-center
        [&_.katex-html]:text-inherit [&_.katex-mathml]:hidden
        dark:[&_.katex]:text-gray-100 dark:[&_.katex-display]:text-gray-100
        [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
        overflow-x-hidden
        no-scrollbar
        `} id='react-markdown-container-about'>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm, [remarkBreaks, { breaks: true }]]}
          rehypePlugins={[
            rehypeRaw,
            rehypeRemoveNbspInCode,
            rehypeKatex,
            [rehypeSanitize, sanitizeSchema],
            rehypeHighlight,
          ]}
          components={componenetsForAbout}
        >
          {processContent(contentForAbout!) || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default memo(MarkdownPreviewPaneForAbout);
