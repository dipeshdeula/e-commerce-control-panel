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

  return {
    data,
    isLoading: loading,
    error,
    refetch
  };
};