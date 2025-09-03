import React, { createContext, useContext, useEffect, useState } from 'react';
import { Recruiter, ALLOWED_RECRUITERS } from '../config/supabase';
import { API_CONFIG } from '../config/api';

// Mock types for Docker deployment
interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  recruiter: Recruiter | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
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
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only auto-login if demo mode is enabled
    if (API_CONFIG.FEATURES.DEMO_MODE) {
      console.warn('🚨 Demo mode is enabled - auto-login active');
      const demoUser: User = {
        id: 'demo-user',
        email: ALLOWED_RECRUITERS[0]?.email || 'demo@example.com'
      };

      const demoSession: Session = {
        user: demoUser,
        access_token: 'demo-token'
      };

      setUser(demoUser);
      setSession(demoSession);
      setRecruiter(ALLOWED_RECRUITERS[0] || null);
    } else {
      console.log('Demo mode disabled - manual authentication required');
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!API_CONFIG.FEATURES.DEMO_MODE) {
      return { success: false, message: 'Authentication is disabled. Contact administrator.' };
    }

    // Demo mode: Allow any password for allowed recruiters
    const recruiterData = ALLOWED_RECRUITERS.find(r => r.email === email);
    if (!recruiterData) {
      return { success: false, message: 'Email not found in allowed recruiters list' };
    }

    const demoUser: User = {
      id: 'demo-user',
      email
    };

    const demoSession: Session = {
      user: demoUser,
      access_token: 'demo-token'
    };

    setUser(demoUser);
    setSession(demoSession);
    setRecruiter(recruiterData);
    
    return { success: true, message: 'Signed in successfully (Demo Mode)' };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setRecruiter(null);
  };

  const value = {
    user,
    recruiter,
    session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};