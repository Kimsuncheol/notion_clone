import React, { useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { grayColor2, mintColor2, mintColor1 } from '@/constants/color';

interface MarkdownEditorBottomBarProps {
  saveDraft: () => void;
  showPublishScreen: () => void;
}

const MarkdownEditorBottomBar = ({ saveDraft, showPublishScreen }: MarkdownEditorBottomBarProps) => {
  const [isPublishHover, setIsPublishHover] = useState<boolean>(false);

  return (
    <div className="fixed bottom-0 border-t border-r border-gray-700 w-[calc(45%)] px-4 py-3 z-10" style={{ backgroundColor: grayColor2}}>
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Left Side - Back Button */}
        <div className="flex items-center text-white hover:text-gray-300 transition-colors" onClick={() => {
          window.history.back();
        }}>
          <ArrowBackIosIcon sx={{ fontSize: 20, color: 'gray', marginRight: '8px' }} />
          <span className="text-base font-bold">Back</span>
        </div>
        
        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="text-white hover:text-gray-300 transition-colors text-base font-bold cursor-pointer" onClick={saveDraft}>
            Save draft
          </div>
          <div className="px-6 py-2 rounded-lg transition-colors text-base font-bold cursor-pointer" onClick={showPublishScreen}
            onMouseEnter={() => setIsPublishHover(true)}
            onMouseLeave={() => setIsPublishHover(false)}
            style={{backgroundColor: isPublishHover ? mintColor2 : mintColor1, color: 'black'}}
          >
            Publish
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorBottomBar;