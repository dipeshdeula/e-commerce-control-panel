import { store } from '@/store';
import { refreshAccessToken, logout } from '@/store/slices/authSlice';

// Token refresh interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

export const createAuthInterceptor = (originalRequest: any) => {
  return new Promise((resolve, reject) => {
    if (isRefreshing) {
      failedQueue.push({ resolve, reject });
      return;
    }

    isRefreshing = true;

    store.dispatch(refreshAccessToken())
      .unwrap()
      .then((tokens) => {
        processQueue(null, tokens.accessToken);
        resolve(originalRequest);
      })
      .catch((error) => {
        processQueue(error, null);
        store.dispatch(logout());
        reject(error);
      })
      .finally(() => {
        isRefreshing = false;
      });
  });
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    return true;
  }
};

// Auto token refresh utility
export const setupTokenRefresh = () => {
  setInterval(() => {
    const state = store.getState();
    const { accessToken, isAuthenticated } = state.auth;
    
    if (isAuthenticated && accessToken && isTokenExpired(accessToken)) {
      store.dispatch(refreshAccessToken());
    }
  }, 60000); // Check every minute
};
