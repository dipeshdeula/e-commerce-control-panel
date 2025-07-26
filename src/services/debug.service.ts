import { dashboardService } from '@/services/dashboard-service';
import { API_BASE_URL, getCurrentEnvironment } from '@/config/api.config';

export class DebugService {
  static async testApiConnection() {
    console.log('🔍 API Connection Debug Report');
    console.log('================================');
    console.log(`Environment: ${getCurrentEnvironment()}`);
    console.log(`Base URL: ${API_BASE_URL}`);
    console.log(`Full API URL: ${API_BASE_URL}/admin/dashboard`);
    
    // Test authentication token
    const token = localStorage.getItem('accessToken');
    console.log(`Auth Token: ${token ? 'Present' : 'Missing'}`);
    
    try {
      console.log('🚀 Making API request...');
      const response = await dashboardService.getDashboard();
      
      console.log('📊 API Response:', response);
      
      if (response.success) {
        console.log('✅ API Request Successful');
        console.log('📈 Data received:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'API connection successful'
        };
      } else {
        console.log('❌ API Request Failed');
        console.log('Error message:', response.message);
        return {
          success: false,
          error: response.message,
          message: 'API request failed'
        };
      }
    } catch (error) {
      console.error('💥 API Request Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Network or parsing error'
      };
    }
  }

  static async testNetworkConnectivity() {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'HEAD',
        mode: 'cors'
      });
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  static logCurrentState() {
    console.log('🏪 Current Application State');
    console.log('============================');
    console.log('Window location:', window.location.href);
    console.log('Environment mode:', import.meta.env.MODE);
    console.log('Development mode:', import.meta.env.DEV);
    console.log('Local storage keys:', Object.keys(localStorage));
    
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    console.log('Authentication state:', {
      token: token ? 'Present' : 'Missing',
      user: user ? 'Present' : 'Missing'
    });
  }
}

// Global debug function (available in browser console)
(window as any).debugApi = DebugService.testApiConnection;
(window as any).debugNetwork = DebugService.testNetworkConnectivity;
(window as any).debugState = DebugService.logCurrentState;
