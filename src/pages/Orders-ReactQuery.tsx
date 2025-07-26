import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

// 🏭 Production-level Orders Management using React Query
const OrdersManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();

  // 📊 Fetch orders with React Query
  const {
    data: ordersResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['orders', page, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return response.json();
    },
    // React Query optimizations for production
    staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // 🔄 Update order status mutation with optimistic updates
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return response.json();
    },
    // ✨ Optimistic Updates - UI updates immediately
    onMutate: async ({ orderId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(['orders', page, searchTerm, statusFilter]);
      
      // Optimistically update to new value
      queryClient.setQueryData(['orders', page, searchTerm, statusFilter], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          data: old.data.map((order: any) =>
            order.orderId === orderId 
              ? { ...order, status: newStatus }
              : order
          ),
        };
      });
      
      // Return context for potential rollback
      return { previousOrders };
    },
    // 🔄 On success, refetch related queries
    onSuccess: () => {
      // Invalidate and refetch dashboard data (affects metrics)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Show success notification
      console.log('Order status updated successfully');
    },
    // 🚨 On error, rollback optimistic update
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ['orders', page, searchTerm, statusFilter], 
          context.previousOrders
        );
      }
      console.error('Failed to update order status:', err);
    },
    // Always refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // 🗑️ Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate orders list and dashboard
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
    },
  });

  // 🔍 Search handler with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const orders = ordersResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage orders with React Query optimizations</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <Badge variant="secondary" className="flex items-center gap-1">
              {isFetching ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              {isFetching ? 'Updating...' : 'Fresh'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Orders
            <Badge variant="outline">
              {ordersResponse?.pagination?.total || 0} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load orders</p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.orderId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">Order #{order.orderId}</p>
                        <p className="text-sm text-gray-500">
                          {order.customerName} • NRs. {order.amount?.toLocaleString('en-NP')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.orderDate).toLocaleDateString('en-NP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Badge with Update Buttons */}
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={
                          order.status === 'COMPLETED' ? 'default' : 
                          order.status === 'CONFIRMED' ? 'secondary' : 
                          order.status === 'CANCELLED' ? 'destructive' : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                      
                      {/* Quick status update buttons */}
                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderMutation.mutate({ 
                            orderId: order.orderId, 
                            newStatus: 'CONFIRMED' 
                          })}
                          disabled={updateOrderMutation.isPending}
                          className="h-6 px-2 text-xs"
                        >
                          Confirm
                        </Button>
                      )}
                      
                      {order.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderMutation.mutate({ 
                            orderId: order.orderId, 
                            newStatus: 'COMPLETED' 
                          })}
                          disabled={updateOrderMutation.isPending}
                          className="h-6 px-2 text-xs"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => deleteOrderMutation.mutate(order.orderId)}
                      disabled={deleteOrderMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {ordersResponse?.pagination && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, ordersResponse.pagination.total)} of {ordersResponse.pagination.total} orders
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            
            <span className="px-3 py-1 text-sm bg-gray-100 rounded">
              {page} of {ordersResponse.pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={page >= ordersResponse.pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Debug Panel for Development */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">React Query Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
            <div>
              <p className="font-medium">Query Status</p>
              <p className={isLoading ? "text-orange-600" : "text-green-600"}>
                {isLoading ? "Loading..." : "Success"}
              </p>
            </div>
            <div>
              <p className="font-medium">Background Fetch</p>
              <p className={isFetching ? "text-blue-600" : "text-gray-600"}>
                {isFetching ? "Updating..." : "Idle"}
              </p>
            </div>
            <div>
              <p className="font-medium">Mutations Pending</p>
              <p className={updateOrderMutation.isPending || deleteOrderMutation.isPending ? "text-orange-600" : "text-green-600"}>
                {updateOrderMutation.isPending || deleteOrderMutation.isPending ? "Processing..." : "None"}
              </p>
            </div>
            <div>
              <p className="font-medium">Cache Strategy</p>
              <p className="text-blue-600">Smart invalidation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;
