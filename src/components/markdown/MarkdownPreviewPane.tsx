import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownPreviewPaneProps {
  content: string;
}

const MarkdownPreviewPane: React.FC<MarkdownPreviewPaneProps> = ({ content }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">PREVIEW</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            // Custom components for better styling
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>
            ),
            code: (props: React.ComponentProps<'code'> & { inline?: boolean }) => {
              const { inline, children, ...rest } = props;
              return inline ? (
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...rest}>
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...rest}>
                  {children}
                </code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 my-4">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700 dark:text-gray-300">{children}</li>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 dark:border-gray-700">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                {children}
              </td>
            ),
          }}
        >
          {content || '*Write some markdown to see the preview...*'}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownPreviewPane; 