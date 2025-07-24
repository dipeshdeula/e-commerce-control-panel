import { BaseApiService } from '@/shared/services/base-api';
import { AdminDashboardDTO } from '@/types/api';

export class DashboardService extends BaseApiService {
  async getDashboard() {
    const response = await fetch(`${this.BASE_URL}/admin/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<AdminDashboardDTO>(response);
  }
}