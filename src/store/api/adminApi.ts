import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/config/api.config';
import { RootState } from '@/store';

// 🏭 Production-level RTK Query API
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || localStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Dashboard',
    'Users', 
    'Orders', 
    'Products', 
    'Stores',
    'Categories',
    'Payments',
    'Analytics'
  ],
  endpoints: (builder) => ({
    // 📊 Dashboard - Real-time data
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Dashboard'],
      // Refetch every 30 seconds for real-time updates
      pollingInterval: 30000,
      // Keep data fresh for 1 minute
      keepUnusedDataFor: 60,
    }),

    // 👥 Users Management
    getUsers: builder.query<UsersResponse, UsersParams>({
      query: ({ page = 1, limit = 10, search = '' }) => 
        `/admin/users?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ['Users'],
      // Serialize query args for better caching
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, limit, search } = queryArgs;
        return `users-${page}-${limit}-${search}`;
      },
    }),

    // 🛍️ Orders Management  
    getOrders: builder.query<OrdersResponse, OrdersParams>({
      query: ({ page = 1, limit = 10, status = 'all', dateRange }) => {
        let url = `/admin/orders?page=${page}&limit=${limit}`;
        if (status !== 'all') url += `&status=${status}`;
        if (dateRange) url += `&startDate=${dateRange.start}&endDate=${dateRange.end}`;
        return url;
      },
      providesTags: ['Orders'],
      // Transform response to normalize data structure
      transformResponse: (response: any) => ({
        ...response,
        data: response.data.map((order: any) => ({
          ...order,
          // Ensure consistent date format
          orderDate: new Date(order.orderDate).toISOString(),
          // Normalize amount to number
          amount: parseFloat(order.amount) || 0,
        }))
      }),
    }),

    // 📦 Products Management
    getProducts: builder.query<ProductsResponse, ProductsParams>({
      query: ({ page = 1, limit = 10, category, inStock }) => {
        let url = `/admin/products?page=${page}&limit=${limit}`;
        if (category) url += `&category=${category}`;
        if (inStock !== undefined) url += `&inStock=${inStock}`;
        return url;
      },
      providesTags: ['Products'],
    }),

    // 🏪 Stores Management
    getStores: builder.query<StoresResponse, StoresParams>({
      query: ({ page = 1, limit = 10, status = 'all' }) => 
        `/admin/stores?page=${page}&limit=${limit}&status=${status}`,
      providesTags: ['Stores'],
    }),

    // 💰 Analytics - Heavy computation, cache longer
    getAnalytics: builder.query<AnalyticsResponse, AnalyticsParams>({
      query: ({ period = '30d', metrics = ['sales', 'orders'] }) =>
        `/admin/analytics?period=${period}&metrics=${metrics.join(',')}`,
      providesTags: ['Analytics'],
      // Cache analytics for 5 minutes (expensive queries)
      keepUnusedDataFor: 300,
    }),

    // 🔄 Mutations for data modifications
    updateOrderStatus: builder.mutation<OrderResponse, { orderId: string; status: string }>({
      query: ({ orderId, status }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
      // Invalidate related cache entries
      invalidatesTags: ['Orders', 'Dashboard', 'Analytics'],
      // Optimistic update
      async onQueryStarted({ orderId, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData('getOrders', { page: 1, limit: 10 } as any, (draft) => {
            const order = draft.data.find((o: any) => o.orderId === orderId);
            if (order) {
              order.status = status;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Product stock update with optimistic updates
    updateProductStock: builder.mutation<ProductResponse, { productId: string; stock: number }>({
      query: ({ productId, stock }) => ({
        url: `/admin/products/${productId}/stock`,
        method: 'PUT',
        body: { stock },
      }),
      invalidatesTags: ['Products', 'Dashboard'],
      async onQueryStarted({ productId, stock }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData('getProducts', { page: 1, limit: 10 } as any, (draft) => {
            const product = draft.data.find((p: any) => p.productId === productId);
            if (product) {
              product.stock = stock;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

// Export hooks for components
export const {
  useGetDashboardQuery,
  useGetUsersQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useGetStoresQuery,
  useGetAnalyticsQuery,
  useUpdateOrderStatusMutation,
  useUpdateProductStockMutation,
  // Lazy queries for on-demand fetching
  useLazyGetUsersQuery,
  useLazyGetOrdersQuery,
} = adminApi;

// Types
interface DashboardResponse {
  success: boolean;
  data: {
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    recentOrders: Array<{
      orderId: string;
      amount: number;
      status: string;
      orderDate: string;
    }>;
    topSellingProducts: Array<{
      productId: string;
      name: string;
      soldQuantity: number;
      totalSales: number;
    }>;
    topStoresByIncome: Array<{
      storeId: string;
      storeName: string;
      ownerName: string;
      totalIncome: number;
    }>;
  };
}

interface UsersResponse {
  success: boolean;
  data: Array<{
    userId: string;
    name: string;
    email: string;
    status: string;
    joinDate: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface OrdersResponse {
  success: boolean;
  data: Array<{
    orderId: string;
    amount: number;
    status: string;
    orderDate: string;
    customerName: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface OrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ProductsResponse {
  success: boolean;
  data: Array<{
    productId: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    status: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  inStock?: boolean;
}

interface StoresResponse {
  success: boolean;
  data: Array<{
    storeId: string;
    storeName: string;
    ownerName: string;
    status: string;
    totalIncome: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StoresParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    salesTrend: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
    categoryPerformance: Array<{
      category: string;
      sales: number;
      percentage: number;
    }>;
    storePerformance: Array<{
      storeId: string;
      storeName: string;
      sales: number;
      orders: number;
    }>;
  };
}

interface AnalyticsParams {
  period?: '7d' | '30d' | '90d' | '1y';
  metrics?: Array<'sales' | 'orders' | 'users' | 'products'>;
}

interface OrderResponse {
  success: boolean;
  data: {
    orderId: string;
    status: string;
    updatedAt: string;
  };
}

interface ProductResponse {
  success: boolean;
  data: {
    productId: string;
    stock: number;
    updatedAt: string;
  };
}
