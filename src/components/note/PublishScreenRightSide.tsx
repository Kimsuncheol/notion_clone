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
  isPublic: boolean;
  isPrivate: boolean;
  isPublicHover: boolean;
  isPrivateHover: boolean;
  isPublishHover: boolean;
  isAddToSeriesHover: boolean;
  isPublished?: boolean;
  setIsPublic: (value: boolean) => void;
  setIsPrivate: (value: boolean) => void;
  setIsPublicHover: (value: boolean) => void;
  setIsPrivateHover: (value: boolean) => void;
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
  isPublic,
  isPublished,
  isPrivate,
  isPublicHover,
  isPrivateHover,
  isPublishHover,
  isAddToSeriesHover,
  setIsPublic,
  setIsPrivate,
  setIsPublicHover,
  setIsPrivateHover,
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
            setIsPublic={setIsPublic}
            setIsPrivate={setIsPrivate}
            setIsPublicHover={setIsPublicHover}
            setIsPrivateHover={setIsPrivateHover}
            isPublic={isPublic}
            isPrivate={isPrivate}
            isPublicHover={isPublicHover}
            isPrivateHover={isPrivateHover}
            icon={<PublicOutlinedIcon sx={{ fontSize: 16, color: isPublicHover ? mintColor2 : isPublic ? mintColor1 : 'white' }} />} text="Public" buttonType="public" />
          <PublishScreenRightSideButton
            setIsPublic={setIsPublic}
            setIsPrivate={setIsPrivate}
            setIsPublicHover={setIsPublicHover}
            setIsPrivateHover={setIsPrivateHover}
            isPublic={isPublic}
            isPrivate={isPrivate}
            isPublicHover={isPublicHover}
            isPrivateHover={isPrivateHover}
            icon={<LockOutlinedIcon sx={{ fontSize: 16, color: isPrivateHover ? mintColor2 : isPrivate ? mintColor1 : 'white' }} />} text="Private" buttonType="private" />
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
  setIsPublic,
  setIsPrivate,
  setIsPublicHover,
  setIsPrivateHover,
  isPublic,
  isPrivate,
  isPublicHover,
  isPrivateHover,
  icon,
  text,
  buttonType // Add this prop to distinguish between public/private
}: {
  setIsPublic: (value: boolean) => void,
  setIsPrivate: (value: boolean) => void,
  setIsPublicHover: (value: boolean) => void,
  setIsPrivateHover: (value: boolean) => void,
  isPublic: boolean,
  isPrivate: boolean,
  isPublicHover: boolean,
  isPrivateHover: boolean,
  icon: React.ReactNode,
  text: string,
  buttonType: 'public' | 'private' // Add this
}) {
  return (
    <div
      onClick={() => {
        if (buttonType === 'public') {
          setIsPublic(true);
          setIsPrivate(false);
        } else {
          setIsPublic(false);
          setIsPrivate(true);
        }
      }}
      onMouseEnter={() => buttonType === 'public' ? setIsPublicHover(true) : setIsPrivateHover(true)}
      onMouseLeave={() => buttonType === 'public' ? setIsPublicHover(false) : setIsPrivateHover(false)}
      className={`flex-1 flex items-center justify-center px-4 py-2 rounded border text-sm font-bold transition-colors text-white cursor-pointer gap-2`}
      style={{
        borderColor: (buttonType === 'public' ? isPublicHover : isPrivateHover) ? mintColor2 : (buttonType === 'public' ? isPublic : isPrivate) ? mintColor1 : 'white',
        color: (buttonType === 'public' ? isPublicHover : isPrivateHover) ? mintColor2 : (buttonType === 'public' ? isPublic : isPrivate) ? mintColor1 : 'white',
      }}
    >
      {icon}
      {text}
    </div>
  )
}