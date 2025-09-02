// API Configuration
// This file manages API settings and environment variables

export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: '/api' || 'https://91.99.195.150:8000/api/v1',
  
  // User ID for API requests
  USER_ID: import.meta.env.VITE_USER_ID || '918923325988',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
  
  // Headers configuration
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'http://91.99.195.150:8000/api/v1',
    LOG_LEVEL: 'debug',
  },
  production: {
    API_BASE_URL: 'https://91.99.195.150:8000/api/v1',
    LOG_LEVEL: 'error',
  },
  test: {
    API_BASE_URL: 'https://91.99.195.150:8000/api/v1',
    LOG_LEVEL: 'debug',
  },
};

// Get current environment
export const getCurrentEnv = () => {
  return import.meta.env.MODE || 'development';
};

// Get environment-specific configuration
export const getEnvConfig = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
};

// Helper function to get API URL
// Helper function to get API URL
export const getApiUrl = (endpoint: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  return `${baseUrl}${endpoint}`;
};


// Helper function to get headers with user ID
export const getHeaders = () => ({
  ...API_CONFIG.HEADERS,
  'X-User-ID': API_CONFIG.USER_ID,
});
