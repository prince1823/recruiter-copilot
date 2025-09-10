import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth-service';
import { getStoredUserId, getStoredUsername, isAuthenticated, isTokenExpired } from '../lib/auth-utils';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const userId = getStoredUserId();
      const username = getStoredUsername();
      
      if (userId && username) {
        // Check if token is valid
        if (isAuthenticated()) {
          setUser({
            id: userId,
            username,
          });
        } else {
          // Token is expired or invalid, try to refresh
          if (isTokenExpired()) {
            const refreshResult = await authService.refreshToken();
            if (refreshResult.success) {
              setUser({
                id: userId,
                username,
              });
            } else {
              // Refresh failed, clear session
              authService.logout();
            }
          } else {
            // No token, clear session
            authService.logout();
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up periodic token refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      if (isTokenExpired()) {
        const refreshResult = await authService.refreshToken();
        if (!refreshResult.success) {
          // Refresh failed, sign out user
          await signOut();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.success && response.userId) {
        setUser({
          id: response.userId,
          username,
        });
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to sign in' 
      };
    }
  };

  const signOut = async () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};