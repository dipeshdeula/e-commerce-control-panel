
import { 
  UserListDTO, 
  Role, 
  UpdateUserRoleResponse,
  CategoryDTO,
  SubCategoryDTO,
  SubSubCategoryDTO,
  ProductDTO,
  OrderDTO,
  PaymentMethodDTO,
  PaymentRequestDTO,
  StoreDTO,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  AdminDashboardDTO
} from '@/types/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiService {
  public BASE_URL = 'http://110.34.2.30:5013/api';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private getFormHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: response.ok ? undefined : data.message || 'An error occurred'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to parse response'
      };
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await fetch(`${this.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<RegisterResponse>(response);
  }

  async verifyOtp(otpData: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> {
    const response = await fetch(`${this.BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(otpData)
    });
    return this.handleResponse<VerifyOTPResponse>(response);
  }

  // Dashboard
  async getDashboard(): Promise<ApiResponse<AdminDashboardDTO>> {
    const response = await fetch(`${this.BASE_URL}/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<AdminDashboardDTO>(response);
  }

  // User Management
  async getUsers(page?: number, pageSize?: number): Promise<ApiResponse<UserListDTO[]>> {
    let url = `${this.BASE_URL}/User/getAllUsers`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<UserListDTO[]>(response);
  }

  async updateUserRole(userId: number, role: Role): Promise<ApiResponse<UpdateUserRoleResponse>> {
    const response = await fetch(`${this.BASE_URL}/User/updateUserRole`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, role })
    });
    return this.handleResponse<UpdateUserRoleResponse>(response);
  }

  async updateUser(id: number, userData: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.BASE_URL}/User/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<any>(response);
  }

  async uploadUserImage(userId: number, formData: FormData): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.BASE_URL}/User/upload-image/${userId}`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<any>(response);
  }

  async softDeleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/User/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/User/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/User/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Category Management
  async getCategories(page?: number, pageSize?: number): Promise<ApiResponse<CategoryDTO[]>> {
    let url = `${this.BASE_URL}/Category`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CategoryDTO[]>(response);
  }

  async createCategory(formData: FormData): Promise<ApiResponse<CategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/Category`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<CategoryDTO>(response);
  }

  async updateCategory(id: number, formData: FormData): Promise<ApiResponse<CategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/Category/${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<CategoryDTO>(response);
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Category/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Category/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Category/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Category/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // SubCategory Management
  async getSubCategories(page?: number, pageSize?: number): Promise<ApiResponse<SubCategoryDTO[]>> {
    let url = `${this.BASE_URL}/SubCategory`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<SubCategoryDTO[]>(response);
  }

  async createSubCategory(subCategory: Omit<SubCategoryDTO, 'subCategoryId'>): Promise<ApiResponse<SubCategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subCategory)
    });
    return this.handleResponse<SubCategoryDTO>(response);
  }

  async updateSubCategory(id: number, subCategory: Partial<SubCategoryDTO>): Promise<ApiResponse<SubCategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subCategory)
    });
    return this.handleResponse<SubCategoryDTO>(response);
  }

  async deleteSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // SubSubCategory Management
  async getSubSubCategories(page?: number, pageSize?: number): Promise<ApiResponse<SubSubCategoryDTO[]>> {
    let url = `${this.BASE_URL}/SubSubCategory`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<SubSubCategoryDTO[]>(response);
  }

  async createSubSubCategory(subSubCategory: Omit<SubSubCategoryDTO, 'subSubCategoryId'>): Promise<ApiResponse<SubSubCategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subSubCategory)
    });
    return this.handleResponse<SubSubCategoryDTO>(response);
  }

  async updateSubSubCategory(id: number, subSubCategory: Partial<SubSubCategoryDTO>): Promise<ApiResponse<SubSubCategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subSubCategory)
    });
    return this.handleResponse<SubSubCategoryDTO>(response);
  }

  async deleteSubSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteSubSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteSubSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteSubSubCategory(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Product Management
  async getProducts(page?: number, pageSize?: number): Promise<ApiResponse<ProductDTO[]>> {
    let url = `${this.BASE_URL}/Product`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ProductDTO[]>(response);
  }

  async createProduct(product: Omit<ProductDTO, 'productId'>): Promise<ApiResponse<ProductDTO>> {
    const response = await fetch(`${this.BASE_URL}/Product`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async updateProduct(id: number, product: Partial<ProductDTO>): Promise<ApiResponse<ProductDTO>> {
    const response = await fetch(`${this.BASE_URL}/Product/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Product/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Product/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/Product/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Order Management
  async getOrders(): Promise<ApiResponse<OrderDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/Order/getAllOrder`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO[]>(response);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse<OrderDTO>> {
    const response = await fetch(`${this.BASE_URL}/Order/confirmOrderStatus`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderId, status })
    });
    return this.handleResponse<OrderDTO>(response);
  }

  // Payment Method Management
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethodDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/paymentMethod`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<PaymentMethodDTO[]>(response);
  }

  async createPaymentMethod(paymentMethod: Omit<PaymentMethodDTO, 'id'>): Promise<ApiResponse<PaymentMethodDTO>> {
    const response = await fetch(`${this.BASE_URL}/paymentMethod`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentMethod)
    });
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async updatePaymentMethod(id: number, paymentMethod: Partial<PaymentMethodDTO>): Promise<ApiResponse<PaymentMethodDTO>> {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentMethod)
    });
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async deletePaymentMethod(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Payment Request Management
  async getPaymentRequests(): Promise<ApiResponse<PaymentRequestDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/paymentRequest`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<PaymentRequestDTO[]>(response);
  }

  async createPaymentRequest(paymentRequest: Omit<PaymentRequestDTO, 'id'>): Promise<ApiResponse<PaymentRequestDTO>> {
    const response = await fetch(`${this.BASE_URL}/paymentRequest`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentRequest)
    });
    return this.handleResponse<PaymentRequestDTO>(response);
  }

  async updatePaymentRequest(id: number, paymentRequest: Partial<PaymentRequestDTO>): Promise<ApiResponse<PaymentRequestDTO>> {
    const response = await fetch(`${this.BASE_URL}/paymentRequest/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentRequest)
    });
    return this.handleResponse<PaymentRequestDTO>(response);
  }

  async deletePaymentRequest(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/paymentRequest/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Store Management
  async getStores(): Promise<ApiResponse<StoreDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/Store`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<StoreDTO[]>(response);
  }

  // Company Info Management
  async getAllCompanyInfo(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.BASE_URL}/company-info`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  async createCompanyInfo(companyData: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.BASE_URL}/company-info`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    return this.handleResponse<any>(response);
  }

  async updateCompanyInfo(id: number, companyData: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.BASE_URL}/company-info/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    return this.handleResponse<any>(response);
  }

  async uploadCompanyLogo(formData: FormData): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.BASE_URL}/company-info/upload-logo`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<any>(response);
  }

  async hardDeleteCompanyInfo(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.BASE_URL}/company-info/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Generic request method for pages that use it
  async request(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers
      }
    });
    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();
export const BASE_URL = apiService.BASE_URL;
