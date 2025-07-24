
import { BaseApiService } from '@/shared/services/base-api';
import { UserListDTO, Role, UpdateUserRoleResponse } from '@/types/api';

export class UserService extends BaseApiService {
  async getUsers(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/User/getAllUsers`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<UserListDTO[]>(response);
  }

  async updateUserRole(userId: number, role: Role) {
    const response = await fetch(`${this.BASE_URL}/User/updateUserRole`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, role })
    });
    return this.handleResponse<UpdateUserRoleResponse>(response);
  }

  async updateUser(id: number, userData: any) {
    const response = await fetch(`${this.BASE_URL}/User/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<any>(response);
  }

  async uploadUserImage(userId: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/User/upload-image/${userId}`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<any>(response);
  }

  async softDeleteUser(id: number) {
    const response = await fetch(`${this.BASE_URL}/User/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteUser(id: number) {
    const response = await fetch(`${this.BASE_URL}/User/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteUser(id: number) {
    const response = await fetch(`${this.BASE_URL}/User/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }
}
