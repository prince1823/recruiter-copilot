import { API_CONFIG } from '../config/api';
import { 
  hashPassword, 
  setStoredUserId, 
  setStoredUsername, 
  setLoginTime, 
  clearSession,
  isAuthenticated as checkAuth,
  getStoredUserId 
} from '../lib/auth-utils';

interface LoginResponse {
  success: boolean;
  userId?: string;
  message: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const passwordHash = await hashPassword(password);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          passwordHash,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.userId) {
        setStoredUserId(data.userId);
        setStoredUsername(username);
        setLoginTime();
        
        return {
          success: true,
          userId: data.userId,
          message: data.message || 'Login successful',
        };
      }
      
      return {
        success: false,
        message: data.message || 'Login failed',
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