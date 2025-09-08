import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, Building2, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface NavbarProps {
  activeChatCount?: number;
  disabledChatCount?: number;
}

export function Navbar({ activeChatCount = 0, disabledChatCount = 0 }: NavbarProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 relative overflow-visible">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-primary-blue p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recruiter Copilot</h1>
            <p className="text-sm text-gray-600">Dashboard</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4 relative">
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 h-12 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {user?.id || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeChatCount + disabledChatCount} total chats
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="top"
              className="w-40 p-2 bg-white border border-gray-200 shadow-xl rounded-lg"
              sideOffset={2}
              avoidCollisions={true}
              collisionPadding={10}
            >
              {/* Sign Out Button Only */}
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-md hover:bg-red-50 cursor-pointer text-red-600 w-full transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
