import { API_BASE_URL } from '@/config/api.config';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class BaseApiService {
  public BASE_URL = API_BASE_URL;

  protected getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
  }

  protected getFormHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  protected async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: response.ok ? undefined : data.message || 'An error occurred'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to parse response'
      };
    }
  }

  async request(endpoint: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        mode: 'cors',
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers
        }
      });
      return this.handleResponse<any>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}