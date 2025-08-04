
import { BaseApiService } from '@/shared/services/base-api';
import { StoreDTO } from '@/types/api';

export class StoreService extends BaseApiService {
  // Store Management
  async getStores(params:{page?:number,pageSize?:number} = {}) {
    let url = `${this.BASE_URL}/store/getAllStores`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    url += `?${queryParams.toString()}`;
    
    const response = await fetch(url,{
      headers : this.getAuthHeaders() 
    });

    console.log("store:", response);

    const result = await this.handleResponse<StoreDTO[]>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to fetch stores');
    }

    return result;
  }

  async createStore(name:string,ownerName:string,imageFile?:File)
  {
    const formData = new FormData();

    formData.append('Name',name);
    formData.append('OwnerName',ownerName);
    if(imageFile)
    {
      formData.append('File',imageFile);
    }

    const url = `${this.BASE_URL}/store/create`

    const response = await fetch(url,{
      method:'POST',
      headers:this.getFormHeaders(),
      body:formData
    });

   const result = await this.handleResponse<any>(response);
   if(!result.success)
   {
    throw new Error(result.message || 'Failed to create store');
   }
   return result;
  }

   async updateStore(id:number,name:string,ownerName:string,imageFile?:File)
  {
    const formData = new FormData();
    formData.append('Name',name);
    formData.append('OwnerName',ownerName);
    if(imageFile) {
      formData.append('File',imageFile);
    }

    const url = `${this.BASE_URL}/store/updateStore?Id=${id}`;

    const response = await fetch(url,{
      method:'PUT',
      headers:this.getFormHeaders(),
      body:formData
    })
    const result = await this.handleResponse<any>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to update store');
    }
    return result;
  }

  async softDeleteStore(id:number)
  {
    const response = await fetch(`${this.BASE_URL}/store/softDeleteStore?Id=${id}`,{
      method : 'DELETE',
      headers : this.getAuthHeaders()
    });

    const result = await this.handleResponse<void>(response);

    if(!result.success)
    {
      throw new Error(result.message || 'Failed to soft delete store');
    }
    return result;
  }

  async hardDeleteStore(id:number)
  {
    const response = await fetch(`${this.BASE_URL}/store/hardDeleteStore?Id=${id}`,{
      method:'DELETE',
      headers:this.getAuthHeaders()
    });

    const result = await this.handleResponse<void>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to hard delete store');
    }
    return result;
  }

  async unDeleteStore(id:number)
  {
    const response =  await fetch(`${this.BASE_URL}/store/unDeleteStore?Id=${id}`,{
      method:'DELETE',
      headers: this.getAuthHeaders()
    });

    const result = await this.handleResponse<void>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to un-delete store');
    }
    return result;
  }

  // Store Address Management
  async addStoreAddress(storeId: number, addressData: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  }) {
    const response = await fetch(`${this.BASE_URL}/StoreAddress/add?storeId=${storeId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addressData)
    });

    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to add store address');
    }
    return result;
  }

  async updateStoreAddress(storeId: number, addressData: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  }) {
    const response = await fetch(`${this.BASE_URL}/StoreAddress/updateStoreAddress?StoreId=${storeId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addressData)
    });

    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update store address');
    }
    return result;
  }

  // Product Store Management
  async createProductStore(storeId: number, productId: number) {
    const response = await fetch(`${this.BASE_URL}/ProductStore/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ storeId, productId })
    });

    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to create product store association');
    }
    return result;
  }

  async getAllProductStore(params: { page?: number; pageSize?: number } = {}) {
    let url = `${this.BASE_URL}/ProductStore/getAllProductStore`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    url += `?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch product stores');
    }
    return result;
  }

  async getProductsByStoreId(storeId: number, params: { page?: number; pageSize?: number } = {}) {
    let url = `${this.BASE_URL}/ProductStore/getAllProductByStoreId`;
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('StoreId', storeId.toString());
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    url += `?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch products by store');
    }
    return result;
  }
}
