import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const fallbackUrl = isBrowser && window.location.hostname === 'localhost'
  ? 'http://localhost:10000'
  : '';

export const BASE_URL = import.meta.env.VITE_API_URL || fallbackUrl;

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;

