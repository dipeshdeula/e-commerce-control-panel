import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'inserting' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login, user } = useAuth();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    setAnimationState('inserting');
    setErrorMessage('');
    
    console.log('Admin login attempt for:', email);
    
    try {
      // Simulate key insertion animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await login(email, password);
      console.log('Admin login successful, redirecting...');
      
      setAnimationState('success');
      
      // Wait for success animation then redirect
      setTimeout(() => {
        // Navigation will happen automatically due to user state change
      }, 1000);
      
    } catch (error) {
      console.error('Admin login failed:', error);
      setAnimationState('failed');
      
      // Set appropriate error message based on error type
      if (error instanceof Error) {
        if (error.message.includes('Access denied') || error.message.includes('administrators only')) {
          setErrorMessage('Access denied. This system is restricted to administrators only.');
        } else if (error.message.includes('Invalid credentials') || error.message.includes('authentication')) {
          setErrorMessage('Invalid email or password. Please check your credentials.');
        } else {
          setErrorMessage(error.message || 'Login failed. Please try again.');
        }
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
      
      // Reset animation state after showing broken key
      setTimeout(() => {
        setAnimationState('idle');
        setIsSubmitting(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Animated Lock and Key Section */}
        <div className="relative flex flex-col items-center mb-8">
          {/* Background Circle */}
          <div className="w-64 h-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-full relative overflow-hidden shadow-2xl">
            {/* Lock Body */}
            <div className="absolute bottom-0 left-1/2 mb-3 transform -translate-x-1/2 w-20 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
              {/* Keyhole */}
              <div className="relative">
                <div className={`w-4 h-4 bg-blue-600 rounded-full transition-all duration-300 ${
                  animationState === 'success' ? 'bg-green-500' : animationState === 'failed' ? 'bg-red-500' : ''
                }`}></div>
                <div className={`w-2 h-3 bg-blue-600 mt-1 mx-auto transition-all duration-300 ${
                  animationState === 'success' ? 'bg-green-500' : animationState === 'failed' ? 'bg-red-500' : ''
                }`} style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}></div>
              </div>
            </div>

            {/* Animated Key */}
            <div className={`absolute transition-all duration-1500 ease-in-out ${
              animationState === 'idle' ? 'bottom-8 right-8 rotate-45' :
              animationState === 'inserting' ? 'bottom-12 left-1/2 transform -translate-x-1/2 rotate-0' :
              animationState === 'success' ? 'bottom-12 left-1/2 transform -translate-x-1/2 rotate-0 scale-110' :
              'bottom-8 right-8 rotate-45 scale-75'
            }`}>
              <div className={`relative ${
                animationState === 'failed' ? 'animate-bounce' : ''
              }`}>
                {/* Key Shaft */}
                <div className={`w-8 h-1.5 rounded transition-all duration-300 ${
                  animationState === 'success' ? 'bg-green-500' : 
                  animationState === 'failed' ? 'bg-red-500' : 'bg-blue-800'
                } ${animationState === 'failed' ? 'transform scale-x-75' : ''}`}></div>
                
                {/* Key Head */}
                <div className={`w-4 h-4 rounded-full absolute -left-3 -top-1.5 transition-all duration-300 ${
                  animationState === 'success' ? 'bg-green-500' : 
                  animationState === 'failed' ? 'bg-red-500' : 'bg-blue-800'
                }`}>
                  <div className={`w-2 h-2 bg-white rounded-full absolute top-1 left-1 transition-all duration-300 ${
                    animationState === 'failed' ? 'bg-red-200' : ''
                  }`}></div>
                </div>
                
                {/* Key Teeth */}
                <div className={`absolute right-0 top-0 transition-all duration-300 ${
                  animationState === 'success' ? 'text-green-500' : 
                  animationState === 'failed' ? 'text-red-500' : 'text-blue-800'
                }`}>
                  <div className={`w-1 h-2 current-color ${animationState === 'failed' ? 'transform scale-50' : ''}`} style={{ backgroundColor: 'currentColor' }}></div>
                  <div className={`w-1 h-1 current-color mt-0.5 ${animationState === 'failed' ? 'transform scale-50' : ''}`} style={{ backgroundColor: 'currentColor' }}></div>
                </div>

                {/* Break effect for failed state */}
                {animationState === 'failed' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-red-500 transform rotate-45 absolute"></div>
                    <div className="w-6 h-0.5 bg-red-500 transform -rotate-45 absolute"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Success Sparkles */}
            {animationState === 'success' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-12 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                <div className="absolute bottom-4 left-12 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                <div className="absolute top-12 left-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '600ms' }}></div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          <div className="mt-6 text-center min-h-[1.5rem]">
            {animationState === 'inserting' && (
              <p className="text-blue-600 font-medium animate-pulse">Authenticating...</p>
            )}
            {animationState === 'success' && (
              <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Login Successful!
              </p>
            )}
            {animationState === 'failed' && (
              <p className="text-red-600 font-medium flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Authentication Failed
              </p>
            )}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your administrator credentials to access the admin panel
              <br />
              <span className="text-xs text-blue-600 mt-1 block">
                ⚠️ Only SuperAdmin and Admin roles are permitted
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {errorMessage && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@instantmart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/50"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/50"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className={`w-full h-12 text-white font-semibold transition-all duration-300 transform hover:scale-105 ${
                  animationState === 'success' ? 'bg-green-500 hover:bg-green-600' :
                  animationState === 'failed' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                } shadow-lg`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </div>
                ) : animationState === 'success' ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Success!
                  </div>
                ) : animationState === 'failed' ? (
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Try Again
                  </div>
                ) : 'Sign in'}
              </Button>
            </form>           
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2025 InstantMart Admin Panel. Secure & Professional.
          </p>
        </div>
      </div>
    </div>
  );
};
