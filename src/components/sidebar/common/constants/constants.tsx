'use client';

import { useRouter } from 'next/navigation';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TurnRightRoundedIcon from '@mui/icons-material/TurnRightRounded';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import NorthEastOutlinedIcon from '@mui/icons-material/NorthEastOutlined';
import OpenInBrowserOutlinedIcon from '@mui/icons-material/OpenInBrowserOutlined';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import * as actions from '@/store/actions';

const iconStyle = { fontSize: '16px' }

type AppRouter = ReturnType<typeof useRouter>;

export const resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId = () => {
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowMoreOptionsSidebarForFavorites();
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowAddaSubNoteSidebarForFavorites();
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowMoreOptionsSidebarForFolderTree();
  useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore.getState().resetShowAddaSubNoteSidebarForFolderTree();
}

export const tabsForMoreOptionsSidebar = (selectedNoteId: string, folderName: string, isPublic: boolean, isInFavorites: boolean, router: AppRouter) => [
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
    title: 'Open in new window',
    icon: [<OpenInBrowserOutlinedIcon key='openInBrowserOutlinedIcon' style={iconStyle} />],
    action: actions.handleOpenInNewWindow,
  },
  {
    title: 'Open in side peek',
    icon: [<ViewSidebarIcon key='viewSidebarIcon' style={iconStyle} />],
    action: actions.handleOpenInSidePeek,
  }
]