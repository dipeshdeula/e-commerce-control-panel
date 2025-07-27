import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

// Decode JWT token to extract user info
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT payload decoded:', payload);
    return {
      userId: payload.nameid,
      email: payload.email,
      name: payload.unique_name,
      role: payload.role,
      actort: payload.actort, // Add the image URL
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return Date.now() >= decoded.exp * 1000;
};

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
  actort?:string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  requiresOTP: boolean;
  requiresVerification: boolean;
  tokenExpiry: number | null;
}

// Initialize state from localStorage
const initializeAuthState = (): AuthState => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  let user = null;
  let isAuthenticated = false;
  let tokenExpiry = null;

  if (accessToken && !isTokenExpired(accessToken)) {
    const decoded = decodeToken(accessToken);
    if (decoded && (decoded.role === 'SuperAdmin' || decoded.role === 'Admin')) {
      user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        actort: decoded.actort
      };
      isAuthenticated = true;
      tokenExpiry = decoded.exp;
    } else {
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  } else if (accessToken) {
    // Clear expired tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return {
    user,
    accessToken: accessToken && !isTokenExpired(accessToken) ? accessToken : null,
    refreshToken,
    isAuthenticated,
    loading: false,
    error: null,
    requiresOTP: false,
    requiresVerification: false,
    tokenExpiry
  };
};

const initialState: AuthState = initializeAuthState();

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;
        const decoded = decodeToken(accessToken);
        
        // Only allow Admin and SuperAdmin roles
        if (!decoded || (decoded.role !== 'SuperAdmin' && decoded.role !== 'Admin')) {
          return rejectWithValue('Access denied. Admin privileges required.');
        }
        
        return response.data;
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      const response = await apiService.refreshToken(refreshToken);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Token refresh failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
      
      return true;
    } catch (error: any) {
      // Even if logout API fails, we should still clear local state
      console.error('Logout API failed:', error);
      return true;
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyOtp(otpData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'OTP verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.requiresOTP = false;
      state.requiresVerification = false;
      state.tokenExpiry = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setRequiresOTP: (state, action: PayloadAction<boolean>) => {
      state.requiresOTP = action.payload;
    },
    setRequiresVerification: (state, action: PayloadAction<boolean>) => {
      state.requiresVerification = action.payload;
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      const { accessToken, refreshToken } = action.payload;
      const decoded = decodeToken(accessToken);
      
      if (decoded && (decoded.role === 'SuperAdmin' || decoded.role === 'Admin')) {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.tokenExpiry = decoded.exp;
        state.user = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          actort: decoded.actort
        };
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        if (data.requiresOTP || data.requiresVerification) {
          state.requiresOTP = data.requiresOTP || false;
          state.requiresVerification = data.requiresVerification || false;
        } else if (data.accessToken) {
          const decoded = decodeToken(data.accessToken);
          if (decoded) {
            state.user = {
              userId: decoded.userId,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              actort: decoded.actort
            };
            state.accessToken = data.accessToken;
            state.refreshToken = data.refreshToken;
            state.tokenExpiry = decoded.exp;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        if (data.accessToken) {
          const decoded = decodeToken(data.accessToken);
          if (decoded) {
            state.accessToken = data.accessToken;
            state.refreshToken = data.refreshToken;
            state.tokenExpiry = decoded.exp;
            state.user = {
              userId: decoded.userId,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              actort: decoded.actort
            };
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.loading = false;
        // Clear all auth data if refresh fails
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.tokenExpiry = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.requiresOTP = false;
        state.requiresVerification = false;
        state.tokenExpiry = null;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout API fails, clear local state
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.requiresOTP = false;
        state.requiresVerification = false;
        state.tokenExpiry = null;
        state.loading = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        if (data.requiresOTP || data.requiresVerification) {
          state.requiresOTP = data.requiresOTP || false;
          state.requiresVerification = data.requiresVerification || false;
        } else if (data.accessToken) {
          const decoded = decodeToken(data.accessToken);
          if (decoded) {
            state.user = {
              userId: decoded.userId,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              actort: decoded.actort
            };
            state.accessToken = data.accessToken;
            state.refreshToken = data.refreshToken;
            state.tokenExpiry = decoded.exp;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        
        if (data.accessToken) {
          const decoded = decodeToken(data.accessToken);
          if (decoded) {
            state.user = {
              userId: decoded.userId,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              actort: decoded.actort
            };
            state.accessToken = data.accessToken;
            state.refreshToken = data.refreshToken;
            state.tokenExpiry = decoded.exp;
            state.isAuthenticated = true;
            state.requiresOTP = false;
            state.requiresVerification = false;
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setRequiresOTP, setRequiresVerification, updateTokens } = authSlice.actions;
export default authSlice.reducer;