
import { BaseApiService } from './base-api';
import { PaymentMethodDTO, PaymentRequestDTO } from '@/types/api';

export class PaymentService extends BaseApiService {
  // Payment Method Management
  async getPaymentMethods() {
    const response = await fetch(`${this.BASE_URL}/paymentMethod`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<PaymentMethodDTO[]>(response);
  }

  async createPaymentMethod(paymentMethod: Omit<PaymentMethodDTO, 'id'>) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentMethod)
    });
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async updatePaymentMethod(id: number, paymentMethod: Partial<PaymentMethodDTO>) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentMethod)
    });
    return this.handleResponse<PaymentMethodDTO>(response);
  }

  async deletePaymentMethod(id: number) {
    const response = await fetch(`${this.BASE_URL}/paymentMethod/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }

  // Payment Request Management
  async getPaymentRequests() {
    const response = await fetch(`${this.BASE_URL}/paymentRequest`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<PaymentRequestDTO[]>(response);
  }

  async createPaymentRequest(paymentRequest: Omit<PaymentRequestDTO, 'id'>) {
    const response = await fetch(`${this.BASE_URL}/paymentRequest`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentRequest)
    });
    return this.handleResponse<PaymentRequestDTO>(response);
  }

  async updatePaymentRequest(id: number, paymentRequest: Partial<PaymentRequestDTO>) {
    const response = await fetch(`${this.BASE_URL}/paymentRequest/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentRequest)
    });
    return this.handleResponse<PaymentRequestDTO>(response);
  }

  async deletePaymentRequest(id: number) {
    const response = await fetch(`${this.BASE_URL}/paymentRequest/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }
}
