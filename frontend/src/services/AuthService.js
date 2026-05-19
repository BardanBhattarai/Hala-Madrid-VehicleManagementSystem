import api from '../shared/api/axiosConfig';

const TOKEN_KEY = 'token';

/**
 * Base64 JWT Token Decoder to parse the payload payload claims.
 * @param {string} token - The JWT token.
 * @returns {Object|null} Decoded JSON payload or null.
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    console.log('[DEBUG] Decoded JWT Token payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('[DEBUG] Failed to decode token:', error);
    return null;
  }
};

/**
 * Helper to safely extract the role claim from JWT claims.
 * Supports standard "role" claim and ASP.NET Core identity claim schemas.
 * @param {Object} decodedToken - The decoded token payload.
 * @returns {string} The extracted role name.
 */
export const extractRole = (decodedToken) => {
  if (!decodedToken) return '';
  const role =
    decodedToken['role'] ||
    decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    '';
  console.log('[DEBUG] Extracted Role from claims:', role);
  return role;
};

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
      console.log('[DEBUG] Login response payload:', data.data);
      const decoded = decodeToken(data.data.token);
      const extracted = extractRole(decoded);
      console.log('[DEBUG] User successfully logged in. Extracted Role:', extracted);
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
      console.log('[DEBUG] Registration response payload:', data.data);
      const decoded = decodeToken(data.data.token);
      const extracted = extractRole(decoded);
      console.log('[DEBUG] User successfully registered. Extracted Role:', extracted);
    }
    return data;
  },

  /**
   * Log out the current user by removing the JWT token from storage.
   */
  logout: () => {
    console.log('[DEBUG] Clearing token from local storage. Logging out...');
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Fetch the current user profile based on the active session.
   * @returns {Promise<Object>} The API response data containing user info.
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const data = response.data;
    if (data.isSuccess && data.data) {
      console.log('[DEBUG] GetCurrentUser profile from backend:', data.data);
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const decoded = decodeToken(token);
        const extracted = extractRole(decoded);
        console.log('[DEBUG] Token Role matches profile Role:', extracted === data.data.role);
      }
    }
    return data;
  },

  /**
   * Retrieve the cached JWT token from local storage.
   * @returns {string|null} The cached token string or null if not found.
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

