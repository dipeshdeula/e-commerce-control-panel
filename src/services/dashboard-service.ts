
import { BaseApiService } from './base-api';
import { AdminDashboardDTO } from '@/types/api';

export class DashboardService extends BaseApiService {
  async getDashboard() {
    const response = await fetch(`${this.BASE_URL}/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<AdminDashboardDTO>(response);
  }
}
