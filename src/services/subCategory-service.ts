import { BaseApiService } from '@/shared/services/base-api';
import { SubCategoryDTO } from '@/types/api';
export class SubCategoryService extends BaseApiService{
    // SubCategory Management
      async getSubCategories(params: { page?: number; pageSize?: number; search?: string } = {}) {
        let url = `${this.BASE_URL}/subCategory/getAllSubCategory`;
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
          throw new Error(result.message || 'Failed to fetch subcategories');
        }
        return result;

        
      }
    
      async createSubCategory(categoryId: number, name: string, slug: string, description: string, imageFile?: File) {
        const queryParams = new URLSearchParams();
        queryParams.append('CategoryId', categoryId.toString());
        queryParams.append('Name', name);
        queryParams.append('Slug', slug);
        queryParams.append('Description', description);
        
        const url = `${this.BASE_URL}/subCategory/create-subCategory?${queryParams.toString()}`;
        
        const formData = new FormData();
        if (imageFile) {
          formData.append('File', imageFile);
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: this.getFormHeaders(),
          body: formData
        });
        const result = await this.handleResponse<SubCategoryDTO>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to create subcategory');
        }
        return result;
      }
    
      async updateSubCategory(id: number, name: string, slug: string, description: string, imageFile?: File) {
        const queryParams = new URLSearchParams();
        queryParams.append('SubCategoryId', id.toString());
        queryParams.append('Name', name);
        queryParams.append('Slug', slug);
        queryParams.append('Description', description);
        
        const url = `${this.BASE_URL}/subCategory/updateSubCategory?${queryParams.toString()}`;
        
        const formData = new FormData();
        if (imageFile) {
          formData.append('File', imageFile);
        } else {
          formData.append('File', '');
        }
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: this.getFormHeaders(),
          body: formData
        });
        const result = await this.handleResponse<SubCategoryDTO>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to update subcategory');
        }
        return result;
      }
    
      async deleteSubCategory(id: number) {
        const response = await fetch(`${this.BASE_URL}/SubCategory/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        const result = await this.handleResponse<void>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete subcategory');
        }
        return result;
      }
    
      async softDeleteSubCategory(id: number) {
        const response = await fetch(`${this.BASE_URL}/subCategory/softDeleteSubCategory?SubCategoryId=${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        const result = await this.handleResponse<void>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to soft delete subcategory');
        }
        return result;
      }
    
      async hardDeleteSubCategory(id: number) {
        const response = await fetch(`${this.BASE_URL}/subCategory/hardDeleteSubCategory?SubCategoryId=${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        const result = await this.handleResponse<void>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to permanently delete subcategory');
        }
        return result;
      }
    
      async unDeleteSubCategory(id: number) {
        const response = await fetch(`${this.BASE_URL}/subCategory/unDeleteSubCategory?SubCategoryId=${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        const result = await this.handleResponse<void>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to restore subcategory');
        }
        return result;
      }

}