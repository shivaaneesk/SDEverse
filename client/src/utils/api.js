import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
});

// Automatically attach token (if it exists)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or use Redux state if preferred
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
