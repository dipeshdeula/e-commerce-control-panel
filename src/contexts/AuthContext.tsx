import React, { createContext, useEffect, useState } from 'react';
import { UserDTO } from '@/types/api';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// JWT payload interface
interface JWTPayload {
  nameid?: string;
  sub?: string;
  userId?: string;
  unique_name?: string;
  name?: string;
  given_name?: string;
  email?: string;
  role?: string;
  Role?: string;
  roleId?: number;
  RoleId?: number;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT token
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Login attempt for:', email);
      
      const response = await apiService.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.accessToken) {
        // Decode the JWT to extract user information
        const decodedToken = decodeJWT(response.accessToken);
        console.log('Decoded token:', decodedToken);
        
        if (decodedToken) {
          // Extract role information - might be in different fields          
          const roleName = decodedToken.role || decodedToken.Role || 'User';
          const roleId = decodedToken.roleId || decodedToken.RoleId || 
                        (roleName === 'SuperAdmin' ? 1 : 
                         roleName === 'Admin' ? 2 : 
                         roleName === 'Vendor' ? 3 : 
                         roleName === 'DeliveryBoy' ? 4 : 5);
          
          console.log('User Role name:', roleName, 'Role ID:', roleId);
          
          // Validate admin access - only SuperAdmin (1) and Admin (2) allowed
          if (roleName !== 'SuperAdmin' && roleName !== 'Admin') {
            throw new Error('Access denied. This system is restricted to administrators only.');
          }
          
          const userData: UserDTO = {
            userId: parseInt(decodedToken.nameid || decodedToken.sub || decodedToken.userId) || 0,
            name: decodedToken.unique_name || decodedToken.name || decodedToken.given_name || 'Unknown',
            email: decodedToken.email || email,
            role: roleName,
            roleId: roleId
          };
          
          console.log('User data:', userData);
          
          setToken(response.accessToken);
          setUser(userData);
          
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.name}! You have ${userData.role} access.`,
            className: "bg-green-50 border-green-200 text-green-800"
          });
        } else {
          throw new Error('Failed to decode authentication token');
        }
      } else {
        throw new Error(response.message || 'Invalid credentials provided');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing auth data on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials. Please check your email and password.";
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Admin logout initiated');
    setUser(null);
    setToken(null);
    
    // Clear all authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out of the admin panel.",
      className: "bg-blue-50 border-blue-200 text-blue-800"
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
