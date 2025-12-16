export const getMediaUrl = (path) => {
  if (!path) return null;

  // Si ya es URL absoluta (Cloudinary, Unsplash, etc)
  if (path.startsWith('http')) return path;

  return `${process.env.REACT_APP_ASSETS_URL}${path}`;
};
