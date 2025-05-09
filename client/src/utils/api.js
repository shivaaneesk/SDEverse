import axios from 'axios';

// You can set the base URL here for all requests
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Assuming the backend is running on the same domain
});

export default api;
