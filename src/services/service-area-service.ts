import { BaseApiService } from '@/shared/services/base-api';

export interface ServiceAreaDTO {
  id?: number;
  cityName: string;
  province: string;
  country: string;
  centerLatitude: number;
  centerLongitude: number;
  displayName: string;
  description: string;
  notAvailableMessage: string;
  isActive: boolean;
  isComingSoon: boolean;
  radiusKm: number;
  deliveryStartTime: string;
  deliveryEndTime: string;
  estimatedDeliveryDays: number;
  minOrderAmount: number;
  maxDeliveryDistancekm: number;
  storeCount?: number;
  stores?: any[];
  orders?: any[];
}

// Update response type to include pagination
export interface ServiceAreaApiResponse {
  data: ServiceAreaDTO[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export class ServiceAreaService extends BaseApiService {
  async createServiceArea(data: ServiceAreaDTO) {
    const response = await fetch(`${this.BASE_URL}/location/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<ServiceAreaDTO>(response);
  }

  async getServiceAreas(parmas: {page?: number, pageSize?: number, activeOnly?: boolean} = {}) {
    let url = `${this.BASE_URL}/location/service-areas`;
    const {page=1, pageSize=10, activeOnly} = parmas;
    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', page.toString());
    queryParams.append('pageSize', pageSize.toString());
    if (typeof activeOnly === 'boolean') queryParams.append('activeOnly', activeOnly.toString());
    url += `?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const result = await this.handleResponse<ServiceAreaApiResponse>(response);

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch service areas');
    }
    return result.data;
  }

  async updateServiceArea(id: number, data: ServiceAreaDTO) {
    const response = await fetch(`${this.BASE_URL}/location/update?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<ServiceAreaDTO>(response);
  }

  async hardDeleteServiceArea(id: number) {
    const response = await fetch(`${this.BASE_URL}/location/hardDelete?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; data?: string }>(response);
  }
}

export const serviceAreaService = new ServiceAreaService();
