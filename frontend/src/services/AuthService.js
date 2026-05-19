import api from '../shared/api/axiosConfig';

const TOKEN_KEY = 'token';

export const AuthService = {
  /**
   * Log in user with credentials and cache the JWT token.
   * @param {Object} credentials - The email and password credentials.
   * @returns {Promise<Object>} The API response data containing success status and payload.
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    if (data.isSuccess && data.data?.token) {
      localStorage.setItem(TOKEN_KEY, data.data.token);
    }
    return data;
  },

  /**
   * Register a new user, automatically logging them in and caching the token.
   * @param {Object} userData - The registration data.
   * @returns {Promise<Object>} The API response data.
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data;
    if (data.isSuccess && data.data?.token) {
      localStorage.setItem(TOKEN_KEY, data.data.token);
    }
    return data;
  },

  /**
   * Log out the current user by removing the JWT token from storage.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Fetch the current user profile based on the active session.
   * @returns {Promise<Object>} The API response data containing user info.
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Retrieve the cached JWT token from local storage.
   * @returns {string|null} The cached token string or null if not found.
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  }
};
