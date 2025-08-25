import React, { useState } from 'react';
import ImageIcon from '@mui/icons-material/Image';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AddIcon from '@mui/icons-material/Add';


const KoreanPublishScreen = () => {
  const [title, setTitle] = useState('dass');
  const [description, setDescription] = useState('dssd');
  const [isPublic, setIsPublic] = useState(true);
  const [url, setUrl] = useState('/@cheonjae6/dass');

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Main Content Area */}
        <div className="flex gap-8 items-start">
          
          {/* Left Side - Post Preview */}
          <div className="flex-1 max-w-md">
            <h2 className="text-lg font-medium mb-6 text-center">Preview Post</h2>
            
            {/* Thumbnail Upload Area */}
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 text-center">
              <ImageIcon sx={{ fontSize: 64, color: 'gray', opacity: 0.5, marginBottom: '16px', marginX: 'auto' }} />
              <button className="text-green-400 text-sm hover:text-green-300 transition-colors">
                Upload thumbnail
              </button>
            </div>
            
            {/* Title */}
            <div className="mb-2">
              <h3 className="text-white font-medium text-lg">{title}</h3>
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
            
            {/* Character Count */}
            <div className="text-right">
              <span className="text-gray-500 text-xs">{description.length}/150</span>
            </div>
          </div>
          
          {/* Right Side - Settings */}
          <div className="flex-1 max-w-sm">
            <h2 className="text-lg font-medium mb-6">Public Settings</h2>
            
            {/* Visibility Toggle */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    isPublic 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <PublicOutlinedIcon className="w-4 h-4 inline mr-2" />
                  Public
                </button>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    !isPublic 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <LockOutlinedIcon className="w-4 h-4 inline mr-2" sx={{ fontSize: 16, color: 'gray', opacity: 0.5 }} />
                  Private
                </button>
              </div>
            </div>
            
            {/* URL Settings */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">URL 설정</h3>
              <div className="text-gray-400 text-sm">{url}</div>
            </div>
            
            {/* Series Settings */}
            <div className="mb-8">
              <h3 className="text-white font-medium mb-3">Series Settings</h3>
              <button className="flex items-center text-green-400 hover:text-green-300 transition-colors text-sm">
                <AddIcon className="w-4 h-4 mr-2" />
                Add to Series
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-6 py-2 bg-transparent border border-gray-600 text-gray-300 rounded hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm">
                Cancel
              </button>
              <button className="flex-1 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KoreanPublishScreen;