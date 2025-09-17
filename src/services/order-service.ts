
import { BaseApiService } from '@/shared/services/base-api';
import { OrderDTO } from '@/types/api';

export interface OrderItemDTO {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  formattedUnitPrice: string;
  formattedTotalPrice: string;
}

export interface OrderParams {
  pageNumber?: number;
  pageSize?: number;
  orderStatus?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  orderBy?: string;
}

export interface OrderConfirmResponse {
  orderId: number;
  previousStatus: string;
  newStatus: string;
  previousConfirmed: boolean;
  isConfirmed: boolean;
  updatedAt: string;
  userEmail: string;
  userName: string;
  totalAmount: number;
  shippingAddress: string;
  estimatedDeliveryMinutes: number;
  notificationResult: {
    emailSent: boolean;
    emailError: string | null;
    rabbitMqSent: boolean;
    rabbitMqError: string | null;
    allNotificationsSent: boolean;
    anyNotificationSent: boolean;
    notificationSummary: string;
  };
}

export class OrderService extends BaseApiService {
  async getAllOrders(params?: OrderParams) {
    let url = `${this.BASE_URL}/Order/getAllOrder`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('PageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('PageSize', params.pageSize.toString());
    if (params?.orderStatus) searchParams.append('OrderStatus', params.orderStatus);
    if (params?.paymentStatus) searchParams.append('PaymentStatus', params.paymentStatus);
    if (params?.fromDate) searchParams.append('FromDate', params.fromDate);
    if (params?.toDate) searchParams.append('ToDate', params.toDate);
    if (params?.searchTerm) searchParams.append('SearchTerm', params.searchTerm);
    if (params?.orderBy) searchParams.append('OrderBy', params.orderBy);
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO[]>(response);
  }

  async getOrderById(id: number) {
    const response = await fetch(`${this.BASE_URL}/Order/getOrderById?Id=${id}`, {
      headers: this.getAuthHeaders()
    });
    console.log("getOrderById response", response);
    return this.handleResponse<OrderDTO[]>(response);
  }

  async getOrdersByUserId(userId: number, params?: OrderParams) {
    let url = `${this.BASE_URL}/Order/getAllOrderByUserId?UserId=${userId}`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('PageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('PageSize', params.pageSize.toString());
    
    if (searchParams.toString()) {
      url += `&${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO[]>(response);
  }

  async confirmOrderStatus(orderId: number, isConfirmed: boolean) {
    const response = await fetch(`${this.BASE_URL}/Order/confirmOrderStatus?OrderId=${orderId}&IsConfirmed=${isConfirmed}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderConfirmResponse>(response);
  }

  // Legacy methods for backward compatibility  
  async getOrders() {
    return this.getAllOrders();
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.confirmOrderStatus(orderId, status === 'Confirmed');
  }

  async softDeleteOrder(orderId:number)
  {
    const response = await fetch(`${this.BASE_URL}/Order/softDeleteOrder?Id=${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO>(response);
  }

  async unDeleteOrder(orderId:number)
  {
    const response = await fetch(`${this.BASE_URL}/Order/unDeleteOrder?Id=${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO>(response);
  }

  async hardDeleteOrder(orderId:number)
  {
    const response = await fetch(`${this.BASE_URL}/Order/hardDeleteOrder?Id=${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrderDTO>(response);
  }
}
