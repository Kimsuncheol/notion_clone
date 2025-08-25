import React from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { editorBgColor } from '@/constants/color';

const MarkdownEditorBottomBar = () => {
  return (
    <div className="fixed bottom-0 left-60 border-t border-r border-gray-700 px-4 py-3 z-10" style={{ backgroundColor: editorBgColor, width: 'calc(50% - 120px)' }}>
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Left Side - Back Button */}
        <button className="flex items-center text-white hover:text-gray-300 transition-colors" onClick={() => {
          window.history.back();
        }}>
          <ArrowBackIosIcon sx={{ fontSize: 20, color: 'gray', marginRight: '8px' }} />
          <span className="text-base font-medium">Back</span>
        </button>
        
        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="text-white hover:text-gray-300 transition-colors text-base font-medium">
            Save
          </button>
          <button className="px-6 py-2 bg-green-400 text-gray-900 rounded-lg hover:bg-green-300 transition-colors text-base font-medium">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorBottomBar;