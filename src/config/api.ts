// API Configuration
// This file manages API settings and environment variables

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using fallback values for development. Check .env.example for proper configuration.');
  }
};

// Call validation on module load
validateEnvVars();

export const API_CONFIG = {
  // Base URL for the backend API - MUST be configured via environment variable in production
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (() => {
    console.warn('🚨 VITE_API_BASE_URL not set! Using development fallback.');
    return 'http://localhost:8000/api/v1';
  })(),
  
  // Default User ID - should be overridden by authentication
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || (() => {
    console.warn('🚨 VITE_DEFAULT_USER_ID not set! Using development fallback.');
    return 'dev-user-id';
  })(),
  
  // Request timeout in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
    DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
  },
  
  // Headers configuration
  HEADERS: {
    'Content-Type': 'application/json',
  },

  // Feature flags
  FEATURES: {
    ENABLE_CSV_EXPORT: import.meta.env.VITE_ENABLE_CSV_EXPORT !== 'false',
    ENABLE_BULK_ACTIONS: import.meta.env.VITE_ENABLE_BULK_ACTIONS !== 'false',
    DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
  }
};

// Environment-specific configurations - now uses environment variables
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    LOG_LEVEL: 'debug',
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL, // Must be set in production
    LOG_LEVEL: 'error',
  },
  test: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
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
export const getApiUrl = (endpoint: string) => {
  const config = getEnvConfig();
  const url = `${config.API_BASE_URL}${endpoint}`;

  return url;
};

// Helper function to get headers with user ID
export const getHeaders = () => ({
  ...API_CONFIG.HEADERS,
  'X-User-ID': API_CONFIG.DEFAULT_USER_ID,
});
