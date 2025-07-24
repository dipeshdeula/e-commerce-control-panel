import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, lastUpdated } = useAppSelector(state => state.dashboard);

  const isStale = lastUpdated ? Date.now() - lastUpdated > 5 * 60 * 1000 : true;

  useEffect(() => {
    if (!data || isStale) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, data, isStale]);

  const refetch = () => {
    dispatch(fetchDashboardData());
  };

  // Return mock data if API data is not available
  const mockData = {
    totalUsers: 1250,
    totalOrders: 3420,
    totalRevenue: 125000,
    totalProducts: 890,
    newUsersToday: 45,
    ordersToday: 120,
    revenueToday: 8500,
    productsAdded: 12,
    salesData: [
      { month: 'Jan', revenue: 15000, orders: 320 },
      { month: 'Feb', revenue: 18000, orders: 380 },
      { month: 'Mar', revenue: 22000, orders: 450 },
      { month: 'Apr', revenue: 25000, orders: 520 },
      { month: 'May', revenue: 28000, orders: 580 },
      { month: 'Jun', revenue: 32000, orders: 640 }
    ],
    topProducts: [
      { id: '1', name: 'Wireless Headphones', sales: 234, revenue: 23400 },
      { id: '2', name: 'Smart Watch', sales: 187, revenue: 37400 },
      { id: '3', name: 'Laptop Stand', sales: 156, revenue: 7800 },
      { id: '4', name: 'USB-C Hub', sales: 145, revenue: 8700 },
      { id: '5', name: 'Bluetooth Speaker', sales: 132, revenue: 13200 }
    ],
    recentActivities: [
      { id: '1', type: 'order', description: 'New order #12345 received', timestamp: new Date().toISOString() },
      { id: '2', type: 'user', description: 'New user registered: john@example.com', timestamp: new Date().toISOString() },
      { id: '3', type: 'product', description: 'Product "Gaming Mouse" added', timestamp: new Date().toISOString() },
      { id: '4', type: 'payment', description: 'Payment of $150 processed', timestamp: new Date().toISOString() }
    ]
  };

  return {
    data: data || mockData,
    isLoading: loading,
    error,
    refetch
  };
};