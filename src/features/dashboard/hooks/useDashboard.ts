import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchDashboardData, clearError } from '@/store/slices/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, lastUpdated } = useAppSelector(state => state.dashboard);

  // Consider data stale after 5 minutes
  const isStale = lastUpdated ? Date.now() - lastUpdated > 5 * 60 * 1000 : true;

  useEffect(() => {
    // Fetch data if no data exists or if data is stale
    if (!data || isStale) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, data, isStale]);

  const refetch = () => {
    // Clear any existing errors before refetch
    if (error) {
      dispatch(clearError());
    }
    dispatch(fetchDashboardData());
  };

  return {
    data,
    isLoading: loading,
    error,
    refetch,
    lastUpdated
  };
};