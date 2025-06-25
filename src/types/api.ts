
// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserDTO;
}

export interface UserDTO {
  userId: number;
  name: string;
  email: string;
  role: string;
}

// Dashboard types
export interface DashboardResponse {
  message: string;
  data: AdminDashboardDTO;
}

export interface AdminDashboardDTO {
  totalSales: number;
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  totalOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  orderStatusCounts: Record<string, number>;
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  topSellingProducts: TopProductDTO[];
  paymentMethodTotals: Record<string, number>;
  failedPayments: number;
  successfulPayments: number;
  recentOrders: RecentOrderDTO[];
  recentUsers: RecentUserDTO[];
  totalStores: number;
  topStoresByIncome: TopStoreDTO[];
}

export interface TopProductDTO {
  productId: number;
  name: string;
  soldQuantity: number;
  totalSales: number;
}

export interface RecentOrderDTO {
  orderId: number;
  userName: string;
  amount: number;
  status: string;
  orderDate: string;
}

export interface RecentUserDTO {
  userId: number;
  name: string;
  email: string;
  registeredAt: string;
}

export interface TopStoreDTO {
  storeId: number;
  storeName: string;
  ownerName: string;
  imageUrl: string;
  totalIncome: number;
}

// Products
export interface ProductDTO {
  productId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  subCategoryId?: number;
  subSubCategoryId?: number;
  imageUrl: string;
  isActive: boolean;
}

export interface ProductListResponse {
  message: string;
  data: ProductDTO[];
}

export interface ProductDetailResponse {
  message: string;
  data: ProductDTO;
}

// Categories
export interface CategoryDTO {
  categoryId: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface CategoryListResponse {
  message: string;
  data: CategoryDTO[];
}

// Orders
export interface OrderDTO {
  orderId: number;
  userId: number;
  userName: string;
  totalAmount: number;
  orderStatus: string;
  orderDate: string;
}

export interface OrderListResponse {
  message: string;
  data: OrderDTO[];
}

// Stores
export interface StoreDTO {
  storeId: number;
  name: string;
  ownerName: string;
  address: string;
  imageUrl: string;
  isActive: boolean;
}

export interface StoreListResponse {
  message: string;
  data: StoreDTO[];
}

// Payments
export interface PaymentRequestDTO {
  paymentRequestId: number;
  userId: number;
  orderId: number;
  paymentAmount: number;
  paymentMethodId: number;
  paymentStatus: string;
  createdAt: string;
}

export interface PaymentRequestListResponse {
  message: string;
  data: PaymentRequestDTO[];
}

// General API Response
export interface ApiResponse<T> {
  message: string;
  data: T;
}
