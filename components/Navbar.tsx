import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Building2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function Navbar() {
  const { recruiter, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-whatsapp-green p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recruiter Copilot</h1>
            <p className="text-sm text-gray-600">Dashboard</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Recruiter Info */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {recruiter?.name || 'Recruiter'}
            </p>
            <p className="text-xs text-gray-500">
              {recruiter?.email || 'email@example.com'}
            </p>
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {recruiter?.name || 'Recruiter'}
                </p>
                <p className="text-xs text-gray-500">
                  {recruiter?.email || 'email@example.com'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {recruiter?.recruiter_id || 'N/A'}
                </p>
              </div>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
