import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Search, Eye, CheckCircle, Clock, Package, Truck, AlertCircle, ShoppingBag, Filter, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface OrderFilters {
  orderStatus?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  ordering?: string;
}

export const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userCache, setUserCache] = useState<Map<number, any>>(new Map());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders with filters
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', searchTerm, filters, currentPage, pageSize],
    queryFn: async () => {
      const response = await apiService.getAllOrders({
        searchTerm: searchTerm || undefined,
        pageNumber: currentPage,
        pageSize,
        orderStatus: filters.orderStatus,
        paymentStatus: filters.paymentStatus,
        fromDate: filters.startDate,
        toDate: filters.endDate,
        orderBy: filters.ordering,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch orders');
      }
      return response;
    },
  });

  console.log("order data:", orders);

  // Fetch users for cache (load once, use many times)
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-cache'],
    queryFn: async () => {
      const response = await apiService.getUsers({ pageSize: 1000 }); // Get all users
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Populate user cache when users data is available
  React.useEffect(() => {
    if (usersData?.data) {
      const cache = new Map();
      let users = [];
      
      // Handle different response structures
      if (Array.isArray(usersData.data)) {
        users = usersData.data;
      } else if (usersData.data.data && Array.isArray(usersData.data.data)) {
        users = usersData.data.data;
      }
      
      users.forEach((user: any) => {
        cache.set(user.id, {
          id: user.id,
          name: user.name,
          email: user.email,
          contact: user.contact
        });
      });
      
      setUserCache(cache);
    }
  }, [usersData]);

  // Helper function to get user info
  const getUserInfo = (userId: number) => {
    const user = userCache.get(userId);
    if (user) {
      return user;
    }
    
    // If cache is still loading, show loading state
    if (isLoadingUsers) {
      return { 
        id: userId, 
        name: 'Loading...', 
        email: 'Loading...', 
        contact: 'Loading...' 
      };
    }
    
    // Fallback for unknown users
    return { 
      id: userId, 
      name: `User #${userId}`, 
      email: 'Unknown', 
      contact: 'N/A' 
    };
  };

  // Confirm order mutation
  const confirmOrderMutation = useMutation({
    mutationFn: async ({ orderId, isConfirmed }: { orderId: number; isConfirmed: boolean }) => {
      const response = await apiService.confirmOrderStatus(orderId, isConfirmed);
      if (!response.success) {
        throw new Error(response.message || 'Failed to confirm order');
      }
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ 
        title: 'Order confirmed successfully', 
        description: `Order #${data.data.orderId} has been confirmed and customer has been notified.`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error confirming order', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (value === 'all' || value === 'default') ? undefined : value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Reset pagination when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, className: 'bg-blue-100 text-blue-700' },
      completed: { variant: 'default' as const, icon: Package, className: 'bg-green-100 text-green-700' },
      shipped: { variant: 'default' as const, icon: Truck, className: 'bg-purple-100 text-purple-700' },
      cancelled: { variant: 'destructive' as const, icon: AlertCircle, className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-700' },
      paid: { variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      confirmed: { variant: 'default' as const, className: 'bg-blue-100 text-blue-700' },
      failed: { variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
    }).format(amount);
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

  const getOrdersArray = () => {
    if (!orders?.data) return [];
    
    // Try different possible structures based on API response
    if (orders?.data?.data && Array.isArray(orders.data.data)) {
      // Nested structure like Categories/Stores
      return orders.data.data;
    } else if (orders?.data && Array.isArray(orders.data)) {
      // Direct structure from API spec
      return orders.data;
    } else {
      return [];
    }
  };

  const ordersArray = getOrdersArray();

  // For development: add mock data if no orders are found
  const getMockOrdersForDev = () => {
    if (process.env.NODE_ENV === 'development' && ordersArray.length === 0) {
      return [
        {
          id: 1,
          userId: 123,
          totalAmount: 2500.00,
          orderStatus: 'Pending',
          paymentStatus: 'Paid',
          orderDate: new Date().toISOString(),
          shippingAddress: '123 Main St, Kathmandu',
          shippingCity: 'Kathmandu',
          items: [
            {
              id: 1,
              productId: 1,
              productName: 'Sample Product',
              quantity: 2,
              unitPrice: 1250,
              totalPrice: 2500,
              formattedUnitPrice: 'Rs. 1,250',
              formattedTotalPrice: 'Rs. 2,500'
            }
          ]
        },
        {
          id: 2,
          userId: 456,
          totalAmount: 1800.00,
          orderStatus: 'Confirmed',
          paymentStatus: 'Pending',
          orderDate: new Date(Date.now() - 86400000).toISOString(),
          shippingAddress: '456 Park Ave, Pokhara',
          shippingCity: 'Pokhara',
          items: [
            {
              id: 2,
              productId: 2,
              productName: 'Another Product',
              quantity: 1,
              unitPrice: 1800,
              totalPrice: 1800,
              formattedUnitPrice: 'Rs. 1,800',
              formattedTotalPrice: 'Rs. 1,800'
            }
          ]
        }
      ];
    }
    return ordersArray;
  };

  const displayOrders = getMockOrdersForDev();
  
  // Apply client-side filtering and search
  const filteredOrders = displayOrders.filter((order: any) => {
    // Get user info for search
    const userInfo = getUserInfo(order.userId);
    
    // Search filter - now includes user name and email
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm) ||
      order.userId.toString().includes(searchTerm) ||
      userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingCity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Order status filter
    const matchesOrderStatus = !filters.orderStatus || 
      order.orderStatus.toLowerCase() === filters.orderStatus.toLowerCase();
    
    // Payment status filter
    const matchesPaymentStatus = !filters.paymentStatus || 
      order.paymentStatus.toLowerCase() === filters.paymentStatus.toLowerCase();
    
    // Date filters
    const orderDate = new Date(order.orderDate);
    const matchesStartDate = !filters.startDate || orderDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || orderDate <= new Date(filters.endDate + 'T23:59:59');
    
    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesStartDate && matchesEndDate;
  });
  
  // Apply sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (filters.ordering) {
      case '-orderDate':
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case 'orderDate':
        return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      case '-totalAmount':
        return b.totalAmount - a.totalAmount;
      case 'totalAmount':
        return a.totalAmount - b.totalAmount;
      default:
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    }
  });
  
  // Apply pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);
  
  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const displayTotalItems = totalItems;

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleConfirmOrder = (orderId: number) => {
    confirmOrderMutation.mutate({ orderId, isConfirmed: true });
  };

  // Helper function to determine if an order is deleted
  const isOrderDeleted = (order: any) => {
    return order.isDeleted === true;
  };

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteOrder(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ 
        title: 'Order moved to trash', 
        description: `Order #${variables} has been soft deleted successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting order', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteOrder(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ 
        title: 'Order restored', 
        description: `Order #${variables} has been restored successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error restoring order', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteOrder(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ 
        title: 'Order permanently deleted', 
        description: `Order #${variables} has been permanently deleted.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting order', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  if (isLoading || isLoadingUsers) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>{isLoading ? 'Loading orders...' : 'Loading customer data...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p>Error loading orders: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            <p className="text-gray-600">Monitor and manage customer orders</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              {displayTotalItems} Total Orders
            </Badge>
            {userCache.size > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {userCache.size} Users Cached
              </Badge>
            )}
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
                    placeholder="Search by order ID, customer name, email, address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={filters.orderStatus || 'all'} onValueChange={(value) => handleFilterChange('orderStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={filters.paymentStatus || 'all'} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payment statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payment statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
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
                    <SelectItem value="-orderDate">Newest First</SelectItem>
                    <SelectItem value="orderDate">Oldest First</SelectItem>
                    <SelectItem value="-totalAmount">Highest Amount</SelectItem>
                    <SelectItem value="totalAmount">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
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

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Orders</CardTitle>
              <div className="flex items-center space-x-2">
                <Label>Show:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order: any) => (
                  <TableRow 
                    key={order.id}
                    className={isOrderDeleted(order) ? 'bg-red-50 opacity-75' : ''}
                  >
                    <TableCell className="font-mono text-sm">
                      #{order.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{getUserInfo(order.userId).name}</span>
                        <span className="text-sm text-gray-500">{getUserInfo(order.userId).email}</span>
                        <span className="text-xs text-gray-400">ID: {order.userId} • {order.shippingCity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {getOrderStatusBadge(order.orderStatus)}
                        {isOrderDeleted(order) && (
                          <Badge variant="destructive" className="text-xs">
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.items?.length || 0} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {order.orderStatus.toLowerCase() === 'pending' && !isOrderDeleted(order) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleConfirmOrder(order.id)}
                                disabled={confirmOrderMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{confirmOrderMutation.isPending ? 'Confirming...' : 'Confirm Order'}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {!isOrderDeleted(order) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(order.id)}
                                disabled={softDeleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Move to Trash (Soft Delete)</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => unDeleteMutation.mutate(order.id)}
                                disabled={unDeleteMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore Order</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(order.id)}
                              disabled={hardDeleteMutation.isPending}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Permanently Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paginatedOrders.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No orders found</p>
                <p className="text-sm text-gray-400">
                  {Object.values(filters).some(v => v) || searchTerm 
                    ? 'Try adjusting your filters or search terms' 
                    : 'Orders will appear here when customers place them'
                  }
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</p>
                    <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
                      {JSON.stringify({ 
                        hasOrders: !!orders,
                        ordersData: orders?.data,
                        success: orders?.success,
                        totalCount: orders?.totalCount 
                      }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => Math.abs(page - currentPage) <= 2)
                      .map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                View complete order information and items
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Order ID:</span> #{selectedOrder.id}</div>
                      <div><span className="font-medium">Customer:</span> {getUserInfo(selectedOrder.userId).name}</div>
                      <div><span className="font-medium">Customer Email:</span> {getUserInfo(selectedOrder.userId).email}</div>
                      <div><span className="font-medium">Customer Contact:</span> {getUserInfo(selectedOrder.userId).contact}</div>
                      <div><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.orderDate)}</div>
                      <div><span className="font-medium">Total Amount:</span> {formatCurrency(selectedOrder.totalAmount)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Address:</span> {selectedOrder.shippingAddress}</div>
                      <div><span className="font-medium">City:</span> {selectedOrder.shippingCity}</div>
                      <div><span className="font-medium">Order Status:</span> {getOrderStatusBadge(selectedOrder.orderStatus)}</div>
                      <div><span className="font-medium">Payment Status:</span> {getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName || `Product #${item.productId}`}</div>
                              <div className="text-sm text-gray-500">ID: {item.productId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.formattedUnitPrice}</TableCell>
                          <TableCell className="font-semibold">{item.formattedTotalPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              {selectedOrder?.orderStatus.toLowerCase() === 'pending' && (
                <Button
                  onClick={() => {
                    handleConfirmOrder(selectedOrder.id);
                    setIsDetailsOpen(false);
                  }}
                  disabled={confirmOrderMutation.isPending}
                >
                  {confirmOrderMutation.isPending ? 'Confirming...' : 'Confirm Order'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
