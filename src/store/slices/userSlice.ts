import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface UserState {
  users: any[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; pageSize?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch users');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateUserRole',
  async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUserRole(userId, role);
      if (response.success) {
        return { userId, role };
      }
      return rejectWithValue(response.message || 'Failed to update user role');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.softDeleteUser(userId);
      if (response.success) {
        return userId;
      }
      return rejectWithValue(response.message || 'Failed to delete user');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].role = role;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearError, setCurrentPage } = userSlice.actions;
export default userSlice.reducer;