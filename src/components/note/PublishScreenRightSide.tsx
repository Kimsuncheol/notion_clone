import React from 'react';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { grayColor1, mintColor1, mintColor2 } from '@/constants/color';
import { MySeries } from '@/types/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface PublishScreenRightSideProps {
  url: string;
  pageId?: string;
  existingSeries: MySeries | null;
  visibility: 'public' | 'private';
  isPublishHover: boolean;
  isAddToSeriesHover: boolean;
  isPublished?: boolean;
  setVisibility: (value: 'public' | 'private') => void;
  setIsPublishHover: (value: boolean) => void;
  setIsAddToSeriesHover: (value: boolean) => void;
  setIsAddToSeriesWidgetOpen: (value: boolean) => void;
  onCancel: () => void;
  onPublish: () => void;
}

const PublishScreenRightSide = ({
  url,
  pageId,
  existingSeries,
  visibility,
  isPublished,
  isPublishHover,
  isAddToSeriesHover,
  setVisibility,
  setIsPublishHover,
  setIsAddToSeriesHover,
  setIsAddToSeriesWidgetOpen,
  onCancel,
  onPublish
}: PublishScreenRightSideProps) => {
  const { selectedSeries, setSelectedSeries } = useMarkdownStore();
  return (
    <div className="flex-1 max-w-sm">
      <h2 className="text-lg font-bold mb-4">Public Settings</h2>

      {/* Visibility Toggle */}
      <div className="mb-6">
        <div className="flex gap-2">
          <PublishScreenRightSideButton
            visibility={visibility}
            setVisibility={setVisibility}
            icon={<PublicOutlinedIcon sx={{ fontSize: 16 }} />}
            text="Public"
            buttonType="public"
          />
          <PublishScreenRightSideButton
            visibility={visibility}
            setVisibility={setVisibility}
            icon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
            text="Private"
            buttonType="private"
          />
        </div>
      </div>

      {/* URL Settings */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3">URL Settings</h3>
        <div className="text-gray-400 text-sm">{url}</div>
      </div>

      {/* Series Settings */}
      <div className="mb-8">
        <h3 className="text-white font-bold mb-2">Series Settings</h3>
        {selectedSeries?.title || existingSeries?.title ? (
          <div>
            <div className="text-gray-400 flex items-center justify-between py-[10px] pl-4">
              <span className='font-bold'>{selectedSeries?.title || existingSeries?.title}</span>
              <div
                className='w-10 rounded-r-md h-10 flex items-center justify-center'
                style={{ backgroundColor: mintColor1 }}
                onClick={() => setIsAddToSeriesWidgetOpen(true)}
              >
                <SettingsIcon sx={{ fontSize: 24, color: 'white' }} />
              </div>
            </div>
            <div className="text-red-600 text-sm text-right" onClick={() => setSelectedSeries(null)}>Remove from series</div>
          </div>
        ) : (
          <div
            className=" flex items-center justify-center transition-colors text-sm font-bold cursor-pointer px-4 py-2 rounded"
            onClick={() => setIsAddToSeriesWidgetOpen(true)}
            style={{
              backgroundColor: grayColor1,
              color: isAddToSeriesHover ? mintColor2 : mintColor1
            }}
            onMouseEnter={() => setIsAddToSeriesHover(true)}
            onMouseLeave={() => setIsAddToSeriesHover(false)}
          >
            <AddIcon className="w-4 h-4 mr-2" />
            Add to Series
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div
          className="flex-1 px-6 py-2 bg-transparent border border-gray-600 text-gray-300 rounded hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm font-bold cursor-pointer text-center"
          onClick={onCancel}
        >
          Cancel
        </div>
        <div
          className="flex-1 px-6 py-2 text-white rounded transition-colors text-sm font-bold cursor-pointer text-center"
          // If the publish function works well, 'onCancel' should works here too
          // onClick={() => onPublish()}
          onClick={onPublish}
          onMouseEnter={() => setIsPublishHover(true)}
          onMouseLeave={() => setIsPublishHover(false)}
          style={{
            backgroundColor: isPublishHover ? mintColor2 : mintColor1,
            color: 'black'
          }}
        >
          { pageId && isPublished ? 'Update' : 'Publish' }
        </div>
      </div>
    </div>
  );
};

export default PublishScreenRightSide;

function PublishScreenRightSideButton({
  visibility,
  setVisibility,
  icon,
  text,
  buttonType
}: {
  visibility: 'public' | 'private',
  setVisibility: (value: 'public' | 'private') => void,
  icon: React.ReactNode,
  text: string,
  buttonType: 'public' | 'private'
}) {
  const isActive = visibility === buttonType;
  
  return (
    <div
      onClick={() => setVisibility(buttonType)}
      className={`flex-1 flex items-center justify-center px-4 py-2 rounded border text-sm font-bold transition-colors cursor-pointer gap-2 group`}
      style={{
        borderColor: isActive ? mintColor1 : 'white',
        color: isActive ? mintColor1 : 'white',
      }}
    >
      <span 
        className="transition-colors group-hover:text-[#5DFDCB]"
        style={{ 
          color: isActive ? mintColor1 : 'white'
        }}
      >
        {icon}
      </span>
      <span 
        className="transition-colors group-hover:text-[#5DFDCB]"
        style={{ 
          color: isActive ? mintColor1 : 'white'
        }}
      >
        {text}
      </span>
      
      <style jsx>{`
        .group:hover {
          border-color: ${mintColor2} !important;
        }
        .group:hover span {
          color: ${mintColor2} !important;
        }
        .group:hover svg {
          color: ${mintColor2} !important;
        }
      `}</style>
    </div>
  )
}