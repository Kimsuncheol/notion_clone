// NASA Images Collections for ImagePickerModal
// All images are from NASA's public domain collection

export interface ImageCollection {
  title: string;
  images: string[];
}

// James Webb Space Telescope Images
export const jamesWebbImages: string[] = [
  // Carina Nebula
  'https://webbtelescope.org/files/live/sites/webb/files/home/webb-science/early-release-observations/_documents/STScI-01G7DCWB7137MYJ05CSH1Q5Z1Z.png',
  
  // Stephan's Quintet
  'https://webbtelescope.org/files/live/sites/webb/files/home/webb-science/early-release-observations/_documents/STScI-01G7DCWB94478KASSXTB4XPFZ9.png',
  
  // Southern Ring Nebula
  'https://webbtelescope.org/files/live/sites/webb/files/home/webb-science/early-release-observations/_documents/STScI-01G7DCWB90V6ZHZQF8C4KAG2T7.png',
  
  // SMACS 0723 (Deep Field)
  'https://webbtelescope.org/files/live/sites/webb/files/home/webb-science/early-release-observations/_documents/STScI-01G7DCWB86XKQT5X5JTGXNPGQH.png',
  
  // Alternative URLs using NASA's image gallery (high quality, publicly available)
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000393/GSFC_20171208_Archive_e000393~orig.jpg',
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000351/GSFC_20171208_Archive_e000351~orig.jpg',
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000441/GSFC_20171208_Archive_e000441~orig.jpg',
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000450/GSFC_20171208_Archive_e000450~orig.jpg',
];

// NASA Archive Images (Classic space photography)
export const nasaArchiveImages: string[] = [
  // Earth from space
  'https://images-assets.nasa.gov/image/as11-44-6551/as11-44-6551~orig.jpg',
  
  // Moon surface
  'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~orig.jpg',
  
  // Apollo missions
  'https://images-assets.nasa.gov/image/as11-44-6549/as11-44-6549~orig.jpg',
  'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg',
  
  // Space shuttle
  'https://images-assets.nasa.gov/image/sts134-e-10075/sts134-e-10075~orig.jpg',
  
  // Hubble images
  'https://images-assets.nasa.gov/image/hubble-captures-a-cosmic-collision-in-stephan-s-quintet_52259821562_o/hubble-captures-a-cosmic-collision-in-stephan-s-quintet_52259821562_o~orig.jpg',
  
  // Mars exploration
  'https://images-assets.nasa.gov/image/PIA00069/PIA00069~orig.jpg',
  
  // Saturn
  'https://images-assets.nasa.gov/image/PIA21773/PIA21773~orig.jpg',
  
  // Jupiter
  'https://images-assets.nasa.gov/image/PIA22946/PIA22946~orig.jpg',
  
  // Venus
  'https://images-assets.nasa.gov/image/PIA00072/PIA00072~orig.jpg',
];

// Alternative image sources (in case primary URLs fail)
export const fallbackJamesWebbImages: string[] = [
  'https://science.nasa.gov/wp-content/uploads/2023/09/carina-nebula-jpg.webp',
  'https://science.nasa.gov/wp-content/uploads/2023/09/stephans-quintet-sq-jpg.webp',
  'https://science.nasa.gov/wp-content/uploads/2023/09/southern-ring-nebula-jpg.webp',
  'https://science.nasa.gov/wp-content/uploads/2023/09/smacs-0723-jpg.webp',
];

export const fallbackNasaArchiveImages: string[] = [
  'https://science.nasa.gov/wp-content/uploads/2023/09/blue-marble-apollo-17-jpg.webp',
  'https://science.nasa.gov/wp-content/uploads/2023/09/apollo-11-aldrin-jpg.webp',
  'https://science.nasa.gov/wp-content/uploads/2023/09/saturn-cassini-jpg.webp',
  'https://science.nasa.gov/wp-content/uploads/2023/09/jupiter-juno-jpg.webp',
];

// Utility function to get images with fallback
export const getJamesWebbImages = (): string[] => {
  return [...jamesWebbImages, ...fallbackJamesWebbImages];
};

export const getNasaArchiveImages = (): string[] => {
  return [...nasaArchiveImages, ...fallbackNasaArchiveImages];
};

// Function to validate image URL (optional utility)
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Function to get available images (filters out broken URLs)
export const getAvailableImages = async (imageUrls: string[]): Promise<string[]> => {
  const validationPromises = imageUrls.map(async (url) => {
    const isValid = await validateImageUrl(url);
    return isValid ? url : null;
  });
  
  const results = await Promise.all(validationPromises);
  return results.filter((url): url is string => url !== null);
};

// Image collections export
export const imageCollections: ImageCollection[] = [
  {
    title: 'James Webb Telescope',
    images: getJamesWebbImages(),
  },
  {
    title: 'NASA Archive',
    images: getNasaArchiveImages(),
  },
];
