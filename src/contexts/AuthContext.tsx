import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Recruiter, ALLOWED_RECRUITERS } from '../config/supabase';
import { User, Session } from '@supabase/supabase-js';

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
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchRecruiterData(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchRecruiterData(session.user);
        } else {
          setRecruiter(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
        await supabase.auth.signOut();
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      if (data.user) {
        await fetchRecruiterData(data.user);
        return {
          success: true,
          message: 'Signed in successfully!'
        };
      }

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
      await supabase.auth.signOut();
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
