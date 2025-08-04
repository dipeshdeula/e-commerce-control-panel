
import { BaseApiService } from '@/shared/services/base-api';

export class BillingService extends BaseApiService {
  // Get all bills with pagination
  async getAllBills(params?: { pageNumber?: number; pageSize?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('PageSize', params.pageSize.toString());

    const url = `${this.BASE_URL}/Billing/getAllBills${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Get all bill items with pagination
  async getAllBillItems(params?: { pageNumber?: number; pageSize?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('PageSize', params.pageSize.toString());

    const url = `${this.BASE_URL}/Billing/getAllBillItems${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Get bills by user ID
  async getBillByUserId(userId: number) {
    const response = await fetch(`${this.BASE_URL}/Billing/getBillByUserId?UserId=${userId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Soft delete bill
  async softDeleteBill(id: number) {
    const response = await fetch(`${this.BASE_URL}/Billing/softDeleteBill?Id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Undelete bill (restore from soft delete)
  async unDeleteBill(id: number) {
    const response = await fetch(`${this.BASE_URL}/Billing/unDeleteBill?Id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Hard delete bill
  async hardDeleteBill(id: number) {
    const response = await fetch(`${this.BASE_URL}/Billing/hardDeleteBill?Id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }
}
