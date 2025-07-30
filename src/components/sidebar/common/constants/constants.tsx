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
import { addToFavorites, duplicateNote, isNoteFavorite, moveToTrash, removeFromFavorites, toggleNotePublic } from '@/services/firebase';
import { toast } from 'react-hot-toast';

const iconStyle = { fontSize: '16px' }

export const tabsForMoreOptionsSidebar = (selectedNoteId: string, folderName: string, isPublic: boolean, isInFavorites: boolean) => [
  {
    title: `${isInFavorites ? 'Remove from' : 'Add to'} Favorites`,
    icon: [<StarIcon key='starIcon' style={iconStyle} />, <StarBorderIcon key='starBorderIcon' style={iconStyle} />],
    onClick: async() => { 
      // const isInFavorites = await isNoteFavorite(selectedNoteId);
      if (isInFavorites) {
        await removeFromFavorites(selectedNoteId);
        toast.success('Note removed from favorites');
      } else {
        await addToFavorites(selectedNoteId);
        toast.success('Note added to favorites');
      }
    }
  },
  {
    title: 'Copy link',
    icon: [<LinkIcon key='linkIcon' style={iconStyle} />],
    onClick: async() => {
      const noteUrl = `${window.location.origin}/note/${selectedNoteId}`;
      try {
        await navigator.clipboard.writeText(noteUrl);
        toast.success('Note link copied to clipboard!');
      } catch (error) {
        console.error('Error copying link:', error);
        toast.error('Failed to copy link');
      }
     }
  },
  {
    title: 'Duplicate',
    icon: [<ContentCopyIcon key='contentCopyIcon' style={iconStyle} />],
    onClick: async() => await duplicateNote(selectedNoteId)
  },
  {
    title: 'Rename',
    icon: [<EditSharpIcon key='editSharpIcon' style={iconStyle} />],
    onClick: () => { }
  },
  {
    // If the note is in the public folder, then the title should be 'Move to the Private folder'
    // If the note is in the private folder, then the title should be 'Move to the Public folder'
    title: `Move to the ${isPublic ? 'Private' : 'Public'} folder`,
    icon: [<TurnRightRoundedIcon key='turnRightRoundedIcon' style={iconStyle} />],
    onClick: async() => await toggleNotePublic(selectedNoteId)
  },
  {
    title: 'Move to Trash',
    icon: [<DeleteOutlineOutlinedIcon key='deleteOutlineOutlinedIcon' style={iconStyle} />],
    onClick: async() => await moveToTrash(selectedNoteId)
  },
  {
    title: 'Open in new tab',
    icon: [<NorthEastOutlinedIcon key='northEastOutlinedIcon' style={iconStyle} />],
    onClick: () => {
      const noteUrl = `${window.location.origin}/note/${selectedNoteId}`;
      window.open(noteUrl, '_blank');
     }
  },
  {
    title: 'Open in new window',
    icon: [<OpenInBrowserOutlinedIcon key='openInBrowserOutlinedIcon' style={iconStyle} />],
    onClick: () => { 
      const noteUrl = `${window.location.origin}/note/${selectedNoteId}`;
      const opts = `toolbar=yes, scrollbars=yes, resizable=yes, width=${window.innerWidth}, height=${window.innerHeight}`;
      window.open(noteUrl, '_blank', opts);
    }
  },
  {
    title: 'Open in side peek',
    icon: [<ViewSidebarIcon key='viewSidebarIcon' style={iconStyle} />],
    onClick: () => { }
  }
]