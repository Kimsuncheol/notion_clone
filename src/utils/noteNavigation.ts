export const NOTE_NAVIGATION_BLOCK_MESSAGE = 'Please clear your title and content before leaving this page.';

export const isNoteComposerPath = (pathname: string | null): boolean => {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false;
  return segments[segments.length - 1] === 'note';
};

export const isNotePath = (pathname: string | null): boolean => {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false;
  return segments.includes('note');
};

export const shouldBlockNoteNavigation = (
  pathname: string | null,
  title: string,
  content: string,
): boolean => {
  if (!isNotePath(pathname)) return false;
  return title.length !== 0 || content.length !== 0;
};
