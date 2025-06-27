
import { BaseApiService } from './base-api';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, VerifyOTPRequest, VerifyOTPResponse } from '@/types/api';

export class AuthService extends BaseApiService {
  async login(credentials: LoginRequest) {
    const response = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(userData: RegisterRequest) {
    const response = await fetch(`${this.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<RegisterResponse>(response);
  }

  async verifyOtp(otpData: VerifyOTPRequest) {
    const response = await fetch(`${this.BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(otpData)
    });
    return this.handleResponse<VerifyOTPResponse>(response);
  }
}
