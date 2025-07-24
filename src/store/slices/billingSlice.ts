import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface BillingState {
  billings: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  billings: [],
  loading: false,
  error: null,
};

export const fetchBillings = createAsyncThunk(
  'billing/fetchBillings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getBillings();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch billings');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillings.fulfilled, (state, action) => {
        state.loading = false;
        state.billings = action.payload;
      })
      .addCase(fetchBillings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = billingSlice.actions;
export default billingSlice.reducer;