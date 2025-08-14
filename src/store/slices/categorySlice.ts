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

// Fetch subcategories by categoryId
export const fetchSubcategoriesByCategoryId = createAsyncThunk(
  'categories/fetchSubcategoriesByCategoryId',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSubCategoriesByCategoryId(categoryId);
      if (response.success && response.data) {
        return response.data.subCategories;
      }
      return rejectWithValue(response.message || 'Failed to fetch subcategories');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Sub-subcategories

// Fetch subsubcategories by categoryId
export const fetchSubSubCategoriesByCategoryId = createAsyncThunk(
  'categories/fetchSubSubCategoriesByCategoryId',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSubSubCategoriesByCategoryId(categoryId);
      if (response.success && response.data) {
        return response.data.subSubCategories;
      }
      return rejectWithValue(response.message || 'Failed to fetch subsubcategories');
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
        .addCase(fetchSubcategoriesByCategoryId.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchSubcategoriesByCategoryId.fulfilled, (state, action) => {
          state.loading = false;
          state.subcategories = action.payload;
        })
        .addCase(fetchSubcategoriesByCategoryId.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })
      // Sub-subcategories
        .addCase(fetchSubSubCategoriesByCategoryId.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchSubSubCategoriesByCategoryId.fulfilled, (state, action) => {
          state.loading = false;
          state.subsubcategories = action.payload;
        })
        .addCase(fetchSubSubCategoriesByCategoryId.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;