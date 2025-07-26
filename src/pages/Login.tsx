import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, verifyOTP, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, requiresOTP, user } = useAppSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [otpData, setOtpData] = useState({
    otp: '',
    email: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Only allow Admin and SuperAdmin to access
      if (user.role === 'SuperAdmin' || user.role === 'Admin') {
        navigate('/dashboard');
      } else {
        dispatch(clearError());
        // Clear authentication for non-admin users
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpData(prev => ({
      ...prev,
      otp: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }
    
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result) && result.payload.requiresOTP) {
      setOtpData(prev => ({ ...prev, email: formData.email }));
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.otp || !otpData.email) {
      return;
    }
    
    dispatch(verifyOTP(otpData));
  };

  const handleBackToLogin = () => {
    setOtpData({ otp: '', email: '' });
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="text-2xl font-bold text-primary-foreground" size={32} />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            InstantMart Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            {requiresOTP ? 'Enter the OTP sent to your email' : 'Admin login required to access the control panel'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!requiresOTP ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@instantmart.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12 bg-background border-2 border-border focus:border-primary transition-colors"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-12 bg-background border-2 border-border focus:border-primary transition-colors pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-sm font-medium text-foreground">Enter OTP</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpData.otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  required
                  disabled={loading}
                  className="h-12 bg-background border-2 border-border focus:border-primary transition-colors text-center text-lg tracking-widest"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={loading || !otpData.otp}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                className="w-full h-12 text-base font-semibold"
                onClick={handleBackToLogin}
                disabled={loading}
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
