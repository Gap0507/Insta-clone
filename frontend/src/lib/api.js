import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token handling utilities
const TOKEN_KEY = 'instaToken';
const USER_KEY = 'user';
const LOGIN_KEY = 'isLoggedIn';

// Authentication API
export const auth = {
  // Get Instagram auth URL
  getAuthUrl: async () => {
    const response = await api.get('/auth/instagram');
    return response.data.authUrl;
  },
  
  // Exchange code for token
  handleCallback: async (code) => {
    try {
      const response = await api.post('/auth/callback', { code });
      
      if (response.data.success && response.data.token) {
        // Store token and user data in local storage
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        localStorage.setItem(LOGIN_KEY, 'true');
        
        // Update axios default headers for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('API error in handleCallback:', error);
      
      // Extract error message in a safe way
      let errorMessage = 'Authentication failed';
      if (error.response && error.response.data) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : JSON.stringify(error.response.data.error);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOGIN_KEY);
    
    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && localStorage.getItem(LOGIN_KEY) === 'true';
  },
  
  // Initialize auth state (should be called when app loads)
  initAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// User API
export const user = {
  // Get user profile
  getProfile: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');
    
    try {
      // Include token in two ways to ensure it's received properly
      const response = await api.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: { token }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Media API
export const media = {
  // Get user media feed
  getFeed: async (limit = 10) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');
    
    try {
      const response = await api.get('/media/feed', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: { token, limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching media feed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get comments for a media
  getComments: async (mediaId) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');
    
    try {
      const response = await api.get(`/media/${mediaId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: { token }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add a comment to a media
  addComment: async (mediaId, message) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');
    
    try {
      const response = await api.post(`/media/${mediaId}/comment`, 
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error posting comment:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Reply to a comment
  replyToComment: async (commentId, message) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');
    
    try {
      const response = await api.post(`/media/${commentId}/reply`, 
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error replying to comment:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Initialize auth state when this module is imported
auth.initAuth();

export default {
  auth,
  user,
  media
};