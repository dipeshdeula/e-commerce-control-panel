import { BaseApiService } from '@/shared/services/base-api';
import { SubSubCategoryDTO } from '@/types/api';

export class SubSubCategoryService extends BaseApiService 
{
    // SubSubCategory Management
  async getSubSubCategories(params: {page?: number, pageSize?: number} = {}) {
    let url = `${this.BASE_URL}/subSubCategory/getAllSubSubCategory`;
    const {page=1,pageSize=10} = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());

    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<SubSubCategoryDTO[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch sub-subcategories');
    }
    return result;
  }

  async createSubSubCategory(subCategoryId:number, name:string, slug:string, description:string, imageFile?:File) {
    const queryParams = new URLSearchParams();
    queryParams.append('SubCategoryId', subCategoryId.toString());
    queryParams.append('Name', name);
    queryParams.append('Slug', slug);
    queryParams.append('Description', description);

    const url = `${this.BASE_URL}/subSubCategory/create-subSubCategory?${queryParams.toString()}`;

    const formData = new FormData();
    if(imageFile)
    {
        formData.append('File', imageFile);
    }

    const response = await fetch(url, {
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

  async updateSubSubCategory(id: number, name: string,slug:string,descripton:string, imageFile?:File) {
    const queryParams = new URLSearchParams();
    queryParams.append('SubSubCategoryId', id.toString());
    queryParams.append('Name', name);
    queryParams.append('Slug', slug);
    queryParams.append('Description', descripton);
    const url = `${this.BASE_URL}/subSubCategory/updateSubSubCategory?${queryParams.toString()}`;

    const formData = new FormData();
    if (imageFile) {
      formData.append('File', imageFile);
    }

    const response = await fetch(url, {
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
        const response = await fetch(`${this.BASE_URL}/subSubCategory/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        const result = await this.handleResponse<void>(response);
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete subSubcategory');
        }
        return result;
      }
 

  async softDeleteSubSubCategory(id: number) {
    const response = await fetch(`${this.BASE_URL}/subSubCategory/softDeleteSubSubCategory?subSubCategoryId=${id}`, {
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
    const response = await fetch(`${this.BASE_URL}/subSubCategory/hardDeleteSubSubCategory?subSubCategoryId=${id}`, {
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
    const response = await fetch(`${this.BASE_URL}/subSubCategory/unDeleteSubSubCategory?subSubCategoryId=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to restore sub-subcategory');
    }
    return result;
  }
}