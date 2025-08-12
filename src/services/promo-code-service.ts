import { BaseApiService } from '@/shared/services/base-api';

export interface PromoCodeDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: number; // 0 = percentage, etc.
  discountValue: number;
  isActive: boolean;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxTotalUsage?: number;
  maxUsagePerUser?: number;
  startDateNepal?: string;
  endDateNepal?: string;
  applyToShipping?: boolean;
  stackableWithEvents?: boolean;
  customerTier?: string;
  adminNotes?: string;
  // server-calculated fields
  currentUsageCount?: number;
  remainingUsage?: number;
  isDeleted?: boolean;
  isCurrentlyActive?: boolean;
  isExpired?: boolean;
  timeStatus?: string;
  daysRemaining?: number;
  status?: number;
  formattedDiscount?: string;
  formattedValidPeriod?: string;
  formattedStartDate?: string;
  formattedEndDate?: string;
  formattedDuration?: string;
}

export type CreatePromoCodeRequest = Omit<PromoCodeDTO, 'id' | 'currentUsageCount' | 'remainingUsage' | 'isDeleted' | 'isCurrentlyActive' | 'isExpired' | 'timeStatus' | 'daysRemaining' | 'status' | 'formattedDiscount' | 'formattedValidPeriod' | 'formattedStartDate' | 'formattedEndDate' | 'formattedDuration'>;

export type UpdatePromoCodeRequest = CreatePromoCodeRequest;

export class PromoCodeService extends BaseApiService {
  async createPromoCode(data: CreatePromoCodeRequest) {
    const response = await fetch(`${this.BASE_URL}/promoCode/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<PromoCodeDTO>(response);
  }

  async updatePromoCode(id: number, data: UpdatePromoCodeRequest) {
    const response = await fetch(`${this.BASE_URL}/promoCode/update?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<PromoCodeDTO>(response);
  }

  async activatePromoCode(id: number) {
    const response = await fetch(`${this.BASE_URL}/promoCode/activate?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async deactivatePromoCode(id: number) {
    const response = await fetch(`${this.BASE_URL}/promoCode/deactivate?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async softDeletePromoCode(id: number) {
    const response = await fetch(`${this.BASE_URL}/promoCode/softDelete?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; data?: boolean }>(response);
  }

  async unDeletePromoCode(id: number) {
    const response = await fetch(`${this.BASE_URL}/promoCode/unDelete?id=${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; data?: boolean }>(response);
  }

  async hardDeletePromoCode(id: number) {
    const response = await fetch(`${this.BASE_URL}/promoCode/hardDelete?id=${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ message: string; data?: boolean }>(response);
  }

  // Best-effort listing; if backend doesn't support, UI will handle gracefully
  async getAllPromoCodes() {
    const response = await fetch(`${this.BASE_URL}/promoCode/getAll`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ data: PromoCodeDTO[] } | PromoCodeDTO[]>(response);
  }
}
