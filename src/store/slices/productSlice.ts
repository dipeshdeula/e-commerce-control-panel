import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface ProductState {
  products: any[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getProducts(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch products');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.items || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;