
import React from 'react';
import { Bell, Search, User, Shield, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const Topbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className="max-w-lg w-full lg:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="search"
              name="search"
              className="pl-10"
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>
      </div>

      <div className="ml-4 flex items-center md:ml-6 space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              user?.role === 'SuperAdmin' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
              user?.role === 'Admin' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
              'bg-gray-300'
            }`}>
              {user?.role === 'SuperAdmin' ? (
                <Crown className="h-4 w-4 text-white" />
              ) : user?.role === 'Admin' ? (
                <Shield className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    user?.role === 'SuperAdmin' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    user?.role === 'Admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  {user?.role === 'SuperAdmin' ? '👑 SuperAdmin' : 
                   user?.role === 'Admin' ? '🛡️ Admin' : 
                   user?.role || 'User'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
