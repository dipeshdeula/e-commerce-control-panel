
import { BaseApiService } from './base-api';

export class CompanyService extends BaseApiService {
  async getAllCompanyInfo(page?: number, pageSize?: number) {
    let url = `${this.BASE_URL}/company-info`;
    if (page && pageSize) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  async createCompanyInfo(companyData: any) {
    const response = await fetch(`${this.BASE_URL}/company-info`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    return this.handleResponse<any>(response);
  }

  async updateCompanyInfo(id: number, companyData: any) {
    const response = await fetch(`${this.BASE_URL}/company-info/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    return this.handleResponse<any>(response);
  }

  async uploadCompanyLogo(id: number, formData: FormData) {
    const response = await fetch(`${this.BASE_URL}/company-info/upload-logo/${id}`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });
    return this.handleResponse<any>(response);
  }

  async hardDeleteCompanyInfo(id: number) {
    const response = await fetch(`${this.BASE_URL}/company-info/hard-delete/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<void>(response);
  }
}
