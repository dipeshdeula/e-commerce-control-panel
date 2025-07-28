// API Configuration for different environments
interface ApiConfig {
  baseUrl: string;
  apiPath: string;
}

const getApiConfig = (): ApiConfig => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Check if we're running locally
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('192.168.') ||
                     window.location.hostname.includes('10.0.');

  // Server/Production API
  const serverConfig: ApiConfig = {
    baseUrl: 'http://110.34.2.30:5013',
    apiPath: ''
  };

  // Local development API (adjust these URLs for your local setup)
  const localConfig: ApiConfig = {
    baseUrl: 'https://localhost:7028',
    apiPath: '/api'
  };

  // Return appropriate config based on environment
  if (isDevelopment && isLocalhost) {
    console.log('🔧 Using LOCAL API configuration');
    return localConfig;
  } else {
    console.log('🌐 Using SERVER API configuration');
    return serverConfig;
  }
};

export const API_CONFIG = getApiConfig();

// Export the full API URL
export const API_BASE_URL = `${API_CONFIG.baseUrl}`;
//export const API_BASE_URL = "http://110.34.2.30:5013";


// Helper function to get the current environment
export const getCurrentEnvironment = () => {
  const isDevelopment = import.meta.env.DEV;
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  if (isDevelopment && isLocalhost) {
    return 'local';
  } else {
    return 'server';
  }
};