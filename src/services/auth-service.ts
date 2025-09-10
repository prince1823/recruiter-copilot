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
  generateTimestamp,
  setStoredToken,
  setTokenExpiry,
  getStoredToken,
  isTokenExpired
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
        // Parse the response to get the JWT token
        const responseData = await response.json();
        
        // Extract token from the response data structure
        const userData = responseData.data?.[0];
        if (!userData || !userData.token) {
          throw new Error('No token received from server');
        }
        
        const token = userData.token;
        const role = userData.role;
        
        // Store user data and JWT token
        setStoredUserId(username);
        setStoredUsername(username);
        setLoginTime();
        setStoredToken(token);
        
        // Parse JWT token to get expiry (exp claim is in seconds)
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          if (tokenPayload.exp) {
            setTokenExpiry(tokenPayload.exp);
          }
        } catch (error) {
          console.warn('Could not parse JWT token expiry, token will be treated as expired');
        }
        
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
  },

  async refreshToken(): Promise<{ success: boolean; message: string }> {
    const currentToken = getStoredToken();
    const userId = getStoredUserId();
    
    if (!currentToken || !userId) {
      return {
        success: false,
        message: 'No token to refresh'
      };
    }

    try {
      const requestId = generateRequestId();
      const timestamp = generateTimestamp();
      
      const url = `${API_CONFIG.BASE_URL}/user-logins/refresh`;
      const requestBody = {
        mid: requestId,
        ts: timestamp,
        request: {
          token: currentToken,
        },
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Extract new token from the response
        const userData = responseData.data?.[0];
        if (!userData || !userData.token) {
          throw new Error('No new token received from server');
        }
        
        const newToken = userData.token;
        
        // Store new token
        setStoredToken(newToken);
        
        // Parse new JWT token to get expiry
        try {
          const tokenPayload = JSON.parse(atob(newToken.split('.')[1]));
          if (tokenPayload.exp) {
            setTokenExpiry(tokenPayload.exp);
          }
        } catch (error) {
          console.warn('Could not parse new JWT token expiry');
        }
        
        return {
          success: true,
          message: 'Token refreshed successfully',
        };
      }
      
      // Token refresh failed
      let errorMessage = 'Token refresh failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
      } catch {
        console.error('❌ Token refresh failed with status:', response.status);
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred during token refresh',
      };
    }
  },

  async getValidToken(): Promise<string | null> {
    const token = getStoredToken();
    
    if (!token) {
      return null;
    }
    
    // Check if token is expired or will expire soon
    if (isTokenExpired()) {
      // Try to refresh the token
      const refreshResult = await this.refreshToken();
      if (refreshResult.success) {
        return getStoredToken();
      } else {
        // Refresh failed, clear session
        clearSession();
        return null;
      }
    }
    
    return token;
  }
};