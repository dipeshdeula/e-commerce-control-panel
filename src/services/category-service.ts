
import { BaseApiService } from '@/shared/services/base-api';
import { CategoryDTO } from '@/types/api';

export class CategoryService extends BaseApiService {
  // Category Management
  async getCategories(params: { page?: number; pageSize?: number; search?: string } = {}) {
    let url = `${this.BASE_URL}/category/getAllCategory`;
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
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch categories');
    }
    return result;
  }

  async createCategory(formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/category/create`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    const result = await this.handleResponse<CategoryDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to create category');
    }
    return result;
  }

  async updateCategory(id: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/category/updateCategory?CategoryId=${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(),
      body: formData
    });
    const result = await this.handleResponse<CategoryDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update category');
    }
    return result;
  }

  async deleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/Category/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete category');
    }
    return result;
  }

  async softDeleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/category/softDeleteCategory?categoryId=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to soft delete category');
    }
    return result;
  }

  async hardDeleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/category/hardDeleteCategory?categoryId=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to permanently delete category');
    }
    return result;
  }

    async getSubCategoriesByCategoryId(categoryId: number, pageNumber: number = 1, pageSize: number = 10) {
      const url = `${this.BASE_URL}/category/getAllSubCategoryByCategoryId?categoryId=${categoryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const response = await fetch(url, { headers: this.getAuthHeaders() });
      const result = await this.handleResponse<any>(response);
      console.log(`Fetching subcategories for categoryId ${categoryId} with page ${pageNumber} and size ${pageSize}`);
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch subcategories');
      }
      return result;
    }

    async getSubSubCategoriesByCategoryId(categoryId: number, pageNumber: number = 1, pageSize: number = 10) {
      const url = `${this.BASE_URL}/category/getAllSubSubCategoryByCategoryId?categoryId=${categoryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const response = await fetch(url, { headers: this.getAuthHeaders() });
      const result = await this.handleResponse<any>(response);
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch subsubcategories');
      }
      return result;
    }
  async unDeleteCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/category/unDeleteCategory?categoryId=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to restore category');
    }
    return result;
  }
    
}
