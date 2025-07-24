import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface PaymentState {
  paymentMethods: any[];
  paymentRequests: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  paymentMethods: [],
  paymentRequests: [],
  loading: false,
  error: null,
};

export const fetchPaymentMethods = createAsyncThunk(
  'payments/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaymentMethods();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch payment methods');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchPaymentRequests = createAsyncThunk(
  'payments/fetchPaymentRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaymentRequests();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch payment requests');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaymentRequests.fulfilled, (state, action) => {
        state.paymentRequests = action.payload;
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;