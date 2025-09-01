import React, { useState } from 'react';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShareIcon from '@mui/icons-material/Share';
import { grayColor2 } from '@/constants/color';


export default function StickySocialSidebar() {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    // Share functionality - could integrate with Web Share API or copy link
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed left-[10%] top-1/2 transform -translate-y-1/2 z-50">
      <div className="backdrop-blur-sm rounded-full p-2 flex flex-col items-center space-y-4 shadow-lg" style={{ backgroundColor: grayColor2 }}>
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <div
            onClick={handleLike}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group"
          >
            <FavoriteBorderOutlinedIcon
              sx={{
                transition: 'color 0.2s, fill 0.2s',
                ...(isLiked
                  ? { fill: 'red', color: 'red' }
                  : {
                      color: 'grey.400',
                      '@media (hover: hover)': {
                        '.group:hover &': {
                          color: 'white'
                        }
                      }
                    }
                )
              }}
            />
          </div>
          <span className="text-white text-sm font-medium mt-2">{likes}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <div
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group"
          >
            <ShareIcon
              sx={{
                color: 'grey.400',
                transition: 'color 0.2s',
                '@media (hover: hover)': {
                  '.group:hover &': {
                    color: 'white'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}