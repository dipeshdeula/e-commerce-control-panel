
import { BaseApiService } from '@/shared/services/base-api';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, VerifyOTPRequest, VerifyOTPResponse } from '@/types/api';

export class AuthService extends BaseApiService {
  async login(credentials: LoginRequest) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials)
      });
      return this.handleResponse<LoginResponse>(response);
    } catch (error) {
      console.error('Login request failed:', error);
      return {
        success: false,
        message: `Login failed: ${error instanceof Error ? error.message : 'Network error'}`
      };
    }
  }

  async register(userData: RegisterRequest) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: 'POST',
        mode: 'cors',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return this.handleResponse<RegisterResponse>(response);
    } catch (error) {
      console.error('Registration request failed:', error);
      return {
        success: false,
        message: `Registration failed: ${error instanceof Error ? error.message : 'Network error'}`
      };
    }
  }

  async verifyOtp(otpData: VerifyOTPRequest) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        mode: 'cors',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(otpData)
      });
      return this.handleResponse<VerifyOTPResponse>(response);
    } catch (error) {
      console.error('OTP verification request failed:', error);
      return {
        success: false,
        message: `OTP verification failed: ${error instanceof Error ? error.message : 'Network error'}`
      };
    }
  }
}
