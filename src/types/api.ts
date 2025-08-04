// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

// OTP verification
export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

// User registration
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  contact: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  requiresOTP?: boolean;
  requiresVerification?: boolean;
  data?: {
    requiresOTP?: boolean;
    requiresVerification?: boolean;
    [key: string]: unknown;
  };
}

// Role enum mapping (backend uses integer values)
export enum Role {
  SuperAdmin = 1,
  Admin = 2,
  Vendor = 3,
  DeliveryBoy = 4,
  User = 5
}

// Role display names
export const RoleDisplayNames: Record<Role, string> = {
  [Role.SuperAdmin]: "SuperAdmin",
  [Role.Admin]: "Admin", 
  [Role.Vendor]: "Vendor",
  [Role.DeliveryBoy]: "Delivery Boy",
  [Role.User]: "User"
};

// Utility functions for role mapping
export const getRoleNameFromId = (roleId: number): string => {
  switch (roleId) {
    case 1: return "SuperAdmin";
    case 2: return "Admin";
    case 3: return "Vendor";
    case 4: return "Delivery Boy";
    case 5: return "User";
    default: return "Unknown";
  }
};

export const getRoleIdFromName = (roleName: string): number => {
  switch (roleName.toLowerCase()) {
    case "superadmin": return 1;
    case "admin": return 2;
    case "vendor": return 3;
    case "delivery boy": case "deliveryboy": return 4;
    case "user": case "customer": return 5;
    default: return 5; // Default to User
  }
};

export const getRoleDisplayInfo = (roleId: number) => {
  switch (roleId) {
    case 1: return { label: 'SuperAdmin', color: 'bg-red-100 text-red-800 border-red-200' };
    case 2: return { label: 'Admin', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 3: return { label: 'Vendor', color: 'bg-green-100 text-green-800 border-green-200' };
    case 4: return { label: 'Delivery Boy', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    case 5: return { label: 'User', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
};

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message: string;
}

export interface UserDTO {
  userId: number;
  name: string;
  email: string;
  role: string; // "SuperAdmin" or "Admin" for display
  roleId?: number; // Backend role ID (1-5)
}

// User role management
export interface UpdateUserRoleRequest {
  role: number; // Role enum value (1-5)
}

export interface UpdateUserRoleResponse {
  success: boolean;
  message: string;
}

export interface UserListDTO {
  userId: number;
  name: string;
  email: string;
  contact?: string;
  role: number; // Backend sends integer role ID (1-5)
  roleId?: number; // For backward compatibility
  isActive: boolean;
  isDeleted?: boolean;
  registeredAt: string;
  createdAt?: string;
  imageUrl?: string;
  addresses?: Array<{ city: string; [key: string]: unknown }>;
}

export interface UserListResponse {
  message: string;
  data: UserListDTO[];
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
export interface ProductImageDTO {
  id: number;
  imageUrl: string;
  productId: number;
  altText: string;
  isMain: boolean;
  displayOrder: number;
}

export interface ProductPricingDTO {
  productId: number;
  originalPrice: number;
  basePrice: number;
  effectivePrice: number;
  productDiscountAmount: number;
  eventDiscountAmount: number;
  totalDiscountAmount: number;
  totalDiscountPercentage: number;
  hasProductDiscount: boolean;
  hasEventDiscount: boolean;
  hasAnyDiscount: boolean;
  isOnSale: boolean;
  activeEventId?: number;
  activeEventName?: string;
  eventTagLine?: string;
  promotionType?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  hasActiveEvent: boolean;
  isEventActive: boolean;
  eventTimeRemaining?: string;
  isEventExpiringSoon: boolean;
  formattedOriginalPrice: string;
  formattedEffectivePrice: string;
  formattedSavings: string;
  formattedDiscountBreakdown: string;
  eventStatus: string;
  isPriceStable: boolean;
  calculatedAt: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  marketPrice: number;
  costPrice: number;
  discountPrice: number;
  discountPercentage?: number;
  stockQuantity: number;
  reservedStock: number;
  sku: string;
  weight: string;
  reviews: number;
  rating: number;
  dimensions: string;
  isDeleted: boolean;
  categoryId: number;
  subSubCategoryId?: number;
  availableStock: number;
  isInStock: boolean;
  hasProductDiscount: boolean;
  basePrice: number;
  productDiscountAmount: number;
  formattedMarketPrice: string;
  formattedBasePrice: string;
  formattedDiscountAmount: string;
  stockStatus: string;
  images: ProductImageDTO[];
  pricing?: ProductPricingDTO;
  stock?: any;
  currentPrice: number;
  isOnSale: boolean;
  canAddToCart: boolean;
  displayPrice: string;
  displayStatus: string;
  totalSavingsAmount: number;
  formattedSavings: string;
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
  address: string[];
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

// SubCategory types
export interface SubCategoryDTO {
  subCategoryId: number;
  name: string;
  description: string;
  categoryId: number;
  imageUrl: string;
  isActive: boolean;
  slug?: string;
}

export interface SubCategoryListResponse {
  message: string;
  data: SubCategoryDTO[];
}

// SubSubCategory types  
export interface SubSubCategoryDTO {
  subSubCategoryId: number;
  name: string;
  description: string;
  subCategoryId: number;
  imageUrl: string;
  isActive: boolean;
  slug?: string;
}

export interface SubSubCategoryListResponse {
  message: string;
  data: SubSubCategoryDTO[];
}

// Payment Method types
export interface PaymentMethodDTO {
  id: number;
  name: string; 
  type: number; // 1: esewa , 2:khalti , 3: Cod
  isActive: boolean;
  imageUrl?: string;
}

export interface PaymentMethodListResponse {
  message: string;
  data: PaymentMethodDTO[];
}

// Updated Payment Method types for new API
export enum PaymentMethodType {
  DigitalPayments = 1,
  COD = 2
}

export interface NewPaymentMethodDTO {
  id: number;
  name: string;
  type: PaymentMethodType;
  logo: string;
  paymentRequests?: PaymentRequestDetailDTO[];
  isDeleted?: boolean;
}

// Payment Request types for new API
export interface PaymentRequestDetailDTO {
  id: number;
  userId: number;
  orderId: number;
  paymentMethodId: number;
  paymentAmount: number;
  currency: string;
  description: string;
  paymentStatus: string;
  paymentUrl?: string;
  khaltiPidx?: string;
  esewaTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  instructions: string;
  requiresRedirect: boolean;
  metadata: {
    provider: string;
    transactionId: string;
    hasPaymentUrl: string;
  };
  userName: string;
  paymentMethodName: string;
  orderTotal: number;
}

export interface PaymentRequestResponse {
  message: string;
  data: PaymentRequestDetailDTO[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaymentRequestByUserResponse {
  message: string;
  data: PaymentRequestDetailDTO[];
}

// Billing types
export interface BillingDTO {
  billingId: number;
  userId: number;
  userName?: string;
  orderId: number;
  amount: number;
  billingDate: string;
  status: string;
  description?: string;
  paymentMethodId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BillingListResponse {
  message: string;
  data: BillingDTO[];
}

// Transaction types
export interface TransactionDTO {
  transactionId: number;
  userId: number;
  userName?: string;
  orderId?: number;
  billingId?: number;
  amount: number;
  transactionType: string; // 'payment', 'refund', 'adjustment', etc.
  status: string; // 'pending', 'completed', 'failed', 'cancelled'
  description?: string;
  paymentMethodId?: number;
  paymentMethodName?: string;
  referenceNumber?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionListResponse {
  message: string;
  data: TransactionDTO[];
}

export interface TransactionDetailResponse {
  message: string;
  data: TransactionDTO;
}

// Company Info types
export interface CompanyInfoDTO {
  id?: number;
  name: string;
  email: string;
  contact: string;
  registrationNumber: string;
  registeredPanNumber: string;
  registeredVatNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  logoUrl?: string;
  websiteUrl: string;
  createdAt?: string;
  updateAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CreateCompanyInfoRequest {
  name: string;
  email: string;
  contact: string;
  registrationNumber: string;
  registeredPanNumber: string;
  registeredVatNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  websiteUrl: string;
  createdAt: string;
}

export interface UpdateCompanyInfoRequest {
  name: string;
  email: string;
  contact: string;
  registrationNumber: string;
  registeredPanNumber: string;
  registeredVatNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  websiteUrl: string;
  updatedAt: string;
}

export interface CompanyInfoListResponse {
  message: string;
  data: CompanyInfoDTO[];
}

export interface CompanyInfoDetailResponse {
  message: string;
  data: CompanyInfoDTO;
}
