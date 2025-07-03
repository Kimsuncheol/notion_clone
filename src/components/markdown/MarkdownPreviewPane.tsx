import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
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
                <table className="w-auto border border-collapse border-gray-200 dark:border-gray-700">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2">
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