import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellRing, 
  Eye, 
  Check, 
  CheckCheck, 
  Send, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface NotificationFilters {
  isRead?: boolean;
  isAcknowledged?: boolean;
  userId?: number;
  startDate?: string;
  endDate?: string;
  ordering?: string;
}

export const Notifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);
  
  // Send notification form state
  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    message: '',
    notificationType: 'info',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications with filters
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', searchTerm, filters, currentPage, pageSize],
    queryFn: async () => {
      const response = await apiService.getAllNotifications({
        searchTerm: searchTerm || undefined,
        pageNumber: currentPage,
        pageSize,
        isRead: filters.isRead,
        userId: filters.userId,
        fromDate: filters.startDate,
        toDate: filters.endDate,
        orderBy: filters.ordering,
      });
      const data = response.data || {};
      console.log("notification resp:",response);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
      return {
        notifications:data.response || [],
        meta : data.meta || {}

      };
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiService.markAsRead(notificationId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark notification as read');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Notification marked as read' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error marking notification as read', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  
  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiService.sendNotificationToUser({
        userId: parseInt(data.userId),
        title: data.title,
        message: data.message,
        notificationType: data.notificationType,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to send notification');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Notification sent successfully' });
      setIsSendNotificationOpen(false);
      setSendForm({
        userId: '',
        title: '',
        message: '',
        notificationType: 'info',
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error sending notification', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (value === 'all' || value === 'default') ? undefined : 
              (key === 'userId' ? (value ? parseInt(value) : undefined) : 
               (key === 'isRead' || key === 'isAcknowledged') ? (value === 'true') : value),
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getNotificationTypeBadge = (type: string) => {
    const typeConfig = {
      info: { variant: 'default' as const, icon: Info, className: 'bg-blue-100 text-blue-700' },
      success: { variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-700' },
      warning: { variant: 'secondary' as const, icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700' },
      error: { variant: 'destructive' as const, icon: XCircle, className: 'bg-red-100 text-red-700' },
      order: { variant: 'default' as const, icon: MessageSquare, className: 'bg-purple-100 text-purple-700' },
    };

    const config = typeConfig[type.toLowerCase() as keyof typeof typeConfig] || typeConfig.info;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {type}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const notificationsArray = notifications?.notifications || [];
  const totalItems = notifications?.meta?.totalCount || notificationsArray.length;
  const pageSizeValue = notifications?.meta?.pageSize || pageSize;
  const currentPageValue = notifications?.meta?.pageNumber || currentPage;

  console.log("notification details:",notificationsArray);

  if(notificationsArray.length > 0)
  {
    console.log("notification details:",notificationsArray);
  }
  console.log("total notification",totalItems)

  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setIsDetailsOpen(true);
    
    // Mark as read when viewing details
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

 
  const handleSendNotification = () => {
    if (!sendForm.userId || !sendForm.title || !sendForm.message) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }
    
    sendNotificationMutation.mutate(sendForm);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Manage customer notifications and communication</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              {totalItems} Total Notifications
            </Badge>
            <Button onClick={() => setIsSendNotificationOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Read Status</Label>
                <Select value={filters.isRead?.toString() || 'all'} onValueChange={(value) => handleFilterChange('isRead', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All notifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="true">Read</SelectItem>
                    <SelectItem value="false">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>

             

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.ordering || 'default'} onValueChange={(value) => handleFilterChange('ordering', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                    <SelectItem value="createdAt">Oldest First</SelectItem>
                    <SelectItem value="-isRead">Unread First</SelectItem>
                    <SelectItem value="isRead">Read First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label>User ID</Label>
                  <Input
                    type="number"
                    placeholder="User ID"
                    value={filters.userId || ''}
                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Label>Show:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationsArray.map((notification: any) => (
                  <TableRow key={notification.id} className={!notification.isRead ? 'bg-blue-50' : ''}>
                    <TableCell className="font-mono text-sm">
                      #{notification.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">User #{notification.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && <Bell className="w-4 h-4 text-blue-500" />}
                        <span className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getNotificationTypeBadge(notification.type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge variant={notification.isRead ? 'default' : 'secondary'} className="text-xs">
                          {notification.isRead ? 'Read' : 'Unread'}
                        </Badge>
                       
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(notification.orderDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleViewDetails(notification)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {!notification.isRead && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark as Read</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                       
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {notificationsArray.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications found</p>
              </div>
            )}

             {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {Math.min((currentPageValue - 1) * pageSizeValue + 1, totalItems)} to{' '}
                {Math.min(currentPageValue * pageSizeValue, totalItems)} of {totalItems} notifications
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPageValue === 1}
                  onClick={() => setCurrentPage(currentPageValue - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.ceil(totalItems / pageSizeValue) }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPageValue === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPageValue === Math.ceil(totalItems / pageSizeValue)}
                  onClick={() => setCurrentPage(currentPageValue + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        

        {/* Notification Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Notification Details - #{selectedNotification?.id}</DialogTitle>
              <DialogDescription>
                View complete notification information
              </DialogDescription>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Notification Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">ID:</span> #{selectedNotification.id}</div>
                      <div><span className="font-medium">User:</span> User #{selectedNotification.userId}</div>
                      <div><span className="font-medium">Type:</span> {getNotificationTypeBadge(selectedNotification.type)}</div>
                      <div><span className="font-medium">Date:</span> {formatDate(selectedNotification.orderDate)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Status</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Read:</span> {selectedNotification.isRead ? 'Yes' : 'No'}</div>
                      {selectedNotification.readAt && (
                        <div><span className="font-medium">Read At:</span> {formatDate(selectedNotification.readAt)}</div>
                      )}
                    
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Title</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedNotification.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Message</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
             
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Notification Dialog */}
        <Dialog open={isSendNotificationOpen} onOpenChange={setIsSendNotificationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send a notification to a specific user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID *</Label>
                  <Input
                    id="userId"
                    type="number"
                    placeholder="Enter user ID"
                    value={sendForm.userId}
                    onChange={(e) => setSendForm(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="notificationType">Notification Type</Label>
                  <Select 
                    value={sendForm.notificationType} 
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, notificationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={sendForm.title}
                  onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={sendForm.message}
                  onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendNotificationOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={sendNotificationMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
