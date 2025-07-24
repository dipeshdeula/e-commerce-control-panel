
import { BaseApiService } from '@/shared/services/base-api';
import { CategoryDTO, SubCategoryDTO, SubSubCategoryDTO } from '@/types/api';

export class CategoryService extends BaseApiService {
  // Category Management
  async getCategories(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/Category`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CategoryDTO[]>(response);
  }

  async createCategory(formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/Category`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<CategoryDTO>(response);
  }

  async updateCategory(id: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/Category/${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<CategoryDTO>(response);
  }

  async deleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/Category/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/Category/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/Category/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/Category/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // SubCategory Management
  async getSubCategories(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/SubCategory`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<SubCategoryDTO[]>(response);
  }

  async createSubCategory(formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/SubCategory`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<SubCategoryDTO>(response);
  }

  async updateSubCategory(id: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/SubCategory/${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<SubCategoryDTO>(response);
  }

  async deleteSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubCategory/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubCategory/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubCategory/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubCategory/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // SubSubCategory Management
  async getSubSubCategories(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/SubSubCategory`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<SubSubCategoryDTO[]>(response);
  }

  async createSubSubCategory(formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<SubSubCategoryDTO>(response);
  }

  async updateSubSubCategory(id: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<SubSubCategoryDTO>(response);
  }

  async deleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async hardDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async unDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }
}
