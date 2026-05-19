import axios from 'axios';

const RENDER_BACKEND = 'https://travel-web-8q4s.onrender.com';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return RENDER_BACKEND;
};

export const BASE_URL = getBaseURL();

// Handles both Cloudinary URLs (https://...) and legacy local paths (/uploads/...)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${BASE_URL}${imagePath}`;
};

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
