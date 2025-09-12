// convert %40 to @
export const convertToNormalUserEmail = (userIdfromUrl: string) => {
  return userIdfromUrl.replace('%40', '@');
};