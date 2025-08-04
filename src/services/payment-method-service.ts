import { BaseApiService } from '@/shared/services/base-api';

export enum PaymentMethodType {
  DigitalPayments = 1,
  COD = 2
}

export interface PaymentMethodDTO {
  id: number;
  name: string;
  type: PaymentMethodType;
  logo: string;
  paymentRequests?: any[];
  isActive : boolean;
  supportedCurrencies?:string;
  requiresRedirect : boolean;
  isDeleted?: boolean;
}

export interface CreatePaymentMethodRequest {
  name: string;
  type: PaymentMethodType;
  file?: File;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
  type?: PaymentMethodType;
  file?: File;
}

export class PaymentMethodService extends BaseApiService {
  async createPaymentMethod(data: CreatePaymentMethodRequest) {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Type', data.type.toString());
    
    if (data.file) {
      formData.append('File', data.file);
    }

    const response = await fetch(`${this.BASE_URL}/paymentMethod/create`, {
      method: 'POST',
      headers: this.getFormHeaders(), // multipart form data
      body: formData
    });
    
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async getAllPaymentMethods(pageNumber?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/paymentMethod/getAllPaymentMethod`;
    const params = new URLSearchParams();
    
    if (pageNumber) params.append('PageNumber', pageNumber.toString());
    if (pageSize) params.append('PageSize', pageSize.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    console.log("pament method response", response);
    
    return this.handleResponse<PaymentMethodDTO[]>(response);
  }

  async updatePaymentMethod(id: number, data: UpdatePaymentMethodRequest) {
    const formData = new FormData();

    if (data.name) formData.append('ProviderName', data.name);
    if (data.type) formData.append('Type', data.type.toString());
    if (data.file) formData.append('File', data.file);

    const response = await fetch(`${this.BASE_URL}/paymentMethod/updatePaymentMethod?Id=${id}`, {
      method: 'PUT',
      headers: this.getFormHeaders(), // multipart form data
      body: formData
    });
    
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async softDeletePaymentMethod(id: number) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/softDeletePaymentMethod?Id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async unDeletePaymentMethod(id: number) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/unDeletePaymentMethod?Id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async hardDeletePaymentMethod(id: number) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/hardDeletePaymentMethod?Id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<PaymentMethodDTO>(response);
  }
}
