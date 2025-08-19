import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnectionState, HubConnection } from "@microsoft/signalr";
import { toast } from '@/hooks/use-toast';
import { Notification } from '@/types/api';
import { apiClient } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasNextPage: boolean;
  currentPage: number;
}

export const useNotifications = (userId?: number) => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    hasNextPage: true,
    currentPage: 0,
  });
  
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const pageSize = 10;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiClient.getNotifications(userId, page, pageSize);
      const newNotifications = Array.isArray(response) ? response : (response as any)?.data || [];

      setState(prev => {
        const existingIds = new Set(prev.notifications.map(n => n.id));
        const uniqueNewNotifications = newNotifications.filter((n: Notification) => !existingIds.has(n.id));
        
        const updatedNotifications = append 
          ? [...prev.notifications, ...uniqueNewNotifications]
          : uniqueNewNotifications;

        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount,
          hasNextPage: newNotifications.length === pageSize,
          currentPage: page,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, pageSize]);

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (state.hasNextPage && !state.isLoading) {
      fetchNotifications(state.currentPage + 1, true);
    }
  }, [state.hasNextPage, state.isLoading, state.currentPage, fetchNotifications]);

  // Acknowledge notification (called immediately after SignalR receives)
  const acknowledgeNotification = useCallback(async (notificationId: number) => {
    try {
      await apiClient.acknowledgeNotification(notificationId);
      console.log(`Notification ${notificationId} acknowledged`);
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  }, []);

  // Mark notifications as read (single or bulk)
  const markAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      await apiClient.markNotificationsAsRead(notificationIds);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: prev.unreadCount - notificationIds.length,
      }));

      toast({
        title: "Success",
        description: `${notificationIds.length} notification(s) marked as read`,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = state.notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [state.notifications, markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await apiClient.deleteNotification(notificationId);
      
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? prev.unreadCount - 1 : prev.unreadCount,
        };
      });

      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  }, []);

  // Setup SignalR connection
  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('accessToken');
    const hubUrl = "https://localhost:7010/hubs/notificationhub";

    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: async () => token || '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = conn;
    setConnection(conn);

    const startConnection = async () => {
      try {
        await conn.start();
        console.log('SignalR Connected');

        // Listen for new notifications
        conn.on('ReceiveNotification', async (notification: Notification) => {
          console.log('Received notification via SignalR:', notification);
          
          // Immediately acknowledge the notification
          await acknowledgeNotification(notification.id);

          // Add to local state (avoid duplicates)
          setState(prev => {
            const exists = prev.notifications.some(n => n.id === notification.id);
            if (exists) return prev;

            return {
              ...prev,
              notifications: [notification, ...prev.notifications],
              unreadCount: prev.unreadCount + 1,
            };
          });

          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
        });

        // Initial fetch of notifications
        fetchNotifications(1, false);
      } catch (error) {
        console.error('SignalR Connection Error:', error);
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [userId, acknowledgeNotification, fetchNotifications]);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    hasNextPage: state.hasNextPage,
    isConnected: connection?.state === HubConnectionState.Connected,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: () => fetchNotifications(1, false),
  };
};
