
import { BaseApiService } from './base-api';
import { StoreDTO } from '@/types/api';

export class StoreService extends BaseApiService {
  async getStores() {
    const response = await fetch(`${this.BASE_URL}/Store`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<StoreDTO[]>(response);
  }
}
