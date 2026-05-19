import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5051/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Auth team member adds JWT interceptor here:
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — normalizes error handling ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired or unauthorized token sessions
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Prevent circular redirection loop if already on authentication screens
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }

    // Network failure (no response from server)
    if (!error.response) {
      error.userMessage = 'Network error — please check your connection and try again.';
      return Promise.reject(error);
    }

    // Extract the standardized error message from ApiResponse
    const data = error.response.data;
    const message =
      data?.message ||
      (data?.errors && data.errors.length > 0
        ? data.errors.join('. ')
        : null) ||
      `Request failed with status ${error.response.status}`;

    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
