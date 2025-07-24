import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  requiresOTP: boolean;
  requiresVerification: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  requiresOTP: false,
  requiresVerification: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
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
      state.token = null;
      state.isAuthenticated = false;
      state.requiresOTP = false;
      state.requiresVerification = false;
      localStorage.removeItem('accessToken');
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
        } else if (data.token) {
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', data.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
        } else if (data.token) {
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', data.token);
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
        
        if (data.token) {
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
          state.requiresOTP = false;
          state.requiresVerification = false;
          localStorage.setItem('accessToken', data.token);
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setRequiresOTP, setRequiresVerification } = authSlice.actions;
export default authSlice.reducer;