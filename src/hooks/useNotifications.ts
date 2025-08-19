import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { RootState } from '@/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  acknowledgeNotification,
  deleteNotification,
  receiveNotification,
} from '@/store/slices/notificationSlice';
import { NotificationDTO } from '@/services/notification-service';

// selector for notifications slice and correct dispatch types
export const useNotifications = (userId?: number) => {
  const dispatch = useDispatch();
  //  selector for notifications slice
const notificationsState = useSelector(
  (state: RootState) => state.notifications || {
    notifications: [],
    unreadCount: 0,
    loading: false,
    meta: { totalCount: 0, pageNumber: 1, pageSize: 10 }
  }
);

  const {
    notifications,
    unreadCount,
    loading,
    meta,
  } = notificationsState;

  // Initial fetch
  useEffect(() => {
    if (userId) {
      // FIX: Use dispatch with correct thunk type
      dispatch<any>(fetchNotifications({ userId, pageNumber: 1, pageSize: meta.pageSize }));
    }
    // eslint-disable-next-line
  }, [userId, dispatch, meta.pageSize]);

  // SignalR connection for real-time notifications
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem('accessToken');
    const hubUrl = "https://localhost:7010/hubs/notificationhub";
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: async () => token || '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    conn.start().then(() => {
      conn.on('ReceiveNotification', async (notification: NotificationDTO) => {
        dispatch(receiveNotification(notification));
        await dispatch<any>(acknowledgeNotification(notification.id));
      });
    });

    return () => { conn.stop(); };
    // eslint-disable-next-line
  }, [userId, dispatch]);

  // Pagination
  const loadMore = () => {
    if (userId && notifications.length < meta.totalCount) {
      dispatch<any>(fetchNotifications({
        userId,
        pageNumber: meta.pageNumber + 1,
        pageSize: meta.pageSize,
      }));
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading: loading,
    hasNextPage: notifications.length < meta.totalCount,
    loadMore,
    markAsRead: (ids: number[]) => dispatch<any>(markAsRead(ids)),
    markAllAsRead: () => dispatch<any>(markAllAsRead()),
    deleteNotification: (id: number) => dispatch<any>(deleteNotification(id)),
    refreshNotifications: () => dispatch<any>(fetchNotifications({ userId, pageNumber: 1, pageSize: meta.pageSize })),
  };
};