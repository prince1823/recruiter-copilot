import { API_CONFIG } from '../config/api';
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
    if (import.meta.env.VITE_SKIP_AUTH === 'true') {
      const mockUserId = import.meta.env.VITE_MOCK_USER_ID || 'test-user-123';
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
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/user-logins/validate`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-User-ID': username,
        },
        body: JSON.stringify({
          mid: requestId,
          ts: timestamp,
          request: {
            username: username,
            password: passwordHash,
          },
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setStoredUserId(username);
        setStoredUsername(username);
        setLoginTime();
        
        return {
          success: true,
          userId: username,
          message: data.message || 'Login successful',
        };
      }
      
      return {
        success: false,
        message: data.message || 'Invalid credentials',
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