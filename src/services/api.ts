
import { LoginRequest, LoginResponse, DashboardResponse } from '@/types/api';

const BASE_URL = 'http://110.34.2.30:5013';

class ApiService {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

  // Auth
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login with:', credentials);
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/admin/dashboard');
  }

  // Products
  async getProducts() {
    return this.request('/products/getAllProducts');
  }

  async createProduct(data: any) {
    return this.request('/products/create-product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(data: any) {
    return this.request('/products/updateProduct', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/hardDeleteProduct?productId=${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/category/getAllCategories');
  }

  async createCategory(data: any) {
    return this.request('/category/create-category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(data: any) {
    return this.request('/category/updateCategory', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/category/deleteCategory?categoryId=${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders() {
    return this.request('/Order/getAllOrder');
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.request('/Order/confirmOrderStatus', {
      method: 'PUT',
      body: JSON.stringify({ orderId, orderStatus: status }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users/getAllUsers');
  }

  async updateUser(data: any) {
    return this.request('/users/updateUser', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/deleteUser?userId=${id}`, {
      method: 'DELETE',
    });
  }

  // Stores
  async getStores() {
    return this.request('/store/getAllStores');
  }

  async createStore(data: any) {
    return this.request('/store/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStore(data: any) {
    return this.request('/store/updateStore', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStore(id: number) {
    return this.request(`/store/hardDeleteStore?storeId=${id}`, {
      method: 'DELETE',
    });
  }

  // Payment Requests
  async getPaymentRequests() {
    return this.request('/payment/requests');
  }

  async updatePaymentStatus(paymentRequestId: number, status: string) {
    return this.request('/payment/updatePaymentStatus', {
      method: 'PUT',
      body: JSON.stringify({ paymentRequestId, paymentStatus: status }),
    });
  }
}

export const apiService = new ApiService();
