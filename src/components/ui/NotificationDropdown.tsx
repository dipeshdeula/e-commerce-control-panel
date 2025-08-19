
import { useState, useRef, useEffect } from 'react';
import { Bell, MoreVertical, Check, CheckCheck, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onViewOrder?: (orderId: number) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onViewOrder }: NotificationItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete(notification.id);
    setIsMenuOpen(false);
  };

  const handleViewOrder = () => {
    if (notification.orderId && onViewOrder) {
      onViewOrder(notification.orderId);
    }
    setIsMenuOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'OrderConfirmed':
      case 'OrderDelivered':
      case 'OrderCancelled':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'OrderConfirmed':
        return 'border-l-green-500';
      case 'OrderDelivered':
        return 'border-l-blue-500';
      case 'OrderCancelled':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div className={`p-3 border-l-4 ${getNotificationColor(notification.type)} ${!notification.isRead ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
      <div className="flex items-start justify-between space-x-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.orderDate), { addSuffix: true })}
              </span>
              {notification.orderId && (
                <span className="text-xs text-blue-600 font-medium">
                  Order #{notification.orderId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Three-dot menu */}
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!notification.isRead && (
              <DropdownMenuItem onClick={handleMarkAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </DropdownMenuItem>
            )}
            {notification.isRead && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Mark as Unread
              </DropdownMenuItem>
            )}
            {notification.orderId && (
              <DropdownMenuItem onClick={handleViewOrder}>
                <Package className="mr-2 h-4 w-4" />
                View Order Details
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default function NotificationDropdown() {
  const { user } = useAuth();
  const userId = user?.nameid ? parseInt(user.nameid, 10) : undefined;
  const {
    notifications,
    unreadCount,
    isLoading,
    hasNextPage,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);

  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Handle scroll for pagination
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasNextPage && !isLoading) {
      loadMore();
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead([notificationId]);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewOrder = (orderId: number) => {
    // Navigate to order details page
    window.location.href = `/orders/${orderId}`;
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0" side="bottom" sideOffset={5}>
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCheck className="mr-1 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea 
          className="max-h-96 overflow-y-auto" 
          onScrollCapture={handleScroll}
          ref={scrollAreaRef}
        >
          {notifications.length === 0 && !isLoading ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={deleteNotification}
                  onViewOrder={handleViewOrder}
                />
              ))}
              
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading more notifications...</p>
                </div>
              )}
              
              {!hasNextPage && notifications.length > 0 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">You've reached the end</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
