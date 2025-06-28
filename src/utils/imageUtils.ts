export const getImageMimeType = (base64: string): string => {
  const signatures = {
    '/9j/': 'image/jpeg',
    'iVBORw0KGgo': 'image/png',
    'R0lGODlh': 'image/gif',
    'UklGR': 'image/webp',
    'PHN2Zw': 'image/svg+xml'
  };

  for (const [signature, mimeType] of Object.entries(signatures)) {
    if (base64.startsWith(signature)) {
      return mimeType;
    }
    }
  
  return 'image/jpeg';
};

export const createImageDataUrl = (base64: string): string => {
  if (!base64) return '';
  
  const mimeType = getImageMimeType(base64);
  return `data:${mimeType};base64,${base64}`;
};

export const isValidBase64 = (base64: string): boolean => {
  try {
    return btoa(atob(base64)) === base64;
  } catch (err) {
    return false;
  }
};

export const createFallbackImage = (width: number = 200, height: number = 200): string => {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="var(--mantine-color-gray-1)"/>
      <g opacity="0.5">
        <path d="M${width * 0.375} ${height * 0.375}L${width * 0.625} ${height * 0.625}M${width * 0.625} ${height * 0.375}L${width * 0.375} ${height * 0.625}" 
              stroke="var(--mantine-color-gray-5)" 
              stroke-width="2" 
              stroke-linecap="round"/>
      </g>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}; 