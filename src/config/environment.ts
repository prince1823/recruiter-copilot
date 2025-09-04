/**
 * Centralized Environment Variable Handler
 * 
 * This module handles environment variables from either:
 * 1. Vite's build-time environment variables (import.meta.env)
 * 2. Docker runtime injection via window._env_
 * 
 * NO DEFAULT VALUES - All environment variables must be explicitly set
 * The application will fail fast if required variables are missing
 */

interface RuntimeEnv {
  VITE_API_BASE_URL: string;
  VITE_API_TIMEOUT: string;
  VITE_API_RETRY_ATTEMPTS: string;
  VITE_API_RETRY_DELAY: string;
  VITE_ENABLE_CSV_EXPORT: string;
  VITE_ENABLE_BULK_ACTIONS: string;
  VITE_SKIP_AUTH?: string;
  VITE_MOCK_USER_ID?: string;
}

declare global {
  interface Window {
    _env_?: RuntimeEnv;
  }
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Get environment variable from either Docker runtime or Vite build
 * Docker runtime takes precedence over Vite build variables
 * NO DEFAULTS - throws error if not found
 */
function getEnvVar(key: keyof RuntimeEnv): string {
  // Try Docker runtime injection first
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  
  // Fall back to Vite build-time variables
  if (import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  
  // Variable not found - ALWAYS throw error, no defaults!
  const errorMsg = `CRITICAL ERROR: Environment variable '${key}' is not set!\n` +
                   `Please set this variable in either:\n` +
                   `1. Your .env file (for local development)\n` +
                   `2. Your docker-compose.yml file (for Docker deployment)\n` +
                   `The application cannot start without this configuration.`;
  
  console.error(`🚨 ${errorMsg}`);
  throw new EnvironmentError(errorMsg);
}

/**
 * Get optional environment variable
 * Returns undefined if not set (not empty string!)
 */
function getOptionalEnvVar(key: keyof RuntimeEnv): string | undefined {
  // Try Docker runtime injection first
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  
  // Fall back to Vite build-time variables
  if (import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  
  // Return undefined, not empty string
  return undefined;
}

/**
 * Validate all required environment variables on startup
 * This will throw an error and prevent the app from starting if any required vars are missing
 */
function validateEnvironment(): void {
  const requiredVars: Array<keyof RuntimeEnv> = [
    'VITE_API_BASE_URL',
    'VITE_API_TIMEOUT',
    'VITE_API_RETRY_ATTEMPTS',
    'VITE_API_RETRY_DELAY',
    'VITE_ENABLE_CSV_EXPORT',
    'VITE_ENABLE_BULK_ACTIONS'
  ];
  
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    try {
      getEnvVar(varName);
    } catch (error) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    const errorMsg = `CRITICAL ERROR: Missing required environment variables:\n${missing.join(', ')}\n\n` +
                     `These variables MUST be set for the application to function.\n` +
                     `Please configure them in your .env file or docker-compose.yml`;
    
    console.error(`🚨 ${errorMsg}`);
    
    // Display error in the UI if possible
    if (typeof document !== 'undefined') {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div style="padding: 20px; background: #ff0000; color: white; font-family: monospace;">
            <h1>Environment Configuration Error</h1>
            <p>The application cannot start due to missing environment variables:</p>
            <ul>
              ${missing.map(v => `<li>${v}</li>`).join('')}
            </ul>
            <p>Please contact your system administrator to configure these variables.</p>
          </div>
        `;
      }
    }
    
    throw new EnvironmentError(errorMsg);
  }
  
  console.log('✅ All required environment variables are configured');
}

/**
 * Parse integer from environment variable
 * Throws error if not a valid number
 */
function parseIntEnv(value: string, varName: string): number {
  const parsed = parseInt(value);
  if (isNaN(parsed)) {
    throw new EnvironmentError(`Environment variable '${varName}' must be a valid number, got: '${value}'`);
  }
  return parsed;
}

/**
 * Environment configuration object
 * NO DEFAULTS - all required values must be explicitly set
 */
export const ENV = {
  // API Configuration - ALL REQUIRED
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL'),
  API_TIMEOUT: parseIntEnv(getEnvVar('VITE_API_TIMEOUT'), 'VITE_API_TIMEOUT'),
  API_RETRY_ATTEMPTS: parseIntEnv(getEnvVar('VITE_API_RETRY_ATTEMPTS'), 'VITE_API_RETRY_ATTEMPTS'),
  API_RETRY_DELAY: parseIntEnv(getEnvVar('VITE_API_RETRY_DELAY'), 'VITE_API_RETRY_DELAY'),
  
  // Feature Flags - ALL REQUIRED
  ENABLE_CSV_EXPORT: getEnvVar('VITE_ENABLE_CSV_EXPORT') === 'true',
  ENABLE_BULK_ACTIONS: getEnvVar('VITE_ENABLE_BULK_ACTIONS') === 'true',
  
  // Development/Testing Flags - OPTIONAL
  // These will be undefined if not set, not empty string or false
  SKIP_AUTH: getOptionalEnvVar('VITE_SKIP_AUTH') === 'true',
  MOCK_USER_ID: getOptionalEnvVar('VITE_MOCK_USER_ID'),
};

// Validate environment on module load
// This will prevent the application from starting if required vars are missing
validateEnvironment();

// Export the validation function for use in tests or other contexts
export { validateEnvironment, getEnvVar, getOptionalEnvVar, EnvironmentError };