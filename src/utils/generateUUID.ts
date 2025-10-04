export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID.
  const getRandomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);

  return `${getRandomHex()}${getRandomHex()}-${getRandomHex()}-${getRandomHex()}-${getRandomHex()}-${getRandomHex()}${getRandomHex()}${getRandomHex()}`;
};
