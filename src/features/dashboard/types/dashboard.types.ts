export interface DashboardData {
  totalSales: number;
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  totalOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  orderStatusCounts: {
    [key: string]: number;
  };
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  topSellingProducts: TopProduct[];
  paymentMethodTotals: {
    [key: string]: number;
  };
  failedPayments: number;
  successfulPayments: number;
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
  totalStores: number;
  topStoresByIncome: TopStore[];
}

export interface TopProduct {
  productId: number;
  name: string;
  soldQuantity: number;
  totalSales: number;
}

export interface RecentOrder {
  orderId: number;
  userName: string;
  amount: number;
  status: string;
  orderDate: string;
}

export interface RecentUser {
  userId: number;
  name: string;
  email: string;
  registeredAt: string;
}

export interface TopStore {
  storeId: number;
  storeName: string;
  ownerName: string;
  imageUrl: string;
  totalIncome: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}