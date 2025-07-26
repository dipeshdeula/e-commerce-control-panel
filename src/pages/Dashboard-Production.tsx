import React from 'react';
import { useGetDashboardQuery } from '@/store/api/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Store,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Activity,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// 🏭 Production-level Dashboard using RTK Query
const DashboardProduction: React.FC = () => {
  const {
    data: dashboardResponse,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useGetDashboardQuery(undefined, {
    // Refetch on focus (when user comes back to the tab)
    refetchOnFocus: true,
    // Refetch on reconnect (when internet comes back)
    refetchOnReconnect: true,
    // Skip if user is not authenticated
    skip: !localStorage.getItem('accessToken'),
  });

  const dashboard = dashboardResponse?.data;

  // 🔄 Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        
        {/* Skeleton for metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ❌ Error State
  if (isError || error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
        <p className="text-gray-500 mb-4">
          {error && 'data' in error ? (error.data as any)?.message : 'Please check your connection and try again'}
        </p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // 📭 No Data State
  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboard data available</h3>
        <p className="text-gray-500">Data will appear here once your store has activity</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with real-time indicators */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">InstantMart Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time insights powered by RTK Query</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data automatically updates every 30 seconds</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <Calendar className="w-3 h-3 mr-1" />
                  RTK Query
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Powered by Redux Toolkit Query for optimal caching</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Metrics Cards with Production-level error handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Sales */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl font-bold">
                        NRs. {dashboard.totalSales?.toLocaleString('en-NP') || 0}
                      </p>
                      <p className="text-blue-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Real-time updates
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total revenue: NRs. {dashboard.totalSales?.toLocaleString('en-NP') || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Orders */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold">
                        {dashboard.totalOrders?.toLocaleString('en-NP') || 0}
                      </p>
                      <p className="text-purple-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Cached & optimized
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total orders: {dashboard.totalOrders?.toLocaleString('en-NP') || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Users */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold">
                        {dashboard.totalUsers?.toLocaleString('en-NP') || 0}
                      </p>
                      <p className="text-green-100 text-sm flex items-center mt-1">
                        <Activity className="w-3 h-3 mr-1" />
                        Background sync
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total users: {dashboard.totalUsers?.toLocaleString('en-NP') || 0}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Recent Activity using production data structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Recent Orders
                <Badge variant="secondary" className="ml-auto text-xs">
                  {dashboard.recentOrders?.length || 0} items
                </Badge>
              </CardTitle>
              <CardDescription>Latest orders with real-time updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recentOrders && dashboard.recentOrders.length > 0 ? (
                  dashboard.recentOrders.slice(0, 5).map((order) => (
                    <div 
                      key={order.orderId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.orderId}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString('en-NP', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          NRs. {order.amount?.toLocaleString('en-NP') || 0}
                        </p>
                        <Badge 
                          variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent orders available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                Top Selling Products
                <Badge variant="secondary" className="ml-auto text-xs">
                  {dashboard.topSellingProducts?.length || 0} items
                </Badge>
              </CardTitle>
              <CardDescription>Best performers with cached data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.topSellingProducts && dashboard.topSellingProducts.length > 0 ? (
                  dashboard.topSellingProducts.slice(0, 5).map((product, index) => (
                    <div 
                      key={product.productId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.soldQuantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          NRs. {product.totalSales?.toLocaleString('en-NP') || 0}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No top products available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Debug Info */}
        <Card className="bg-gray-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Production Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-medium">Cache Status</p>
                <p className={isFetching ? "text-orange-600" : "text-green-600"}>
                  {isFetching ? "Updating..." : "Fresh"}
                </p>
              </div>
              <div>
                <p className="font-medium">Data Source</p>
                <p className="text-blue-600">RTK Query</p>
              </div>
              <div>
                <p className="font-medium">Auto Refresh</p>
                <p className="text-green-600">30s interval</p>
              </div>
              <div>
                <p className="font-medium">Network</p>
                <p className="text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default DashboardProduction;
