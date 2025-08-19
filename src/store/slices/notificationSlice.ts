import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationService, NotificationDTO, NotificationParams } from '@/services/notification-service';

const notificationService = new NotificationService();

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: NotificationParams, { rejectWithValue }) => {
    try {
      const response = await notificationService.getAllNotifications(params);
      // If your service returns { data: { response: [], meta: {} } }
      const data = response.data || response;
      return {
        notifications: data.response || [],
        meta: data.meta || {},
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds: number[], { dispatch }) => {
    for (const id of notificationIds) {
      await notificationService.markAsRead(id);
    }
    return notificationIds;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, dispatch }) => {
    const state: any = getState();
    const unreadIds = state.notifications.notifications.filter((n: NotificationDTO) => !n.isRead).map((n: NotificationDTO) => n.id);
    if (unreadIds.length > 0) {
      await dispatch(markAsRead(unreadIds));
    }
    return unreadIds;
  }
);

export const acknowledgeNotification = createAsyncThunk(
  'notifications/acknowledgeNotification',
  async (notificationId: number) => {
    await notificationService.acknowledgeNotification(notificationId);
    return notificationId;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: number) => {
    // Implement delete API if available
    // await notificationService.deleteNotification(notificationId);
    return notificationId;
  }
);

interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  meta: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  meta: {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
  },
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    receiveNotification(state, action: PayloadAction<NotificationDTO>) {
      // Add new notification to the top
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAllAsReadLocal(state) {
      state.notifications.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        if(action.meta.arg.pageNumber>1)
        {
          state.notifications = [...state.notifications,...action.payload.notifications];
        }
        else{
          state.notifications = action.payload.notifications;
        }
        state.meta = action.payload.meta;
        state.unreadCount = action.payload.notifications.filter(n => !n.isRead).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        state.notifications.forEach(n => {
          if (ids.includes(n.id)) n.isRead = true;
        });
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      .addCase(acknowledgeNotification.fulfilled, (state, action) => {
        // Optionally update notification as acknowledged
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const wasUnread = state.notifications.find(n => n.id === id && !n.isRead);
        state.notifications = state.notifications.filter(n => n.id !== id);
        if (wasUnread) state.unreadCount -= 1;
      });
  }
});

export const { receiveNotification, markAllAsReadLocal } = notificationSlice.actions;
export default notificationSlice.reducer;