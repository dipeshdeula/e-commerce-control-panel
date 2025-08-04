import { BaseApiService } from '@/shared/services/base-api';
import { PaymentMethodDTO, PaymentRequestDTO, StoreDTO } from '@/types/api';

export class PaymentService extends BaseApiService {
  // Payment Method Management
  async getPaymentMethods(params:{page?:number,pageSize?:number}={}) {
    let url = `${this.BASE_URL}/paymentMethod/getAllPaymentMethod`;
    const {page = 1,pageSize = 10} = params;

    const queryParams = new URLSearchParams();
    queryParams.append('PageNumber', page.toString());
    queryParams.append('PageSize', pageSize.toString());
    url += `?${queryParams.toString()}`;

    const response = await fetch(url,{
      headers : this.getAuthHeaders()
    });

    console.log("pament method response",response);
    const result = await this.handleResponse<PaymentMethodDTO[]>(response);

    if(!result.success) {
      throw new Error(result.message || 'Failed to fetch payment methods');
    }
    return result;
  }

  async createPaymentMethod(name:string,type:number,imageFile?:File) {
    const formData = new FormData();
    formData.append('name',name);
    formData.append('type',type.toString());
    if(imageFile) {
      formData.append('File',imageFile);
    }

    const url = `${this.BASE_URL}/paymentMethod/create`;

    const response = await fetch(url,{
      method:'POST',
      headers:this.getFormHeaders(),
      body:formData
    });

    const result = await this.handleResponse<any>(response);
    if(!result.success) {
      throw new Error(result.message || 'Failed to create payment method');
    }
    return result;
   
  }

  async updatePaymentMethod(id: number, name:string,type:number, imageFile?:File) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type.toString());
    if (imageFile) {
      formData.append('File', imageFile);
    }

    const url = `${this.BASE_URL}/paymentMethod/updatePaymentMethod?Id=${id}`;
    const response = await fetch(url,{
      method:'PUT',
      headers:this.getFormHeaders(),
      body:formData
    })

    const result = await this.handleResponse<any>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to update payment method');
    }
    return result;
  }

  async deletePaymentMethod(id: number) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  async softDeletePaymentMethod(id:number)
  {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/softDeletePaymentMethod?Id=${id}`,{
      method : 'DELETE',
      headers : this.getAuthHeaders()
    });

    const result = await this.handleResponse<void>(response);

    if(!result.success)
    {
      throw new Error(result.message || 'Failed to soft delete payment method');
    }
    return result;
  }

  async unDeletePaymentMethod(id:number)
  {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/unDeletePaymentMethod?Id=${id}`,{
      method:'DELETE',
      headers : this.getAuthHeaders()
    });
    const result = await this.handleResponse<void>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to restore payment method');
    }
    return result;
  }

  async hardDeletePaymentMethod(id:number)
  {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/hardDeletePaymentMethod?Id=${id}`,{
      method:'DELETE',
      headers:this.getAuthHeaders()
    });

    const result = await this.handleResponse<void>(response);
    if(!result.success)
    {
      throw new Error(result.message || 'Failed to permanent delete payment method');
    }

    return result;
  }

  
}
