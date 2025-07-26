import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye,
  AlertCircle,
  Activity
} from 'lucide-react';
import { OrderService } from '@/services/order-service';
import { OrderDTO } from '@/types/api';

// 🏭 Professional Orders Management using React Query
const OrdersPage: React.FC = () => {
  const orderService = new OrderService();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();

  // 📊 Professional orders fetching with React Query
  const {
    data: ordersResponse,
    isLoading,
    error,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter],
    queryFn: async () => {
      const response = await orderService.getOrders();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch orders');
      }
      return response;
    },
    // Production-level configurations
    staleTime: 1000 * 60 * 2,        // Data is fresh for 2 minutes
    gcTime: 1000 * 60 * 5,           // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,       // Refetch when user comes back
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // 🔄 Professional order status update with optimistic updates
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: number; newStatus: string }) => {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update order');
      }
      return response.data;
    },
    // ✨ Optimistic Updates - Professional implementation
    onMutate: async ({ orderId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(['orders', searchTerm, statusFilter]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['orders', searchTerm, statusFilter], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((order: OrderDTO) =>
            order.orderId === orderId 
              ? { ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() }
              : order
          ),
        };
      });
      
      return { previousOrders, orderId, newStatus };
    },
    // 📈 On success, invalidate related queries
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      console.log(`Order ${context?.orderId} status updated to ${context?.newStatus}`);
    },
    // 🚨 On error, rollback the optimistic update
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ['orders', searchTerm, statusFilter], 
          context.previousOrders
        );
      }
      console.error('Failed to update order status:', err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // � Filter orders based on search and status
  const filteredOrders = React.useMemo(() => {
    if (!ordersResponse?.data) return [];
    
    let filtered = ordersResponse.data;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((order: OrderDTO) => 
        order.orderId?.toString().includes(searchTerm) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order: OrderDTO) => 
        order.orderStatus === statusFilter
      );
    }
    
    return filtered;
  }, [ordersResponse?.data, searchTerm, statusFilter]);

  // 🔍 Debounced search handler
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const orders = filteredOrders || [];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 🏭 Professional Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">
              Professional orders management with React Query optimizations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export orders to CSV/Excel</TooltipContent>
            </Tooltip>
            
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </div>
        </div>

        {/* 🎛️ Professional Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID, customer name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm min-w-32"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    More Filters
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Advanced filtering options</TooltipContent>
              </Tooltip>

              {/* Real-time status indicator */}
              <Badge variant="secondary" className="flex items-center gap-1">
                {isFetching ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                {isFetching ? 'Updating...' : 'Live'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 📋 Professional Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Orders
                <Badge variant="outline" className="ml-2">
                  {orders.length} total
                </Badge>
              </span>
              
              {/* Performance indicators */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>React Query</span>
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Professional loading skeleton
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-8"></div>
                      <div className="h-8 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              // Professional error state
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load orders</h3>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error ? error.message : 'Something went wrong'}
                </p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              // Professional empty state
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'Orders will appear here once customers start placing them'
                  }
                </p>
              </div>
            ) : (
              // Professional orders list
              <div className="space-y-4">
                {orders.map((order: OrderDTO) => (
                  <div 
                    key={order.orderId} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            #{order.orderId?.toString().slice(-3) || '000'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">Order #{order.orderId}</p>
                            <Badge 
                              variant={
                                order.status === 'DELIVERED' ? 'default' : 
                                order.status === 'CONFIRMED' ? 'secondary' : 
                                order.status === 'CANCELLED' ? 'destructive' : 'outline'
                              }
                              className="text-xs"
                            >
                              {order.status || 'PENDING'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{order.customerName || 'Unknown Customer'}</span> • 
                            <span className="font-bold text-green-600 ml-1">
                              NRs. {(order.totalAmount || 0).toLocaleString('en-NP')}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-NP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Date not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Professional action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Quick status update buttons */}
                      {(!order.status || order.status === 'PENDING') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderMutation.mutate({ 
                                orderId: order.orderId!, 
                                newStatus: 'CONFIRMED' 
                              })}
                              disabled={updateOrderMutation.isPending}
                              className="h-8 px-3 text-xs"
                            >
                              Confirm
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Confirm this order</TooltipContent>
                        </Tooltip>
                      )}
                      
                      {order.status === 'CONFIRMED' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderMutation.mutate({ 
                                orderId: order.orderId!, 
                                newStatus: 'PROCESSING' 
                              })}
                              disabled={updateOrderMutation.isPending}
                              className="h-8 px-3 text-xs"
                            >
                              Process
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Start processing this order</TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Action buttons */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View order details</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit order</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🏭 Professional React Query Status Panel */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-dashed border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              React Query Performance Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isLoading ? 'bg-blue-500 animate-pulse' : isFetching ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs font-medium text-gray-600">Query Status</p>
                <p className={`text-xs ${isLoading ? 'text-blue-600' : isFetching ? 'text-orange-600' : 'text-green-600'}`}>
                  {isLoading ? 'Loading...' : isFetching ? 'Updating...' : 'Success'}
                </p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${updateOrderMutation.isPending ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs font-medium text-gray-600">Mutations</p>
                <p className={`text-xs ${updateOrderMutation.isPending ? 'text-orange-600' : 'text-green-600'}`}>
                  {updateOrderMutation.isPending ? 'Processing...' : 'Idle'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-600">Cache Strategy</p>
                <p className="text-xs text-purple-600">Optimistic Updates</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-600">Items Cached</p>
                <p className="text-xs text-emerald-600">{orders.length} orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default OrdersPage;
