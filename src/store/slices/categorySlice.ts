import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

interface CategoryState {
  categories: any[];
  subcategories: any[];
  subsubcategories: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  subcategories: [],
  subsubcategories: [],
  loading: false,
  error: null,
};

// Categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch categories');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createCategory(categoryData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to create category');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Subcategories
export const fetchSubcategories = createAsyncThunk(
  'categories/fetchSubcategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSubCategories();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch subcategories');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Sub-subcategories
export const fetchSubsubcategories = createAsyncThunk(
  'categories/fetchSubsubcategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSubSubCategories();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch sub-subcategories');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Subcategories
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.subcategories = action.payload;
      })
      // Sub-subcategories
      .addCase(fetchSubsubcategories.fulfilled, (state, action) => {
        state.subsubcategories = action.payload;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;