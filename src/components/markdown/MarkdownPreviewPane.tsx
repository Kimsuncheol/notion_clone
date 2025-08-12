import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import { ViewMode } from './ViewModeControls';
import { fetchNoteContent, followUser, unfollowUser, isFollowingUser } from '@/services/firebase';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { components, sanitizeSchema } from './constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';
import 'katex/dist/katex.min.css';
interface MarkdownPreviewPaneProps {
  content: string;
  viewMode: ViewMode;
  pageId: string;
  authorName: string;
  authorId: string;
  date: string;
  isSubNote?: boolean;
}

const MarkdownPreviewPane: React.FC<MarkdownPreviewPaneProps> = ({ content, viewMode, pageId, authorName, authorId, date, isSubNote = false }) => {
  const [title, setTitle] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveringUnfollow, setIsHoveringUnfollow] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser?.uid === authorId;

  useEffect(() => {
    const loadTitle = async () => {
      // Only fetch if pageId is valid and not empty
      if (pageId && pageId.trim() !== '') {
        try {
          const noteContent = await fetchNoteContent(pageId);
          setTitle(noteContent?.title || '');
        } catch (error) {
          console.error('Error fetching note content:', error);
        }
      } else {
        // Clear title if no valid pageId
        setTitle('');
      }
    };
    loadTitle();
  }, [pageId]);

  const processContent = (content: string) => {
    if (!content) return content;

    return content.replace(/\n{2,}/g, (match) => {
      const lineCount = match.length;
      return '\n\n' + '\u00A0\n\n'.repeat(Math.max(0, lineCount - 1));
    });
  };

  useEffect(() => {
    const checkFollowing = async () => {
      // Only check follow status if all required data is valid
      if (currentUser && authorId && authorId.trim() !== '' && !isOwnProfile) {
        try {
          const followStatus = await isFollowingUser(authorId);
          setIsFollowing(followStatus);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      } else {
        // Reset follow status if invalid data
        setIsFollowing(false);
      }
    };
    checkFollowing();
  }, [currentUser, authorId, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || !authorId || authorId.trim() === '') {
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
    <div className={`flex flex-col h-full`} style={{ width: isSubNote ? `${(window.innerWidth * 0.75) / 2 - 40}px` : '100%' }}>
      {viewMode === 'preview' && (
        // Show the title of the note
        // Get the title of the note from Firebase
        <div className="flex flex-col gap-2 p-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">{title}</h1>
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
      <div className="flex-1 p-4 overflow-y-auto prose prose-lg dark:prose-invert
        [&_.katex]:text-inherit [&_.katex-display]:my-6 [&_.katex-display]:text-center
        [&_.katex-html]:text-inherit [&_.katex-mathml]:hidden
        dark:[&_.katex]:text-gray-100 dark:[&_.katex-display]:text-gray-100
        [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
        overflow-x-hidden
        ">

        {/* Don't touch this, it's working */}
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
          {processContent(content) || '*Write some markdown to see the preview...*'}
        </ReactMarkdown>
      </div>
    </div >
  );
};

export default MarkdownPreviewPane; 