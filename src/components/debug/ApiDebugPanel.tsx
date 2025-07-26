import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DebugService } from '@/services/debug.service';
import { AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface DebugResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

export const ApiDebugPanel: React.FC = () => {
  const [apiResult, setApiResult] = useState<DebugResult | null>(null);
  const [networkResult, setNetworkResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const result = await DebugService.testApiConnection();
      setApiResult(result);
      console.log('API Test Result:', result);
    } catch (error) {
      setApiResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test API connection'
      });
    }
    setLoading(false);
  };

  const testNetworkConnectivity = async () => {
    try {
      const result = await DebugService.testNetworkConnectivity();
      setNetworkResult(result);
      console.log('Network Test Result:', result);
    } catch (error) {
      setNetworkResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const logCurrentState = () => {
    DebugService.logCurrentState();
  };

  useEffect(() => {
    // Auto-run tests on component mount
    testNetworkConnectivity();
    logCurrentState();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            API Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testApiConnection}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Test API Connection
            </Button>
            
            <Button 
              onClick={testNetworkConnectivity}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Test Network
            </Button>
            
            <Button 
              onClick={logCurrentState}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Log State
            </Button>
          </div>

          {/* API Test Results */}
          {apiResult && (
            <Card className={`border-2 ${apiResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {apiResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  API Test Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={apiResult.success ? "default" : "destructive"}>
                      {apiResult.success ? "SUCCESS" : "FAILED"}
                    </Badge>
                    <span className="text-sm text-gray-600">{apiResult.message}</span>
                  </div>
                  
                  {apiResult.error && (
                    <div className="bg-red-100 p-2 rounded text-sm text-red-700">
                      <strong>Error:</strong> {apiResult.error}
                    </div>
                  )}
                  
                  {apiResult.data && (
                    <div className="bg-green-100 p-2 rounded text-sm">
                      <strong>Data Preview:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32">
                        {JSON.stringify(apiResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Network Test Results */}
          {networkResult && (
            <Card className={`border-2 ${networkResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {networkResult.success ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  Network Test Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={networkResult.success ? "default" : "destructive"}>
                      {networkResult.success ? "CONNECTED" : "FAILED"}
                    </Badge>
                    {networkResult.status && (
                      <span className="text-sm text-gray-600">
                        Status: {networkResult.status} {networkResult.statusText}
                      </span>
                    )}
                  </div>
                  
                  {networkResult.error && (
                    <div className="bg-red-100 p-2 rounded text-sm text-red-700">
                      <strong>Network Error:</strong> {networkResult.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">Debug Instructions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-blue-600 space-y-1">
                <p>1. Click "Test API Connection" to check if the dashboard API is working</p>
                <p>2. Check the browser console for detailed debug information</p>
                <p>3. Verify that you're logged in and have a valid auth token</p>
                <p>4. Check the Network tab in DevTools for API request details</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
