import { 
  LoginRequest, 
  LoginResponse, 
  DashboardResponse, 
  UpdateUserRoleRequest, 
  UpdateUserRoleResponse, 
  UserListResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  VerifyOTPResponse
} from '@/types/api';

export const BASE_URL = 'http://110.34.2.30:5013';

class ApiService {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making request to: ${BASE_URL}${endpoint}`);
    console.log('Request config:', config);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login with:', credentials);
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOtp(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return this.request<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async forgotPassword(data: { email: string; newPassword: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOtpResetPassword(email: string, otp: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/verify-otp-reset-password?email=${encodeURIComponent(email)}&otp=${otp}`, {
      method: 'POST',
    });
  }

  async logout(refreshToken: string): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User endpoints
  async getUsers(pageNumber: number = 1, pageSize: number = 10): Promise<UserListResponse> {
    return this.request<UserListResponse>(`/user/getUsers?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  async uploadUserImage(userId: number, file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ message: string }>(`/user/${userId}/image`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async updateUser(id: number, data: { name: string; email: string; password?: string; contact: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async softDeleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`${BASE_URL}/user/softDeleteUser?${id}`, {
      method: 'DELETE',
    });
  }

  async unDeleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/unDeleteUser?${id}`, {
      method: 'PUT',
    });
  }

  async hardDeleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/user/hardDeleteUser?${id}`, {
      method: 'DELETE',
    });
  }

  // Category endpoints
  async getCategories(pageNumber: number = 1, pageSize: number = 10): Promise<{ message: string; data: any[] }> {
    return this.request<{ message: string; data: any[] }>(`/category/getAllCategory?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  async createCategory(formData: FormData): Promise<{ message: string; data: any }> {
    return this.request<{ message: string; data: any }>('/category/create', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async updateCategory(categoryId: number, formData: FormData): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/category/updateCategory?CategoryId=${categoryId}`, {
      method: 'PUT',
      headers: {},
      body: formData,
    });
  }

  async softDeleteCategory(categoryId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/category/softDeleteCategory?categoryId=${categoryId}`, {
      method: 'DELETE',
    });
  }

  async unDeleteCategory(categoryId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/category/unDeleteCategory?categoryId=${categoryId}`, {
      method: 'POST',
    });
  }

  async hardDeleteCategory(categoryId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/category/hardDeleteCategory?categoryId=${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Company Info endpoints
  async createCompanyInfo(data: any): Promise<{ message: string; data: any }> {
    return this.request<{ message: string; data: any }>('/createCompanyInfo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllCompanyInfo(pageNumber: number = 1, pageSize: number = 10): Promise<{ message: string; data: any[] }> {
    return this.request<{ message: string; data: any[] }>(`/getAllCompanyInfo?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

  async uploadCompanyLogo(id: number, file: File): Promise<{ message: string; data: any }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<{ message: string; data: any }>(`/uploadCompanyLogo?Id=${id}`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async updateCompanyInfo(id: number, data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/updateCompanyInfo?Id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async hardDeleteCompanyInfo(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hardDelete?Id=${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/admin/dashboard');
  }

  // Products
  async getProducts(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/products/getAllProducts');
  }

  async createProduct(data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>('/products/create-product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>('/products/updateProduct', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/hardDeleteProduct?productId=${id}`, {
      method: 'DELETE',
    });
  }

  async getOrders(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/Order/getAllOrder');
  }

  async updateOrderStatus(orderId: number, status: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/Order/confirmOrderStatus', {
      method: 'PUT',
      body: JSON.stringify({ orderId, orderStatus: status }),
    });
  }

  async getStores(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/store/getAllStores');
  }

  async createStore(data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>('/store/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStore(data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>('/store/updateStore', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStore(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/store/hardDeleteStore?storeId=${id}`, {
      method: 'DELETE',
    });
  }

  async getPaymentRequests(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/payment/requests');
  }

  async updatePaymentStatus(paymentRequestId: number, status: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/payment/updatePaymentStatus', {
      method: 'PUT',
      body: JSON.stringify({ paymentRequestId, paymentStatus: status }),
    });
  }

  // User role management
  async updateUserRole(userId: number, role: number): Promise<UpdateUserRoleResponse> {
    return this.request<UpdateUserRoleResponse>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
}

export const apiService = new ApiService();
