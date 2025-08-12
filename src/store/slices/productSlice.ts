import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface ProductState {
  products: any[];
  adminProducts: any[];
  productsWithDynamicPricing: any[];
  loading: boolean;
  adminLoading: boolean;
  dynamicPricingLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  lastPriceUpdate: string | null;
  activeBannerEvents: any[];
}

const initialState: ProductState = {
  products: [],
  adminProducts: [],
  productsWithDynamicPricing: [],
  loading: false,
  adminLoading: false,
  dynamicPricingLoading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1,
  lastPriceUpdate: null,
  activeBannerEvents: [],
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

// Admin products thunk - get all products including inactive ones
export const fetchAdminProducts = createAsyncThunk(
  'products/fetchAdminProducts',
  async (params: { page?: number; pageSize?: number; includeInactive?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getAllProductsAdmin(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch admin products');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Dynamic pricing products thunk - get products with event pricing
export const fetchProductsWithDynamicPricing = createAsyncThunk(
  'products/fetchProductsWithDynamicPricing',
  async (params: { page?: number; pageSize?: number; includeEventPricing?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getProductsWithDynamicPricing(params);
      if (response.success && response.data) {
        return {
          ...response.data,
          lastUpdate: new Date().toISOString()
        };
      }
      return rejectWithValue(response.message || 'Failed to fetch products with dynamic pricing');
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
    updateProductPricing: (state, action) => {
      // Update specific product pricing when banner events change
      const { productId, newPrice, eventDiscount } = action.payload;
      state.productsWithDynamicPricing = state.productsWithDynamicPricing.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              discountPrice: newPrice, 
              eventDiscount: eventDiscount,
              lastPriceUpdate: new Date().toISOString()
            }
          : product
      );
      state.lastPriceUpdate = new Date().toISOString();
    },
    setActiveBannerEvents: (state, action) => {
      state.activeBannerEvents = action.payload;
    },
    refreshDynamicPricing: (state) => {
      state.lastPriceUpdate = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Regular products
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
      })
      
      // Admin products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminProducts = action.payload.items || action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload as string;
      })
      
      // Dynamic pricing products
      .addCase(fetchProductsWithDynamicPricing.pending, (state) => {
        state.dynamicPricingLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsWithDynamicPricing.fulfilled, (state, action) => {
        state.dynamicPricingLoading = false;
        state.productsWithDynamicPricing = action.payload.items || action.payload;
        state.lastPriceUpdate = action.payload.lastUpdate;
      })
      .addCase(fetchProductsWithDynamicPricing.rejected, (state, action) => {
        state.dynamicPricingLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  updateProductPricing, 
  setActiveBannerEvents, 
  refreshDynamicPricing 
} = productSlice.actions;
export default productSlice.reducer;