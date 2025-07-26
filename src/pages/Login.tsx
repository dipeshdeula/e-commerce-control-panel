import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }
    
    dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">IM</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            InstantMart Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-12 bg-background border-2 border-border focus:border-primary transition-colors"
              />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;