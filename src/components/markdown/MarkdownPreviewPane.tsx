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
import { followUser, unfollowUser, isFollowingUser } from '@/services/firebase';
import { fetchNoteContent } from '@/services/markdown/firebase';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { components, sanitizeSchema } from './constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';
import 'katex/dist/katex.min.css';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

// Function to generate heading IDs consistent with TOC
const generateHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

interface MarkdownPreviewPaneWriterInfoSectionProps {
  title: string;
  authorName: string;
  authorId: string;
  pageId: string;
  date: string;
  authorEmail: string;
  viewMode: ViewMode;
}

function MarkdownPreviewPaneWriterInfoSection({
  title,
  authorName,
  authorId,
  pageId,
  date,
  authorEmail,
  viewMode
}: MarkdownPreviewPaneWriterInfoSectionProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveringUnfollow, setIsHoveringUnfollow] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser?.uid === authorId;
  const { setViewMode } = useMarkdownEditorContentStore();
  const { setShowDeleteConfirmation } = useMarkdownEditorContentStore();
  // const router = useRouter();

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
      <div className='flex items-center justify-between'>
        <span className="text-gray-500 text-sm" title={date}>
          {date}
        </span>
        {/* if currentUser?.email === authorEmail, show edit and delete button */}
        {currentUser?.email === authorEmail && (
          <div className='flex items-center gap-4'>
            <span className="text-gray-500 text-sm cursor-pointer" onClick={() => {
              console.log('currentUser?.email', currentUser?.email);
              if (viewMode === 'preview' && currentUser?.email === authorEmail) {
                console.log('setViewMode to split');
                setViewMode('split');
              }
            }}>
              Edit
            </span>
            {/* if currentUser?.email === authorEmail, show delete trigger button */}
            {currentUser?.email === authorEmail && (
              <span className="text-gray-500 text-sm cursor-pointer" onClick={() => {
                console.log('delete note');
                setShowDeleteConfirmation(true);
              }}>
                Delete
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MarkdownPreviewPaneProps {
  content: string;
  viewMode: ViewMode;
  pageId: string;
  authorName: string;
  authorId: string;
  date: string;
  authorEmail: string;
  isSubNote?: boolean;
}

const MarkdownPreviewPane: React.FC<MarkdownPreviewPaneProps> = ({ content, viewMode, pageId, authorName, authorId, date, authorEmail, isSubNote = false }) => {
  const [title, setTitle] = useState('');

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

  return (
    <div className={`flex flex-col no-scrollbar overflow-y-auto`} style={{ width: isSubNote ? `${(window.innerWidth * 0.75) / 2 - 40}px` : '100%', height: 'calc(100vh - 169px)' }}>
      {viewMode === 'preview' && (
        <MarkdownPreviewPaneWriterInfoSection
          title={title}
          authorName={authorName}
          authorId={authorId}
          pageId={pageId}
          date={date}
          authorEmail={authorEmail}
          viewMode={viewMode}
        />
      )}
      <div className={`flex-1 p-4 prose prose-lg dark:prose-invert
        [&_.katex]:text-inherit [&_.katex-display]:my-6 [&_.katex-display]:text-center
        [&_.katex-html]:text-inherit [&_.katex-mathml]:hidden
        dark:[&_.katex]:text-gray-100 dark:[&_.katex-display]:text-gray-100
        [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
        overflow-x-hidden
        `} id='react-markdown-container'>

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
          components={{
            ...components,
            // Add heading components with IDs for TOC navigation
            h1: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children :
                React.Children.toArray(children).join('');
              const id = generateHeadingId(text);
              return <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.67rem 0' }} id={id} {...props}>{children}</h1>;
            },
            h2: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children :
                React.Children.toArray(children).join('');
              const id = generateHeadingId(text);
              return <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.83rem 0' }} id={id} {...props}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children :
                React.Children.toArray(children).join('');
              const id = generateHeadingId(text);
              return <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1rem 0' }} id={id} {...props}>{children}</h3>;
            },
            h4: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children :
                React.Children.toArray(children).join('');
              const id = generateHeadingId(text);
              return <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '1.33rem 0' }} id={id} {...props}>{children}</h4>;
            },
            h5: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children :
                React.Children.toArray(children).join('');
              const id = generateHeadingId(text);
              return <h5 style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: '1.67rem 0' }} id={id} {...props}>{children}</h5>;
            },
            h6: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children :
                React.Children.toArray(children).join('');
              const id = generateHeadingId(text);
              return <h6 style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '2.33rem 0' }} id={id} {...props}>{children}</h6>;
            },
          }}
        >
          {processContent(content) || '*Write some markdown to see the preview...*'}
        </ReactMarkdown>
      </div>
    </div >
  );
};

export default MarkdownPreviewPane;