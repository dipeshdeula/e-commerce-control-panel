import { BaseApiService } from '@/shared/services/base-api';

export interface BannerEventRule {
  id?: number;
  type: number; // RuleType enum
  targetValue: string;
  conditions?: string;
  discountType: number; // PromotionType enum
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  priority: number;
  ruleDescription?: string;
}

export interface BannerEventProduct {
  id?: number;
  bannerEventId?: number;
  productId: number;
  productName?: string;
  slug?: string;
  description?: string;
  marketPrice?: number;
  costPrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  stockQuantity?: number;
  reservedStock?: number;
  sku?: string;
  weight?: string;
  reviews?: number;
  rating?: number;
  dimensions?: string;
  isDeleted?: boolean;
  categoryId?: number;
  subSubCategoryId?: number;
  availableStock?: number;
  isInStock?: boolean;
  hasProductDiscount?: boolean;
  basePrice?: number;
  productDiscountAmount?: number;
  formattedMarketPrice?: string;
  formattedBasePrice?: string;
  formattedDiscountAmount?: string;
  stockStatus?: string;
  specificDiscount?: number;
  addedAt?: string;
  productMarketPrice?: number;
  productImageUrl?: string;
  categoryName?: string;
  calculatedDiscountPrice?: number;
  formattedSpecificDiscount?: string;
  hasSpecificDiscount?: boolean;
  currentPrice?: number;
  isOnSale?: boolean;
  canAddToCart?: boolean;
  displayPrice?: string;
  displayStatus?: string;
  totalSavingsAmount?: number;
  formattedSavings?: string;
  images?: Array<{
    id: number;
    imageUrl: string;
    productId: number;
    altText: string;
    isMain: boolean;
    displayOrder: number;
  }>;
  pricing?: {
    productId: number;
    productName: string;
    originalPrice: number;
    basePrice: number;
    effectivePrice: number;
    productDiscountAmount: number;
    eventDiscountAmount: number;
    totalDiscountAmount: number;
    totalDiscountPercentage: number;
    hasProductDiscount: boolean;
    hasEventDiscount: boolean;
    hasAnyDiscount: boolean;
    isOnSale: boolean;
    activeEventId?: number;
    activeEventName?: string;
    eventTagLine?: string;
    promotionType?: number;
    eventStartDate?: string;
    eventEndDate?: string;
    hasActiveEvent: boolean;
    isEventActive: boolean;
    eventTimeRemaining?: string;
    isEventExpiringSoon: boolean;
    formattedOriginalPrice: string;
    formattedEffectivePrice: string;
    formattedSavings: string;
    formattedDiscountBreakdown: string;
    eventStatus: string;
    hasFreeShipping: boolean;
    isPriceStable: boolean;
    calculatedAt: string;
  };
  stock?: any;
}

export interface CreateBannerEventDTO {
  eventDto: {
    name: string;
    description: string;
    tagLine?: string;
    eventType: number; // EventType enum
    promotionType: number; // PromotionType enum
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderValue?: number;
    startDateNepal: string;
    endDateNepal: string;
    activeTimeSlot?: string;
    maxUsageCount?: number;
    maxUsagePerUser?: number;
    priority?: number;
  };
  rules: BannerEventRule[];
  productIds: number[];
}

export interface BannerEvent {
  id: number;
  name: string;
  description: string;
  tagLine?: string;
  eventType: number;
  promotionType: number;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  startDateNepal: string;
  endDateNepal: string;
  startDateNepalString: string;
  endDateNepalString: string;
  startDateUtcString: string;
  endDateUtcString: string;
  activeTimeSlot?: string;
  maxUsageCount?: number;
  currentUsageCount: number;
  maxUsagePerUser?: number;
  priority: number;
  isActive: boolean;
  isDeleted: boolean;
  status: number; // EventStatus enum
  createdAt: string;
  updatedAt: string;
  productIds: number[];
  totalProductsCount: number;
  totalRulesCount: number;
  hasActiveTimeSlot: boolean;
  isCurrentlyActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  timeStatus: string;
  formattedDiscount: string;
  formattedDateRangeNepal: string;
  fromattedDateRangeUtc: string;
  statusBadge: string;
  priorityBadge: string;
  usagePercentage: number;
  remainingUsage: number;
  isUsageLimitReached: boolean;
  timeZoneInfo: any;
  images: any[];
  rules: BannerEventRule[];
  eventProducts: BannerEventProduct[];
}

export interface BannerEventAnalytics {
  eventId: number;
  eventName: string;
  reportPeriod: string;
  totalUsages: number;
  uniqueUsers: number;
  totalDiscountGiven: number;
  averageDiscountPerUser: number;
  conversionRate: number;
  dailyBreakdown: any[];
}

export interface DiscountSummary {
  fromDate: string;
  toDate: string;
  totalDiscountGiven: number;
  averageDiscountPerDay: number;
  period: string;
}

export interface RealTimeData {
  eventId: number;
  eventName: string;
  eventType: string;
  isActive: boolean;
  usagePercentage: number;
  remainingUsage: number;
  timeStatus: string;
  daysRemaining: number;
  priority: number;
}

export interface RuleReport {
  eventId: number;
  data: {
    eventInfo: {
      name: string;
      type: string;
      status: string;
      isActive: boolean;
    };
    ruleAnalysis: {
      totalRules: number;
      hasRestrictions: boolean;
      complexity: string;
    };
    usageAnalysis: {
      currentUsage: number;
      maxUsage: number;
      usagePercentage: number;
      remainingCapacity: number;
    };
    timeAnalysis: {
      timeStatus: string;
      daysRemaining: number;
      isExpired: boolean;
      isCurrentlyActive: boolean;
    };
  };
}

export class BannerEventService extends BaseApiService {
  // Get all banner events with pagination
  async getAllBannerEvents(params?: { 
    pageNumber?: number; 
    pageSize?: number;
    includeDeleted?: boolean;
    status?: string;
    isActive?: boolean;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `${this.BASE_URL}/api/banner-events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      // headers: this.getAuthHeaders(),
      method: 'GET'
    });
    
    const result = await this.handleResponse<{ data: BannerEvent[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; hasPreviousPage: boolean; hasNextPage: boolean }>(response);
    
    return result;
  }

  // Get banner event by ID
  async getBannerEventById(bannerId: number) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/getEventById?bannerId=${bannerId}`, {
      // headers: this.getAuthHeaders()
    });
    return this.handleResponse<BannerEvent>(response);
  }

  // Create new banner event
  async createBannerEvent(data: CreateBannerEventDTO) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    console.log("Banner response:",response);
    return this.handleResponse<BannerEvent>(response);
  }

  // Upload banner images
  async uploadBannerImages(bannerId: number, files: File[]) {
    const formData = new FormData();
    formData.append('bannerId', bannerId.toString());
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.BASE_URL}/api/banner-events/UploadBannerImage`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeaders()['Authorization']
      },
      body: formData
    });
    return this.handleResponse<any[]>(response);
  }

  // Activate or deactivate banner event
  async activateOrDeactivateBannerEvent(bannerEventId: number, isActive: boolean) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/activateOrDeactivate?BannerEventId=${bannerEventId}&IsActive=${isActive}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Soft delete banner event
  async softDeleteBannerEvent(bannerId: number) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/softDeleteBannerEvent?BannerId=${bannerId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Undelete banner event (restore from soft delete)
  async unDeleteBannerEvent(bannerId: number) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/UnDeleteBannerEvent?BannerId=${bannerId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Hard delete banner event
  async hardDeleteBannerEvent(bannerId: number) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/HardDeleteBannerEvent?BannerId=${bannerId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<any>(response);
  }

  // Get event analytics
  async getEventAnalytics(id: number, fromDate?: string, toDate?: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('Id', id.toString());
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${this.BASE_URL}/api/banner-events/analytics?${queryParams.toString()}`, {
      // headers: this.getAuthHeaders()
    });
    return this.handleResponse<BannerEventAnalytics>(response);
  }

  // Get top performing events
  async getTopPerformingEvents(count: number = 10) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/analytics/top-performing?count=${count}`, {
      // headers: this.getAuthHeaders()
    });
    return this.handleResponse<BannerEvent[]>(response);
  }

  // Get discount summary
  async getDiscountSummary() {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/analytics/discount-summary`, {
      // headers: this.getAuthHeaders()
    });
    return this.handleResponse<DiscountSummary>(response);
  }

  // Get real-time data
  async getRealTimeData() {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/analytics/real-time`, {
      // headers: this.getAuthHeaders()
    });
    return this.handleResponse<RealTimeData[]>(response);
  }

  // Get rule report
  async getRuleReport(id: number) {
    const response = await fetch(`${this.BASE_URL}/api/banner-events/rule-report?id=${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<RuleReport>(response);
  }
}
