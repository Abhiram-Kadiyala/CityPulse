import axios from 'axios';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Origin that serves /uploads (the API URL without the trailing /api)
export const ASSET_ORIGIN = API_URL.replace(/\/api\/?$/, '');
export const assetUrl = p => (p ? `${ASSET_ORIGIN}${p}` : '');
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('citypulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
