import { BaseApiService } from '@/shared/services/base-api';

// Delivery Status Enum
export enum DeliveryStatus {
  PENDING = 'PENDING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_DELIVERY = 'FAILED_DELIVERY',
  RETURNED = 'RETURNED'
}

// Payment Status for COD
export enum CODPaymentStatus {
  PENDING = 'PENDING',
  COLLECTED = 'COLLECTED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Delivery Request Interface
export interface DeliveryRequest {
  paymentRequestId: number;
  companyInfoId?: number; // defaults to 1
  isDelivered: boolean;
  deliveryNotes?: string;
  deliveryPersonId?: number;
}

// COD Payment Collection Interface
export interface CODPaymentCollection {
  paymentRequestId: number;
  deliveryStatus: DeliveryStatus;
  notes?: string;
  collectedAmount?: number;
  deliveryPersonId?: number;
}

// Delivery Response Interface
export interface DeliveryResponse {
  message: string;
  data: string | {
    isSuccessful: boolean;
    status: string;
    message: string;
    provider: string;
    transactionId: string;
    collectedAmount: number;
    collectedAt: string;
    deliveryPersonId: number;
    deliveryNotes: string;
    additionalData: {
      deliveryMethod: string;
      collectionVerified: boolean;
      partialPayment: boolean;
      refused: boolean;
    };
  };
  success: boolean;
  timestamp: string;
}

// Extended Payment Request with Delivery Info
export interface PaymentRequestWithDelivery {
  id: number;
  userId: number;
  orderId: number;
  paymentMethodId: number;
  paymentAmount: number;
  currency: string;
  description: string;
  paymentStatus: string;
  paymentUrl?: string;
  khaltiPidx?: string;
  esewaTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  instructions: string;
  requiresRedirect: boolean;
  metadata: {
    provider: string;
    transactionId: string;
    hasPaymentUrl: string;
  };
  userName: string;
  paymentMethodName: string;
  orderTotal: number;
  
  // Delivery specific fields
  deliveryStatus?: DeliveryStatus;
  deliveryNotes?: string;
  deliveryPersonId?: number;
  deliveryPersonName?: string;
  deliveredAt?: string;
  codPaymentStatus?: CODPaymentStatus;
  codCollectedAmount?: number;
  codCollectedAt?: string;

  // Order details for delivery
  order?: {
    id: number;
    userId: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    orderDate: string;
    shippingAddress: string;
    shippingCity: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  };

  // User details
  user?: {
    id: number;
    name: string;
    email: string;
    contact: string;
    address: string;
  };
}

// Delivery Statistics Interface
export interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  codPendingCollection: number;
  codCollectedAmount: number;
  deliverySuccessRate: number;
  averageDeliveryTime: number;
}

// Delivery Person Interface
export interface DeliveryPerson {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  currentDeliveries: number;
  completedDeliveries: number;
  rating: number;
}

export class DeliveryService extends BaseApiService {
  
  /**
   * Mark an order as delivered
   * Endpoint: https://localhost:7028/delivery/delivered
   */
  async markOrderAsDelivered(request: DeliveryRequest): Promise<DeliveryResponse> {
    const params = new URLSearchParams();
    params.append('PaymentRequestId', request.paymentRequestId.toString());
    params.append('CompanyInfoId', (request.companyInfoId || 1).toString());
    params.append('IsDelivered', request.isDelivered.toString());
    
    if (request.deliveryNotes) {
      params.append('DeliveryNotes', request.deliveryNotes);
    }
    
    if (request.deliveryPersonId) {
      params.append('DeliveryPersonId', request.deliveryPersonId.toString());
    }

    const url = `${this.BASE_URL}/delivery/delivered?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    const result = await this.handleResponse<DeliveryResponse>(response);

    if(!result.success)
    {
      throw new Error(result.message || 'Failed to update delivery status');
    }

    return result;
  }

  /**
   * COD Payment Collection Callback
   * Endpoint: https://localhost:7028/payment/callback/cod/collect-payment
   */
  async collectCODPayment(request: CODPaymentCollection): Promise<DeliveryResponse> {
    const params = new URLSearchParams();
    params.append('PaymentRequestId', request.paymentRequestId.toString());
    params.append('DeliveryStatus', request.deliveryStatus);
    
    if (request.notes) {
      params.append('Notes', encodeURIComponent(request.notes));
    }
    
    if (request.collectedAmount) {
      params.append('CollectedAmount', request.collectedAmount.toString());
    }
    
    if (request.deliveryPersonId) {
      params.append('DeliveryPersonId', request.deliveryPersonId.toString());
    }

    const url = `${this.BASE_URL}/payment/callback/cod/collect-payment?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<DeliveryResponse>(response);
  }

  /**
   * Get all pending deliveries (COD orders that need delivery)
   */
  async getPendingDeliveries(params?: { 
    pageNumber?: number; 
    pageSize?: number; 
    deliveryPersonId?: number;
    city?: string;
  }): Promise<{ message: string; data: PaymentRequestWithDelivery[] }> {
    let url = `${this.BASE_URL}/payment/requests`;
    const searchParams = new URLSearchParams();
    
    // Filter for COD payments that are confirmed but not delivered
    searchParams.append('PaymentMethodId', '3'); // COD payment method ID
    searchParams.append('status', 'succeeded'); // Confirmed payments
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.deliveryPersonId) searchParams.append('DeliveryPersonId', params.deliveryPersonId.toString());
    if (params?.city) searchParams.append('City', params.city);
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string; data: PaymentRequestWithDelivery[] }>(response);
  }

  /**
   * Get all completed deliveries
   */
  async getCompletedDeliveries(params?: { 
    pageNumber?: number; 
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    deliveryPersonId?: number;
  }): Promise<{ message: string; data: PaymentRequestWithDelivery[] }> {
    let url = `${this.BASE_URL}/delivery/completed`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params?.toDate) searchParams.append('toDate', params.toDate);
    if (params?.deliveryPersonId) searchParams.append('deliveryPersonId', params.deliveryPersonId.toString());
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string; data: PaymentRequestWithDelivery[] }>(response);
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(params?: {
    fromDate?: string;
    toDate?: string;
    deliveryPersonId?: number;
  }): Promise<{ message: string; data: DeliveryStats }> {
    let url = `${this.BASE_URL}/delivery/stats`;
    const searchParams = new URLSearchParams();
    
    if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params?.toDate) searchParams.append('toDate', params.toDate);
    if (params?.deliveryPersonId) searchParams.append('deliveryPersonId', params.deliveryPersonId.toString());
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string; data: DeliveryStats }>(response);
  }

  /**
   * Get all delivery persons
   */
  async getDeliveryPersons(): Promise<{ message: string; data: DeliveryPerson[] }> {
    const response = await fetch(`${this.BASE_URL}/delivery/persons`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string; data: DeliveryPerson[] }>(response);
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    paymentRequestId: number, 
    status: DeliveryStatus, 
    notes?: string,
    deliveryPersonId?: number
  ): Promise<DeliveryResponse> {
    const body = {
      paymentRequestId,
      deliveryStatus: status,
      notes,
      deliveryPersonId
    };

    const response = await fetch(`${this.BASE_URL}/delivery/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(body)
    });

    if(response.success)
    {
      toast({
        title: 'Success',
        description: 'Delivery status updated successfully',
        variant: 'success'
      });
    }

    return this.handleResponse<DeliveryResponse>(response);
  }

  /**
   * Assign delivery to person
   */
  async assignDelivery(
    paymentRequestId: number, 
    deliveryPersonId: number, 
    notes?: string
  ): Promise<DeliveryResponse> {
    const body = {
      paymentRequestId,
      deliveryPersonId,
      notes
    };

    const response = await fetch(`${this.BASE_URL}/delivery/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(body)
    });

    return this.handleResponse<DeliveryResponse>(response);
  }

  /**
   * Get delivery history for a specific payment request
   */
  async getDeliveryHistory(paymentRequestId: number): Promise<{ 
    message: string; 
    data: Array<{
      id: number;
      paymentRequestId: number;
      status: DeliveryStatus;
      notes: string;
      deliveryPersonId?: number;
      deliveryPersonName?: string;
      timestamp: string;
    }> 
  }> {
    const response = await fetch(`${this.BASE_URL}/delivery/history/${paymentRequestId}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ 
      message: string; 
      data: Array<{
        id: number;
        paymentRequestId: number;
        status: DeliveryStatus;
        notes: string;
        deliveryPersonId?: number;
        deliveryPersonName?: string;
        timestamp: string;
      }> 
    }>(response);
  }
}
