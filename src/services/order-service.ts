
import { BaseApiService } from '@/shared/services/base-api';
import { OrderDTO } from '@/types/api';

export class OrderService extends BaseApiService {
  async getOrders() {
    const response = await fetch(`${this.BASE_URL}/Order/getAllOrder`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO[]>(response);
  }

  async updateOrderStatus(orderId: number, status: string) {
    const response = await fetch(`${this.BASE_URL}/Order/confirmOrderStatus`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderId, status })
    });
    return this.handleResponse<OrderDTO>(response);
  }
}
