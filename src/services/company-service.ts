
import { BaseApiService } from '@/shared/services/base-api';
import { 
  CompanyInfoDTO, 
  CreateCompanyInfoRequest, 
  UpdateCompanyInfoRequest,
  CompanyInfoListResponse,
  CompanyInfoDetailResponse
} from '@/types/api';

export class CompanyService extends BaseApiService {
  
  // Create new company
  async createCompanyInfo(companyData: CreateCompanyInfoRequest) {
    const response = await fetch(`${this.BASE_URL}/createCompanyInfo`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    const result = await this.handleResponse<CompanyInfoDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to create company info');
    }
    return result;
  }

  // Get all company info with pagination
  async getAllCompanyInfo(pageNumber?: number, pageSize?: number) {
    const queryParams = new URLSearchParams();
    if (pageNumber) queryParams.append('PageNumber', pageNumber.toString());
    if (pageSize) queryParams.append('PageSize', pageSize.toString());

    const url = `${this.BASE_URL}/getAllCompanyInfo${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<CompanyInfoDTO[]>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch company info');
    }
    return result;
  }

  // Get company info by ID
  async getCompanyInfoById(id: number) {
    const response = await fetch(`${this.BASE_URL}/getCompanyInfoById?Id=${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<CompanyInfoDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch company info');
    }
    return result;
  }

  // Upload company logo
  async uploadCompanyLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.BASE_URL}/uploadCompanyLogo?Id=${id}`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeaders()['Authorization']
      },
      body: formData
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload company logo');
    }
    return result;
  }

  // Update company info
  async updateCompanyInfo(id: number, companyData: UpdateCompanyInfoRequest) {
    const response = await fetch(`${this.BASE_URL}/updateCompanyInfo?Id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    const result = await this.handleResponse<CompanyInfoDTO>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update company info');
    }
    return result;
  }

  // Soft delete company info
  async softDeleteCompanyInfo(id: number) {
    const response = await fetch(`${this.BASE_URL}/softDelete?Id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to soft delete company info');
    }
    return result;
  }

  // Undelete company info (restore from soft delete)
  async unDeleteCompanyInfo(id: number) {
    const response = await fetch(`${this.BASE_URL}/unDelete?Id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to restore company info');
    }
    return result;
  }

  // Hard delete company info
  async hardDeleteCompanyInfo(id: number) {
    const response = await fetch(`${this.BASE_URL}/hardDelete?Id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<any>(response);
    if (!result.success) {
      throw new Error(result.message || 'Failed to permanently delete company info');
    }
    return result;
  }
}
