import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Recruiter, ALLOWED_RECRUITERS } from '../config/supabase';

// Demo mode types
interface User {
  id: string;
  email?: string;
}

interface Session {
  user: User;
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
    // Demo mode - no initial session needed
    setLoading(false);
  }, []);

  const fetchRecruiterData = async (user: User) => {
    try {
      // Check if user email is in allowed recruiters
      const allowedRecruiter = ALLOWED_RECRUITERS.find(
        r => r.email.toLowerCase() === user.email?.toLowerCase()
      );

      if (allowedRecruiter) {
        // For now, we'll use the hardcoded data
        // In a real app, you'd fetch this from Supabase
        setRecruiter({
          id: user.id,
          email: allowedRecruiter.email,
          name: allowedRecruiter.name,
          contact_no: allowedRecruiter.contact_no,
          recruiter_id: allowedRecruiter.recruiter_id,
          created_at: new Date().toISOString()
        });
      } else {
        console.error('User not in allowed recruiters list');
        // Demo mode - just clear the state
        setUser(null);
        setRecruiter(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error fetching recruiter data:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // TEMPORARY: Allow any email for testing
      console.log('🔓 Demo mode: Allowing any email for testing');
      
      // Check if email is in allowed recruiters
      const allowedRecruiter = ALLOWED_RECRUITERS.find(
        r => r.email.toLowerCase() === email.toLowerCase()
      );

      if (!allowedRecruiter) {
        // For demo purposes, create a temporary recruiter object with YOUR recruiter ID
        console.log('🔓 Demo mode: Creating temporary recruiter for:', email);
        const tempRecruiter = {
          id: 'demo-user',
          email: email,
          name: email.split('@')[0], // Use email prefix as name
          contact_no: '+91 00000 00000',
          recruiter_id: '918923325988', // Use YOUR specific recruiter ID
          created_at: new Date().toISOString()
        };
        
        // Set the temporary recruiter and user
        setRecruiter(tempRecruiter);
        setUser({ id: 'demo-user', email: email } as User);
        setSession({ user: { id: 'demo-user', email: email } } as Session);
        
        return {
          success: true,
          message: 'Demo mode: Signed in successfully!'
        };
      }

      // Demo mode - simulate successful sign in
      const demoUser = { id: 'demo-user', email: email };
      await fetchRecruiterData(demoUser);
      return {
        success: true,
        message: 'Signed in successfully!'
      };

      return {
        success: false,
        message: 'Sign in failed. Please try again.'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const signOut = async () => {
    try {
      // Demo mode - just clear the state
      setUser(null);
      setRecruiter(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    recruiter,
    session,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
