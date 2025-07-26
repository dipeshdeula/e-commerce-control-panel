import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full mx-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium">
                Error details (click to expand)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
            <div className="flex gap-2">
              <Button onClick={resetErrorBoundary} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application Error:', error);
        console.error('Error Info:', errorInfo);
      }}
      onReset={() => {
        // Clear any cached data or reset application state if needed
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
