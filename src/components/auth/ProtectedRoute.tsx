
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // Use role names instead of role IDs
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = ['SuperAdmin', 'Admin'] // Default: Only SuperAdmin and Admin
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying administrator permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required admin role
  const hasValidRole = requiredRoles.includes(user.role);
  
  if (!hasValidRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-lg w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <h3 className="text-xl font-bold text-red-800 mb-3">
                🚫 Administrator Access Required
              </h3>
              <AlertDescription className="text-red-700 space-y-2">
                <p>You don't have sufficient privileges to access the admin panel.</p>
                <div className="bg-red-100 p-3 rounded-md mt-3">
                  <p><strong>Your Current Role:</strong> {user.role}</p>
                  <p><strong>Required Access:</strong> SuperAdmin or Admin</p>
                  <p><strong>Logged in as:</strong> {user.name} ({user.email})</p>
                </div>
                <p className="text-sm mt-3">
                  Please contact your system administrator to request appropriate permissions.
                </p>
              </AlertDescription>
            </div>
          </Alert>
          <div className="mt-6 flex gap-3 justify-center">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login as Different User
            </button>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
