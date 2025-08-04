'use client';

import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TurnRightRoundedIcon from '@mui/icons-material/TurnRightRounded';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import NorthEastOutlinedIcon from '@mui/icons-material/NorthEastOutlined';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import * as actions from '@/store/actions';

const iconStyle = { fontSize: '16px' }

export const resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId = () => {
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowMoreOptionsSidebarForFavorites();
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowAddaSubNoteSidebarForFavorites();
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowMoreOptionsSidebarForFolderTree();
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowAddaSubNoteSidebarForFolderTree();
}

export const tabsForMoreOptionsSidebar = (selectedNoteId: string, folderName: string, isPublic: boolean, isInFavorites: boolean) => [
  {
    title: `${isInFavorites ? 'Remove from' : 'Add to'} Favorites`,
    icon: [<StarIcon key='starIcon' style={iconStyle} />, <StarBorderIcon key='starBorderIcon' style={iconStyle} />],
    action: actions.handleToggleFavorite,
  },
  {
    title: 'Copy link',
    icon: [<LinkIcon key='linkIcon' style={iconStyle} />],
    action: actions.handleCopyLink,
  },
  {
    title: 'Duplicate',
    icon: [<ContentCopyIcon key='contentCopyIcon' style={iconStyle} />],
    action: actions.handleDuplicateNote,
  },
  {
    title: 'Rename',
    icon: [<EditSharpIcon key='editSharpIcon' style={iconStyle} />],
    action: actions.handleRenameNote,
  },
  {
    // If the note is in the public folder, then the title should be 'Move to the Private folder'
    // If the note is in the private folder, then the title should be 'Move to the Public folder'
    title: `Move to the ${isPublic ? 'Private' : 'Public'} folder`,
    icon: [<TurnRightRoundedIcon key='turnRightRoundedIcon' style={iconStyle} />],
    action: actions.handleMoveToFolder,
  },
  {
    title: 'Move to Trash',
    icon: [<DeleteOutlineOutlinedIcon key='deleteOutlineOutlinedIcon' style={iconStyle} />],
    action: actions.handleMoveToTrash,
  },
  {
    title: 'Open in new tab',
    icon: [<NorthEastOutlinedIcon key='northEastOutlinedIcon' style={iconStyle} />],
    action: actions.handleOpenInNewTab,
  },
  {
    title: 'Open in side peek',
    icon: [<ViewSidebarIcon key='viewSidebarIcon' style={iconStyle} />],
    action: actions.handleOpenInSidePeek,
  }
]

export const gradientImages = [
  'https://coolors.co/gradient-maker/ffcf67-d3321d',
  'https://coolors.co/gradient-maker/f9c48b-fa9372',
  'https://coolors.co/gradient-maker/638b95-f4711f',
  'https://coolors.co/gradient-maker/456fe8-19b0ec',
  'https://coolors.co/gradient-maker/b2ef91-fa9372',
  'https://coolors.co/gradient-maker/7ef29d-0f68a9',
  'https://coolors.co/gradient-maker/cad0ff-e3e3e3',
  'https://coolors.co/gradient-maker/fcb0f3-3d05dd',
  'https://coolors.co/gradient-maker/f8dadc-b6edc8-eeacdc',
  'https://coolors.co/gradient-maker/76030f-121b67',
  'https://coolors.co/gradient-maker/e9b7ce-d3f3f1',
  'https://coolors.co/gradient-maker/fdf1cb-b01041',
  'https://coolors.co/gradient-maker/45cde9-7a8fd3',
  'https://coolors.co/gradient-maker/a106f4-e707fa'
]