
import { BaseApiService } from '@/shared/services/base-api';
import { BillingDTO } from '@/types/api';

export class BillingService extends BaseApiService {
  async getBillings(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/billing`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<BillingDTO[]>(response);
  }

  async createBilling(billing: Omit<BillingDTO, 'billingId'>) {
    const response = await fetch(`${this.BASE_URL}/billing`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(billing)
    });
    return this.handleResponse<BillingDTO>(response);
  }

  async updateBilling(id: number, billing: Partial<BillingDTO>) {
    const response = await fetch(`${this.BASE_URL}/billing/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(billing)
    });
    return this.handleResponse<BillingDTO>(response);
  }

  async deleteBilling(id: number) {
    const response = await fetch(`${this.BASE_URL}/billing/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }
}
