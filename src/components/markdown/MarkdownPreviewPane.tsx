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
import { followUser, unfollowUser, isFollowingUser } from '@/services/follow/firebase';
import { realtimeComments } from '@/services/markdown/firebase';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { components, sanitizeSchema } from './constants';
import { rehypeRemoveNbspInCode } from '@/customPlugins/rehype-remove-nbsp-in-code';
import 'katex/dist/katex.min.css';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import { TagType, MySeries } from '@/types/firebase';
import { mintColor1 } from '@/constants/color';
import SelfIntroduction from '../my-posts/SelfIntroduction';
import LeaveComments from './LeaveComments';
import CommentsSection from './CommentsSection';
import SeriesIndexContainer from './SeriesIndexContainer';
import Image from 'next/image';

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
  tags?: TagType[];
  viewMode: ViewMode;
  viewCount: number;
}

function MarkdownPreviewPaneWriterInfoSection({
  title,
  authorName,
  authorId,
  // pageId,
  tags,
  date,
  authorEmail,
  viewCount
}: MarkdownPreviewPaneWriterInfoSectionProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveringUnfollow, setIsHoveringUnfollow] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser?.uid === authorId;
  const { setViewMode } = useMarkdownStore();
  const { setShowDeleteConfirmation } = useMarkdownStore();
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
    return () => {
      setShowDeleteConfirmation(false);
    }
  }, [currentUser, authorId, isOwnProfile, setShowDeleteConfirmation]);

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
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-6xl mb-4 font-bold text-gray-900 dark:text-white">{title}</h1>
      {/* writer and date and follow/unfollow button */}
      <div className="flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-2">
          <Link href={{ pathname: `/${authorEmail}/profile/${authorId}`, query: { authorEmail: authorEmail, authorId: authorId } }}>
            <span className="text-gray-500 hover:underline font-bold">
              {authorName}
            </span>
          </Link>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500" title={date}>
            {date}
          </span>
        </div>
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
      {/* tags */}
      {tags && tags.length > 0 && (
        <div className='flex items-center gap-2'>
          {tags.map((tag) => (
            <span key={tag.id} className='bg-gray-300/10 cursor-pointer hover:bg-gray-300/20 px-4 py-2 rounded-full text-sm font-semibold' style={{ color: mintColor1 }}>{tag.name}</span>
          ))}
        </div>
      )}
      <div className='flex items-center justify-between'>
        {/* viewCount */}
        <span className="text-gray-500 text-sm" title={viewCount.toString()}>
          {viewCount === 0 ? 'No views' : viewCount === 1 ? '1 view' : `${viewCount} views`}
        </span>
        {/* if currentUser?.email === authorEmail, show edit and delete button */}
        {currentUser?.email === authorEmail && (
          <div className='flex items-center gap-4'>
            <span className="text-gray-500 text-sm cursor-pointer" onClick={() => setViewMode('split')}>
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
  title: string;
  content: string;
  viewMode: ViewMode;
  pageId: string;
  authorName: string;
  authorId: string;
  date: string;
  authorEmail: string;
  tags?: TagType[];
  viewCount: number;
}

const MarkdownPreviewPane: React.FC<MarkdownPreviewPaneProps> = ({
  title,
  content,
  viewMode,
  pageId,
  authorName,
  authorId,
  date,
  authorEmail,
  viewCount,
  tags,
}) => {
  const { authorProfile, setComments, comments, selectedSeries } = useMarkdownStore();
  const { isBeingEditedCommentId, isBeingEditedReplyId, isShowingRepliesCommentId, thumbnailUrl } = useMarkdownStore();

  useEffect(() => {
    if (!pageId || pageId.trim() === '') {
      setComments([]);
      return;
    }

    const unsubscribe = realtimeComments(pageId, (updatedComments) => {
      setComments(updatedComments);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const processContent = (content: string) => {
    if (!content) return content;

    return content.replace(/\n{2,}/g, (match) => {
      const lineCount = match.length;
      return '\n\n' + '\u00A0\n\n'.repeat(Math.max(0, lineCount - 1));
    });
  };

  return (
    <div className={`flex flex-col no-scrollbar overflow-y-auto`} style={{ width: '100%', height: viewMode === 'split' ? 'calc(100vh - 169px)' : '' }}>
      {viewMode === 'preview' && (
        <>
          <MarkdownPreviewPaneWriterInfoSection
            title={title}
            authorName={authorName}
            authorId={authorId}
            pageId={pageId}
            date={date}
            authorEmail={authorEmail}
            viewMode={viewMode}
            tags={tags}
            viewCount={viewCount}
          />
          {selectedSeries && (
            <SeriesIndexContainer seriesTitle={selectedSeries.title} series={selectedSeries as MySeries} authorEmail={authorEmail} authorId={authorId} />
          )}
          {/* thumbnail */}
          {thumbnailUrl && (
            <div className="w-full mt-4">
              <Image src={thumbnailUrl} alt="Thumbnail" width={1000} height={1000} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </>
      )}
      <div className={`flex-1 p-4 prose prose-lg dark:prose-invert
        [&_.katex]:text-inherit [&_.katex-display]:my-6 [&_.katex-display]:text-center
        [&_.katex-html]:text-inherit [&_.katex-mathml]:hidden
        dark:[&_.katex]:text-gray-100 dark:[&_.katex-display]:text-gray-100
        [&_.katex-display]:overflow-x-auto ${viewMode === 'split' ? '[&_.katex-display]:overflow-y-hidden' : ''}
        overflow-x-hidden
        no-scrollbar
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
          {processContent(content) || ''}
        </ReactMarkdown>
      </div>
      {/* viewMode === 'preview' */}
      {viewMode === 'preview' &&
        <>
          {/* author avatar */}
          <SelfIntroduction userProfile={authorProfile} isPreview={true} />
          {/* <SelfIntroduction userProfile={userProfile} isPreview={true} /> */}
          {/* leave comments */}
          {(!isShowingRepliesCommentId && !isBeingEditedCommentId && !isBeingEditedReplyId) && (
            <LeaveComments pageId={pageId} commentsCount={comments.length} canInteract={Boolean(getAuth(firebaseApp).currentUser)} />
          )}
          {/* comments section */}
          <CommentsSection comments={comments} pageId={pageId} canInteract={Boolean(getAuth(firebaseApp).currentUser)} />
        </>}
    </div >
  );
};

export default MarkdownPreviewPane;