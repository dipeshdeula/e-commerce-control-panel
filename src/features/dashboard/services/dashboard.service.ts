import { BaseApiService } from '@/shared/services/base-api';
import { DashboardData, ApiResponse } from '../types/dashboard.types';

export class DashboardService extends BaseApiService {
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const response = await fetch(`${this.BASE_URL}/admin/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<DashboardData>(response);
  }
}