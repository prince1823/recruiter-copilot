import { API_CONFIG } from '../config/api';
import { ENV } from '../config/environment';
import { 
  hashPassword, 
  setStoredUserId, 
  setStoredUsername, 
  setLoginTime, 
  clearSession,
  isAuthenticated as checkAuth,
  getStoredUserId,
  generateRequestId,
  generateTimestamp
} from '../lib/auth-utils';

interface LoginResponse {
  success: boolean;
  userId?: string;
  message: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    // Check if auth should be skipped (development/testing only)
    if (ENV.SKIP_AUTH) {
      // MOCK_USER_ID must be set if SKIP_AUTH is true
      if (!ENV.MOCK_USER_ID) {
        throw new Error('VITE_SKIP_AUTH is true but VITE_MOCK_USER_ID is not set! Both must be configured together.');
      }
      
      const mockUserId = ENV.MOCK_USER_ID;
      setStoredUserId(mockUserId);
      setStoredUsername(username);
      setLoginTime();
      
      console.warn('⚠️ AUTH SKIPPED: Using mock user ID:', mockUserId);
      
      return {
        success: true,
        userId: mockUserId,
        message: 'Login successful (auth skipped for testing)',
      };
    }
    
    try {
      const passwordHash = await hashPassword(password);
      const requestId = generateRequestId();
      const timestamp = generateTimestamp();
      
      const url = `${API_CONFIG.BASE_URL}/user-logins/validate`;
      const requestBody = {
        mid: requestId,
        ts: timestamp,
        request: {
          username: username,
          password: passwordHash,
        },
      };
      
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-User-ID': username,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Successfully authenticated (2xx status code)
        setStoredUserId(username);
        setStoredUsername(username);
        setLoginTime();
        
        
        return {
          success: true,
          userId: username,
          message: 'Login successful',
        };
      }
      
      // Authentication failed - try to parse error message
      let errorMessage = 'Invalid credentials';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
        console.error('❌ Login failed:', errorMessage);
      } catch {
        // If response body isn't JSON, use default error message
        console.error('❌ Login failed with status:', response.status);
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  },

  logout(): void {
    clearSession();
  },

  isAuthenticated(): boolean {
    return checkAuth();
  },

  getUserId(): string | null {
    return getStoredUserId();
  }
};