
import { LoginRequest, LoginResponse, DashboardResponse } from '@/types/api';

const BASE_URL = 'http://110.34.2.30:5013';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Auth
  async login(credentials: LoginRequest): Promise<LoginResponse> {
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

  // Categories
  async getCategories() {
    return this.request('/category/getAllCategories');
  }

  // Orders
  async getOrders() {
    return this.request('/Order/getAllOrder');
  }

  // Users
  async getUsers() {
    return this.request('/users/getAllUsers');
  }

  // Stores
  async getStores() {
    return this.request('/store/getAllStores');
  }

  // Payment Requests
  async getPaymentRequests() {
    return this.request('/payment/requests');
  }
}

export const apiService = new ApiService();
