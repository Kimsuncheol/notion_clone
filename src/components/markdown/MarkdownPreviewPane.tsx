import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { ViewMode } from './ViewModeControls';
import { fetchNoteContent, followUser, unfollowUser, isFollowingUser } from '@/services/firebase';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';

interface MarkdownPreviewPaneProps {
  content: string;
  viewMode: ViewMode;
  pageId: string;
  authorName: string;
  authorId: string;
  date: string;
}

const MarkdownPreviewPane: React.FC<MarkdownPreviewPaneProps> = ({ content, viewMode, pageId, authorName, authorId, date }) => {
  const [title, setTitle] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveringUnfollow, setIsHoveringUnfollow] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser?.uid === authorId;

  useEffect(() => {
    const loadTitle = async () => {
      try {
        const noteContent = await fetchNoteContent(pageId);
        setTitle(noteContent?.title || '');
      } catch (error) {
        console.error('Error fetching note content:', error);
      }
    };
    loadTitle();
  }, [pageId]);

  useEffect(() => {
    const checkFollowing = async () => {
      if (currentUser && authorId && !isOwnProfile) {
        try {
          const followStatus = await isFollowingUser(authorId);
          setIsFollowing(followStatus);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };
    checkFollowing();
  }, [currentUser, authorId, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || !authorId) {
      toast.error('Please sign in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(authorId);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        await followUser(authorId);
        setIsFollowing(true);
        toast.success('Following successfully');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {viewMode === 'preview' && (
        // Show the title of the note
        // Get the title of the note from Firebase
        <div className="flex flex-col gap-2 p-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
          <div className="flex items-center gap-4 text-gray-500">
            <Link href={`/profile/${authorId}`}>
              <span className="text-gray-500 hover:underline">
                {authorName}
              </span>
            </Link>
            {!isOwnProfile && currentUser && (
              <button
                onClick={handleFollow}
                onMouseEnter={() => {
                  if (isFollowing) setIsHoveringUnfollow(true);
                }}
                onMouseLeave={() => {
                  if (isFollowing) setIsHoveringUnfollow(false);
                }}
                disabled={followLoading}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-colors duration-200
                  ${isFollowing
                    ? isHoveringUnfollow
                      ? 'bg-red-600 text-white'
                      : 'bg-green-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {isFollowing ? (
                  isHoveringUnfollow ? 'Unfollow' : 'Following'
                ) : (
                  <>
                    <AddIcon fontSize="inherit" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
          <span className="text-gray-500 text-sm" title={date}>
            {date}
          </span>
        </div>
      )}
      <div className="flex-1 p-4 overflow-y-auto prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSanitize]}
          components={{
            // Custom components for better styling
            h1: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={style}>{children}</h1>
            ),
            h2: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white" style={style}>{children}</h2>
            ),
            h3: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <h3 className="text-xl font-medium text-gray-900 dark:text-white" style={style}>{children}</h3>
            ),
            p: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => {
              return (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</p>
              );
            },
            // LaTeX components are now handled by Web Components
            // The custom latex-inline and latex-block tags will be processed by rehypeRaw
            // and rendered by the registered Web Components
            code: (props: React.ComponentProps<'code'> & { inline?: boolean }) => {
              const { inline, children, style, ...rest } = props;
              return inline ? (
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" style={style} {...rest}>
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto" style={style} {...rest}>
                  {children}
                </code>
              );
            },
            blockquote: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 my-4" style={style}>
                {children}
              </blockquote>
            ),
            ul: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <ul className="list-disc pl-6 mb-4 space-y-1" style={style}>{children}</ul>
            ),
            ol: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-1" style={style}>{children}</ol>
            ),
            li: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <li className="text-gray-700 dark:text-gray-300" style={style}>{children}</li>
            ),
            table: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <div className="overflow-x-auto mb-4">
                <table className="w-auto border border-collapse border-gray-200 dark:border-gray-700" style={style}>
                  {children}
                </table>
              </div>
            ),
            tr: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <tr className="border border-collapse border-gray-200 dark:border-gray-700" style={style}>{children}</tr>
            ),
            th: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <th className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left" style={style}>
                {children}
              </th>
            ),
            td: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <td className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2" style={style}>
                {children}
              </td>
            ),
            // Additional components for common HTML elements
            div: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <div style={style}>{children}</div>
            ),
            span: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
              <span style={style}>{children}</span>
            ),
            img: ({ src, alt, style, ...props }: React.ComponentProps<'img'> & { src: string; alt: string }) => (
              <img 
                src={src} 
                alt={alt} 
                style={style}
                className="max-w-full h-auto rounded-lg shadow-sm my-4"
                {...props}
              />
            ),
            a: ({ children, href, style }: React.ComponentProps<'a'> & { href: string }) => (
              <a 
                href={href} 
                style={style}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any}
        >
          {content || '*Write some markdown to see the preview...*'}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownPreviewPane; 