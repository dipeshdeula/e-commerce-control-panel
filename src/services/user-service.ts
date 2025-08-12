import { BaseApiService } from '@/shared/services/base-api';
import { UserListDTO } from '@/types/api';

export class UserService extends BaseApiService {
  async getUsers(params: { page?: number; pageSize?: number; search?: string } = {}) {
    let url = `${this.BASE_URL}/user/getUsers`;
    const { page = 1, pageSize = 10, search } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    if (search) {
      queryParams.append('search', search);
    }
    
    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log("user:", response);
    return this.handleResponse<UserListDTO[]>(response);
  }

  async getUserById(id: number) {
    const response = await fetch(`${this.BASE_URL}/user/getUserById?id=${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // User registration (create new user) – address removed per requirements
  async register(userData: { name: string; email: string; password: string; contact: string }) {
    const response = await fetch(`${this.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to register user');
    }
    return result;
  }

  // OTP verification
  async verifyOtp(data: { email: string; otp: string }) {
    const response = await fetch(`${this.BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to verify OTP');
    }
    return result;
  }

  // Update user – address removed per requirements
  async updateUser(id: number, userData: { name: string; email: string; password?: string; contact: string }) {
    const response = await fetch(`${this.BASE_URL}/user/updateUser?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update user');
    }
    return result;
  }

  // Soft delete user
  async softDeleteUser(id: number) {
    const response = await fetch(`${this.BASE_URL}/user/softDeleteUser?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<{ message: string }>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to soft delete user');
    }
    return result;
  }

  // Hard delete user
  async hardDeleteUser(id: number) {
    const response = await fetch(`${this.BASE_URL}/user/hardDeleteUser?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<{ message: string }>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to permanently delete user');
    }
    return result;
  }

  // Undelete user (restore)
  async unDeleteUser(id: number) {
    const response = await fetch(`${this.BASE_URL}/user/undeleteUser?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<{ message: string }>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to restore user');
    }
    return result;
  }

  // Update user role (for admins only)
  async updateUserRole(userId: number, role: number) {
    const formData = new FormData();
    formData.append('Role', role.toString());

    const response = await fetch(`${this.BASE_URL}/admin/updateUserRole?UserId=${userId}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    
    const result = await this.handleResponse<{ message: string; data: string }>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update user role');
    }
    return result;
  }

  // Upload user image – as multipart/form-data, expects field name 'file' and POST to /user/upload?userId=
  async uploadUserImage(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.BASE_URL}/user/upload?userId=${userId}`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    const result = await this.handleResponse<{ message: string }>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload user image');
    }
    return result;
  }

  // Add user address – POST /address/add?UserId=
  async addUserAddress(
    userId: number,
    address: {
      label: string;
      street: string;
      city: string;
      province: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    const response = await fetch(`${this.BASE_URL}/address/add?UserId=${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(address),
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to add user address');
    }
    return result;
  }

  // Update user address – PUT /address/updateAddress?id=
  async updateUserAddress(
    addressId: number,
    address: {
      label: string;
      street: string;
      city: string;
      province: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    const response = await fetch(`${this.BASE_URL}/address/updateAddress?id=${addressId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(address),
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update user address');
    }
    return result;
  }
}
