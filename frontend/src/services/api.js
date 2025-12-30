import axios from 'axios';

// Base URL for your Flask backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Export API methods
export const careerAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Health check failed';
      throw new Error(errorMessage);
    }
  },

  // Job Matcher
  jobMatcher: async (data) => {
    try {
      const response = await api.post('/job-matcher', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Job matcher failed';
      throw new Error(errorMessage);
    }
  },

  // Career Ideator
  careerIdeator: async (data) => {
    try {
      const response = await api.post('/career-ideator', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Career ideator failed';
      throw new Error(errorMessage);
    }
  },

  // Career Requirements
  careerRequirements: async (data) => {
    try {
      const response = await api.post('/career-requirements', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Career requirements failed';
      throw new Error(errorMessage);
    }
  },

  // Ask About Job
  askAboutJob: async (data) => {
    try {
      const response = await api.post('/ask-about-job', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get answer';
      throw new Error(errorMessage);
    }
  },

  // Create User
  createUser: async (email) => {
    try {
      const response = await api.post('/user/create', { email });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'User creation failed';
      throw new Error(errorMessage);
    }
  },

  // Get User History
  getUserHistory: async (userId) => {
    try {
      const response = await api.get(`/user/${userId}/history`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load history';
      throw new Error(errorMessage);
    }
  },
};

// Export the axios instance as default
export default api;