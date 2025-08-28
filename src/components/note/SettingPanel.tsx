import React from 'react';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { grayColor1, mintColor1, mintColor2 } from '@/constants/color';

interface SettingsPanelProps {
  url: string;
  selectedSeries: string;
  isPublic: boolean;
  isPrivate: boolean;
  isPublicHover: boolean;
  isPrivateHover: boolean;
  isPublishHover: boolean;
  isAddToSeriesHover: boolean;
  setIsPublic: (value: boolean) => void;
  setIsPrivate: (value: boolean) => void;
  setIsPublicHover: (value: boolean) => void;
  setIsPrivateHover: (value: boolean) => void;
  setIsPublishHover: (value: boolean) => void;
  setIsAddToSeriesHover: (value: boolean) => void;
  setIsAddToSeriesWidgetOpen: (value: boolean) => void;
  setSelectSeries: (series: string) => void;
  onCancel: () => void;
  onPublish: () => void;
}

const SettingsPanel = ({
  url,
  selectedSeries,
  isPublic,
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
  setSelectSeries,
  onCancel,
  onPublish
}: SettingsPanelProps) => {
  return (
    <div className="flex-1 max-w-sm">
      <h2 className="text-lg font-bold mb-4">Public Settings</h2>

      {/* Visibility Toggle */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div
            onClick={() => {
              setIsPublic(true);
              setIsPrivate(false);
            }}
            onMouseEnter={() => setIsPublicHover(true)}
            onMouseLeave={() => setIsPublicHover(false)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded border text-sm font-bold transition-colors text-white cursor-pointer`}
            style={{
              borderColor: isPublicHover ? mintColor2 : isPublic ? mintColor1 : 'white',
              color: isPublicHover ? mintColor2 : isPublic ? mintColor1 : 'white',
            }}
          >
            <PublicOutlinedIcon
              className="w-4 h-4 inline mr-2"
              sx={{
                fontSize: 16,
                color: isPublicHover ? mintColor2 : isPublic ? mintColor1 : 'white'
              }}
            />
            Public
          </div>
          <div
            onClick={() => {
              setIsPublic(false);
              setIsPrivate(true);
            }}
            onMouseEnter={() => setIsPrivateHover(true)}
            onMouseLeave={() => setIsPrivateHover(false)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded border text-sm font-bold transition-colors text-white cursor-pointer`}
            style={{
              borderColor: isPrivateHover ? mintColor2 : isPrivate ? mintColor1 : 'white',
              color: isPrivateHover ? mintColor2 : isPrivate ? mintColor1 : 'white',
            }}
          >
            <LockOutlinedIcon
              className="w-4 h-4 inline mr-2"
              sx={{
                fontSize: 16,
                color: isPrivateHover ? mintColor2 : isPrivate ? mintColor1 : 'white'
              }}
            />
            Private
          </div>
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
        {selectedSeries ? (
          <div>
            <div className="text-gray-400 flex items-center justify-between py-[10px] pl-4">
              <span className='font-bold'>{selectedSeries}</span>
              <div
                className='w-10 rounded-r-md h-10 flex items-center justify-center'
                style={{ backgroundColor: mintColor1 }}
                onClick={() => setIsAddToSeriesWidgetOpen(true)}
              >
                <SettingsIcon sx={{ fontSize: 24, color: 'white' }} />
              </div>
            </div>
            <div className="text-red-600 text-sm text-right" onClick={() => setSelectSeries('')}>Remove from series</div>
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
          onClick={onPublish}
          onMouseEnter={() => setIsPublishHover(true)}
          onMouseLeave={() => setIsPublishHover(false)}
          style={{
            backgroundColor: isPublishHover ? mintColor2 : mintColor1,
            color: 'black'
          }}
        >
          Publish
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;