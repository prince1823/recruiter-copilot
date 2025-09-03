import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { SignIn } from './SignIn';
import { Loader2 } from 'lucide-react';
import { isAuthenticated } from '../src/lib/auth-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-whatsapp-green to-green-600 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthenticated()) {
    return <SignIn />;
  }

  return <>{children}</>;
}
