import axios from 'axios';

// Use the environment variable with the VITE_ prefix
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',  // Fallback to localhost in dev
});

export default api;
