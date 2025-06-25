import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Array of allowed role names
  fallbackPath?: string;
  showAlert?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles = ['SuperAdmin', 'Admin'], // Default: SuperAdmin and Admin
  fallbackPath = '/unauthorized',
  showAlert = true 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in allowed roles
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    if (showAlert) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Access Denied
                </h3>
                <AlertDescription className="text-red-700">
                  You don't have permission to access this area. This section is restricted to administrators only.
                  <br /><br />
                  <strong>Your Role:</strong> {user.role}
                  <br />
                  <strong>Required Roles:</strong> SuperAdmin or Admin
                </AlertDescription>
              </div>
            </Alert>
            <div className="mt-6 text-center">
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
