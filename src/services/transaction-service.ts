
import { BaseApiService } from '@/shared/services/base-api';

export interface PaymentRequestDTO {
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
}

export interface PaymentRequestParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  paymentMethodId?: number;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  orderBy?: string;
}

export interface PaymentRequestResponse {
  message: string;
  data: PaymentRequestDTO[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class TransactionService extends BaseApiService {
  async getPaymentRequests(params?: PaymentRequestParams) {
    let url = `${this.BASE_URL}/payment/requests`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.paymentMethodId) searchParams.append('PaymentMethodId', params.paymentMethodId.toString());
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
    return this.handleResponse<PaymentRequestResponse>(response);
  }

  async getPaymentRequestsByUserId(userId: number, params?: PaymentRequestParams) {
    let url = `${this.BASE_URL}/payment/user/${userId}`;
    const searchParams = new URLSearchParams();
    
    if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.orderBy) searchParams.append('OrderBy', params.orderBy);
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; data: PaymentRequestDTO[] }>(response);
  }

  async getPaymentRequestById(id: number) {
    const response = await fetch(`${this.BASE_URL}/payment/requests/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<PaymentRequestDTO>(response);
  }

  // Legacy transaction methods for backward compatibility
  async getTransactions(page?: number, pageSize?: number) {
    return this.getPaymentRequests({ pageNumber: page, pageSize });
  }

  async getTransactionById(id: number) {
    return this.getPaymentRequestById(id);
  }
}
