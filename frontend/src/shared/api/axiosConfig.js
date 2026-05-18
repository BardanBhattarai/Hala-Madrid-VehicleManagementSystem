import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5051/api',
  headers: { 'Content-Type': 'application/json' }
});

// MERGE: Auth team member adds JWT interceptor here:
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
