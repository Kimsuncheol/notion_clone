// Gradient and Color Collections for ImagePickerModal
// CSS gradients and solid colors for backgrounds

export interface GradientColor {
  id: string;
  name: string;
  type: 'gradient' | 'solid';
  value: string; // CSS background value
  preview?: string; // Optional preview color for thumbnails
}

// Solid Colors Collection
export const solidColors: GradientColor[] = [
  { id: 'red', name: 'Red', type: 'solid', value: '#ef4444', preview: '#ef4444' },
  { id: 'blue', name: 'Blue', type: 'solid', value: '#3b82f6', preview: '#3b82f6' },
  { id: 'green', name: 'Green', type: 'solid', value: '#22c55e', preview: '#22c55e' },
  { id: 'yellow', name: 'Yellow', type: 'solid', value: '#eab308', preview: '#eab308' },
  { id: 'purple', name: 'Purple', type: 'solid', value: '#a855f7', preview: '#a855f7' },
  { id: 'pink', name: 'Pink', type: 'solid', value: '#ec4899', preview: '#ec4899' },
  { id: 'orange', name: 'Orange', type: 'solid', value: '#f97316', preview: '#f97316' },
  { id: 'teal', name: 'Teal', type: 'solid', value: '#14b8a6', preview: '#14b8a6' },
  { id: 'indigo', name: 'Indigo', type: 'solid', value: '#6366f1', preview: '#6366f1' },
  { id: 'gray', name: 'Gray', type: 'solid', value: '#6b7280', preview: '#6b7280' },
  { id: 'black', name: 'Black', type: 'solid', value: '#1f2937', preview: '#1f2937' },
  { id: 'white', name: 'White', type: 'solid', value: '#f9fafb', preview: '#f9fafb' },
];

// Gradient Collection
export const gradientColors: GradientColor[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
    preview: '#ff6b6b'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: '#667eea'
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    preview: '#11998e'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: '#a8edea'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    preview: '#ff9a9e'
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667db6 0%, #0082c8 50%, #0082c8 100%, #667db6 100%)',
    preview: '#667db6'
  },
  {
    id: 'peachy',
    name: 'Peachy',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ffccbc 0%, #ff8a65 100%)',
    preview: '#ffccbc'
  },
  {
    id: 'violet',
    name: 'Violet Dreams',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: '#667eea'
  },
  {
    id: 'mint',
    name: 'Fresh Mint',
    type: 'gradient',
    value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    preview: '#84fab0'
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    preview: '#fbc2eb'
  },
  {
    id: 'fire',
    name: 'Fire',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: '#fa709a'
  },
  {
    id: 'sky',
    name: 'Clear Sky',
    type: 'gradient',
    value: 'linear-gradient(135deg, #87ceeb 0%, #98fb98 100%)',
    preview: '#87ceeb'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    type: 'gradient',
    value: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    preview: '#c471f5'
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    preview: '#f6d365'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    type: 'gradient',
    value: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    preview: '#56ab2f'
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ed4264 0%, #ffedbc 100%)',
    preview: '#ed4264'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
    preview: '#2c3e50'
  },
  {
    id: 'tropical',
    name: 'Tropical',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)',
    preview: '#1fa2ff'
  },
  {
    id: 'berry',
    name: 'Mixed Berry',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff6b95 0%, #c44569 100%)',
    preview: '#ff6b95'
  },
  {
    id: 'glacier',
    name: 'Glacier',
    type: 'gradient',
    value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    preview: '#d299c2'
  },
];

// Combined collection for easy access
export const allColorGradients: GradientColor[] = [...solidColors, ...gradientColors];

// Utility functions
export const getSolidColors = (): GradientColor[] => solidColors;
export const getGradientColors = (): GradientColor[] => gradientColors;
export const getAllColorGradients = (): GradientColor[] => allColorGradients;

// Function to get color/gradient by ID
export const getColorGradientById = (id: string): GradientColor | undefined => {
  return allColorGradients.find(item => item.id === id);
};

// Function to generate CSS style object
export const generateCSSStyle = (colorGradient: GradientColor): React.CSSProperties => {
  if (colorGradient.type === 'solid') {
    return { backgroundColor: colorGradient.value };
  } else {
    return { backgroundImage: colorGradient.value };
  }
};

// Function to convert gradient/color to data URL for use as image src
export const colorGradientToDataUrl = (colorGradient: GradientColor, width = 100, height = 100): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  if (colorGradient.type === 'solid') {
    ctx.fillStyle = colorGradient.value;
    ctx.fillRect(0, 0, width, height);
  } else {
    // For gradients, create a simple representation
    // This is a simplified approach - in a real implementation you might want to parse the CSS gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colorGradient.preview || '#ffffff');
    gradient.addColorStop(1, colorGradient.value.includes('#') ? colorGradient.value.split('#')[1] : '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
};

// Function to create SVG data URL for gradients (better approach)
export const createGradientSVG = (colorGradient: GradientColor): string => {
  if (colorGradient.type === 'solid') {
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${colorGradient.value}"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  
  // Extract colors from CSS gradient (simplified parsing)
  const gradientValue = colorGradient.value;
  const colorMatches = gradientValue.match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi);
  const startColor = colorMatches?.[0] || colorGradient.preview || '#ff0000';
  const endColor = colorMatches?.[1] || startColor;
  
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
