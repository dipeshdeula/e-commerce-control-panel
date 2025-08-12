import { BaseApiService } from '@/shared/services/base-api';

export interface ShippingConfigurationDTO {
  id: number;
  configurationName?: string;
  name?: string;
  isActive?: boolean;
  isDefault?: boolean;
  lowOrderThreshold: number;
  lowOrderShippingCost: number;
  highOrderShippingCost: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: number;
  maxDeliveryDistanceKm: number;
  enableFreeShippingEvents: boolean;
  isFreeShippingActive: boolean;
  freeShippingStartDate?: string;
  freeShippingEndDate?: string;
  freeShippingDescription?: string;
  weekendSurcharge?: number;
  holidaySurcharge?: number;
  rushDeliverySurcharge?: number;
  customerMessage?: string;
  adminNotes?: string;
  createdByUserName?: string;
  lastModifiedByUserName?: string | null;
  createdAt?: string;
  lastModifiedAt?: string;
}

export type CreateShippingConfigurationRequest = {
  name: string;
  lowOrderThreshold: number;
  lowOrderShippingCost: number;
  highOrderShippingCost: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: number;
  maxDeliveryDistanceKm: number;
  enableFreeShippingEvents: boolean;
  isFreeShippingActive: boolean;
  freeShippingStartDate?: string;
  freeShippingEndDate?: string;
  freeShippingDescription?: string;
  weekendSurcharge?: number;
  holidaySurcharge?: number;
  rushDeliverySurcharge?: number;
  customerMessage?: string;
  adminNotes?: string;
  setAsDefault?: boolean;
};

export type UpdateShippingConfigurationRequest = CreateShippingConfigurationRequest;

export class ShippingService extends BaseApiService {
  async createShippingConfiguration(data: CreateShippingConfigurationRequest) {
    const response = await fetch(`${this.BASE_URL}/shipping/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ message: string; data: ShippingConfigurationDTO }>(response);
  }

  async updateShippingConfiguration(id: number, data: UpdateShippingConfigurationRequest) {
    const response = await fetch(`${this.BASE_URL}/shipping/update?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<{ message: string; data: ShippingConfigurationDTO }>(response);
  }

  async setDefaultShippingConfiguration(id: number) {
    const response = await fetch(`${this.BASE_URL}/shipping/set-default?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async softDeleteShippingConfiguration(id: number) {
    const response = await fetch(`${this.BASE_URL}/shipping/soft-delete?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async hardDeleteShippingConfiguration(id: number) {
    const response = await fetch(`${this.BASE_URL}/shipping/hard-delete?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Listing with pagination support
  async getAllShippingConfigurations(pageNumber: number = 1, pageSize: number = 10) {
    const url = new URL(`${this.BASE_URL}/shipping/getAll`);
    url.searchParams.set('pageNumber', String(pageNumber));
    url.searchParams.set('pageSize', String(pageSize));
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; data: ShippingConfigurationDTO[] } | ShippingConfigurationDTO[]>(response);
  }
}
