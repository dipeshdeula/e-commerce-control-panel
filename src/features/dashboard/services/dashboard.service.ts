import { BaseApiService } from '@/shared/services/base-api';
import { DashboardData, ApiResponse } from '../types/dashboard.types';

export class DashboardService extends BaseApiService {
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await fetch(`${this.BASE_URL}/admin/dashboard`, {
        method: 'GET',
        mode: 'cors',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse<DashboardData>(response);
    } catch (error) {
      console.error('Dashboard request failed:', error);
      return {
        success: false,
        message: `Failed to load dashboard: ${error instanceof Error ? error.message : 'Network error'}`
      };
    }
  }
}