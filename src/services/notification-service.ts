import { BaseApiService } from '@/shared/services/base-api';

export interface NotificationDTO {
  id: number;
  userId: number;
  email: string;
  orderId: number;
  title: string;
  message: string;
  type: string;
  status: string;
  isRead: boolean;
  orderDate: string;
}

export interface NotificationParams {
  pageNumber?: number;
  pageSize?: number;
  userId?: number;
  status?: string;
  type?: string;
  isRead?: boolean;
}

export interface NotificationResponse {
  response: NotificationDTO[];
  meta: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
  message: string;
}

export interface SendNotificationRequest {
  id?: number;
  userId: number;
  email: string;
  orderId: number;
  title: string;
  message: string;
}

export interface SendNotificationResponse {
  data: {
    id: number;
    userId: number;
    email: string;
    orderId: number;
    title: string;
    message: string;
    status: string;
    type: string;
    orderDate: string;
  };
  message: string;
}

export class NotificationService extends BaseApiService {
  async getAllNotifications(params?: NotificationParams) {
    let url = `${this.BASE_URL}/notif/getAllNotifications`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<NotificationResponse>(response);
  }

  async getNotificationsByUserId(userId: number, params?: NotificationParams) {
    let url = `${this.BASE_URL}/notif/getAllNotificationsByUserId?userId=${userId}`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    if (searchParams.toString()) {
      url += `&${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<NotificationResponse>(response);
  }

  async markAsRead(notificationId: number) {
    const response = await fetch(`${this.BASE_URL}/notif/mark-as-read?notificationId=${notificationId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  async acknowledgeNotification(notificationId: number) {
    const response = await fetch(`${this.BASE_URL}/notif/acknowledge-notification?notificationId=${notificationId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  async sendNotificationToUser(notification: SendNotificationRequest) {
    const response = await fetch(`${this.BASE_URL}/notif/send-to-user`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        id: notification.id || 0,
        userId: notification.userId,
        email: notification.email,
        orderId: notification.orderId,
        title: notification.title,
        message: notification.message
      })
    });
    return this.handleResponse<SendNotificationResponse>(response);
  }
}
