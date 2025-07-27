import { BaseApiService } from '@/shared/services/base-api';
import { SubSubCategoryDTO } from '@/types/api';

export class SubSubCategoryService extends BaseApiService 
{
    // SubSubCategory Management
  async getSubSubCategories(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/SubSubCategory`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<SubSubCategoryDTO[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch sub-subcategories');
    }
    return result;
  }

  async createSubSubCategory(formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    const result = await this.handleResponse<SubSubCategoryDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to create sub-subcategory');
    }
    return result;
  }

  async updateSubSubCategory(id: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    const result = await this.handleResponse<SubSubCategoryDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update sub-subcategory');
    }
    return result;
  }

  async deleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete sub-subcategory');
    }
    return result;
  }

  async softDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/soft-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to soft delete sub-subcategory');
    }
    return result;
  }

  async hardDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to permanently delete sub-subcategory');
    }
    return result;
  }

  async unDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/SubSubCategory/restore/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to restore sub-subcategory');
    }
    return result;
  }
}