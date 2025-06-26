
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
  StoreDTO
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

  // User Management
  async getUsers(): Promise<ApiResponse<UserListDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/User/getAllUsers`, {
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

  // Category Management
  async getCategories(): Promise<ApiResponse<CategoryDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/Category`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CategoryDTO[]>(response);
  }

  async createCategory(category: Omit<CategoryDTO, 'categoryId'>): Promise<ApiResponse<CategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/Category`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(category)
    });
    return this.handleResponse<CategoryDTO>(response);
  }

  async updateCategory(id: number, category: Partial<CategoryDTO>): Promise<ApiResponse<CategoryDTO>> {
    const response = await fetch(`${this.BASE_URL}/Category/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(category)
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

  // SubCategory Management
  async getSubCategories(): Promise<ApiResponse<SubCategoryDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/SubCategory`, {
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

  // SubSubCategory Management
  async getSubSubCategories(): Promise<ApiResponse<SubSubCategoryDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory`, {
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

  // Product Management
  async getProducts(): Promise<ApiResponse<ProductDTO[]>> {
    const response = await fetch(`${this.BASE_URL}/Product`, {
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
}

export const apiService = new ApiService();
