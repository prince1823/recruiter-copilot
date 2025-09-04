// API Configuration
// This file manages API settings using centralized environment variables
import { ENV } from './environment';

export const API_CONFIG = {
  // Base URL for the backend API - MUST be configured via environment variable
  BASE_URL: ENV.API_BASE_URL,
  
  // Request timeout in milliseconds
  TIMEOUT: ENV.API_TIMEOUT,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: ENV.API_RETRY_ATTEMPTS,
    DELAY: ENV.API_RETRY_DELAY,
  },
  
  // Headers configuration
  HEADERS: {
    'Content-Type': 'application/json',
  },

  // Feature flags
  FEATURES: {
    ENABLE_CSV_EXPORT: ENV.ENABLE_CSV_EXPORT,
    ENABLE_BULK_ACTIONS: ENV.ENABLE_BULK_ACTIONS,
  }
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: ENV.API_BASE_URL,
    LOG_LEVEL: 'debug',
  },
  production: {
    API_BASE_URL: ENV.API_BASE_URL,
    LOG_LEVEL: 'error',
  },
  test: {
    API_BASE_URL: ENV.API_BASE_URL,
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

// Helper function to get headers
export const getHeaders = () => ({
  ...API_CONFIG.HEADERS,
});