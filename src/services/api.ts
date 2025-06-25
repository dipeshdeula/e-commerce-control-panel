
import { LoginRequest, LoginResponse, DashboardResponse } from '@/types/api';

const BASE_URL = 'http://110.34.2.30:5013';

class ApiService {
  private async request<T>(
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
