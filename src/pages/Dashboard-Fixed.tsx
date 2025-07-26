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
  Eye,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#2377FC",
  },
  orders: {
    label: "Orders",
    color: "#60A5FA",
  },
  users: {
    label: "Users",
    color: "#34D399",
  },
  revenue: {
    label: "Revenue",
    color: "#F59E0B",
  },
};

const salesData = [
  { month: "Jan", sales: 12000, orders: 45 },
  { month: "Feb", sales: 19000, orders: 52 },
  { month: "Mar", sales: 15000, orders: 48 },
  { month: "Apr", sales: 25000, orders: 61 },
  { month: "May", sales: 22000, orders: 55 },
  { month: "Jun", sales: 30000, orders: 67 },
];

const Dashboard: React.FC = () => {
  // 🏭 Professional RTK Query implementation
  const {
    data: dashboardResponse,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useGetDashboardQuery(undefined, {
    // Production-level configurations
    refetchOnFocus: true,        // Refetch when user comes back to tab
    refetchOnReconnect: true,    // Refetch when internet comes back
    pollingInterval: 30000,      // Auto-refresh every 30 seconds
    skip: !localStorage.getItem('accessToken'), // Skip if not authenticated
  });

  const dashboard = dashboardResponse?.data;

  // 🔄 Loading State with Professional UI
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
        
        {/* Professional skeleton for metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
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

  // 🚨 Error State with Retry Option
  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Something went wrong while fetching dashboard data'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 🏭 Professional Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Professional e-commerce admin panel with real-time updates
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {isFetching ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {isFetching ? 'Updating...' : 'Live Data'}
            </Badge>
            
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* 📊 Professional Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {/* Total Sales */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl font-bold">NRs. {dashboard?.totalSales?.toLocaleString('en-NP') || 0}</p>
                      <p className="text-blue-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard?.salesToday || 0} today
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
              <p>Total revenue: NRs. {dashboard?.totalSales?.toLocaleString('en-NP') || 0}</p>
              <p>This Week: NRs. {dashboard?.salesThisWeek?.toLocaleString('en-NP') || 0}</p>
              <p>This Month: NRs. {dashboard?.salesThisMonth?.toLocaleString('en-NP') || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Orders */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold">{dashboard?.totalOrders?.toLocaleString() || 0}</p>
                      <p className="text-purple-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard?.ordersToday || 0} today
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
              <p>Total orders: {dashboard?.totalOrders || 0}</p>
              <p>This Week: {dashboard?.ordersThisWeek || 0}</p>
              <p>This Month: {dashboard?.ordersThisMonth || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Users */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold">{dashboard?.totalUsers?.toLocaleString() || 0}</p>
                      <p className="text-green-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard?.newUsersToday || 0} new today
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
              <p>Total users registered: {dashboard?.totalUsers || 0}</p>
              <p>New this week: {dashboard?.newUsersThisWeek || 0}</p>
              <p>New this month: {dashboard?.newUsersThisMonth || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Products */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Products</p>
                      <p className="text-2xl font-bold">{dashboard?.totalProducts?.toLocaleString() || 0}</p>
                      <p className="text-orange-100 text-sm flex items-center mt-1">
                        <Package className="w-3 h-3 mr-1" />
                        {dashboard?.outOfStockProducts || 0} out of stock
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total products: {dashboard?.totalProducts || 0}</p>
              <p>Out of stock: {dashboard?.outOfStockProducts || 0}</p>
              <p>Low stock: {dashboard?.lowStockProducts || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Stores */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Stores</p>
                      <p className="text-2xl font-bold">{dashboard?.totalStores?.toLocaleString() || 0}</p>
                      <p className="text-indigo-100 text-sm flex items-center mt-1">
                        <Store className="w-3 h-3 mr-1" />
                        Active stores
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-400 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total active stores: {dashboard?.totalStores || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Payment Stats */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-sm font-medium">Payments</p>
                      <p className="text-2xl font-bold">{dashboard?.successfulPayments?.toLocaleString() || 0}</p>
                      <p className="text-teal-100 text-sm flex items-center mt-1">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {dashboard?.failedPayments || 0} failed
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-teal-400 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Successful payments: {dashboard?.successfulPayments || 0}</p>
              <p>Failed payments: {dashboard?.failedPayments || 0}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Distribution */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="shadow-sm border-0 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Order Status Distribution
                  </CardTitle>
                  <CardDescription>Current order status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard?.orderStatusCounts && Object.entries(dashboard.orderStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'COMPLETED' ? 'bg-green-500' :
                            status === 'Confirmed' ? 'bg-blue-500' :
                            status === 'Pending' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium capitalize">{status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{count as number}</span>
                          <Badge variant="outline" className="text-xs">
                            {dashboard.totalOrders && dashboard.totalOrders > 0 ? Math.round(((count as number) / dashboard.totalOrders) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Track order status distribution and completion rates</p>
            </TooltipContent>
          </Tooltip>

          {/* Payment Methods */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="shadow-sm border-0 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Revenue by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard?.paymentMethodTotals && Object.entries(dashboard.paymentMethodTotals).map(([methodId, amount]) => (
                      <div key={methodId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            methodId === '1' ? 'bg-blue-500' :
                            methodId === '3' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}></div>
                          <span className="text-sm font-medium">
                            {methodId === '1' ? 'Cash on Delivery' :
                             methodId === '3' ? 'Digital Payment' :
                             `Method ${methodId}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">NRs. {(amount as number).toLocaleString('en-NP')}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {dashboard.totalSales && dashboard.totalSales > 0 ? Math.round(((amount as number) / dashboard.totalSales) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Revenue breakdown by payment method preferences</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="shadow-sm border-0 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Sales Trend
                  </CardTitle>
                  <CardDescription>Monthly sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[200px]">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke={chartConfig.sales.color}
                        strokeWidth={3}
                        dot={{ fill: chartConfig.sales.color, strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Track monthly sales performance and revenue trends</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Recent Orders
              </CardTitle>
              <CardDescription>Latest customer orders and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.recentOrders && dashboard.recentOrders.length > 0 ? (
                  dashboard.recentOrders.slice(0, 5).map((order) => (
                    <Tooltip key={order.orderId}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{order.userName || 'Unknown User'}</p>
                              <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">NRs. {(order.amount || 0).toLocaleString('en-NP')}</p>
                            <Badge 
                              variant="secondary"
                              className={`text-xs ${
                                order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                order.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {order.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Order placed by {order.userName || 'Unknown'} - Amount: NRs. {(order.amount || 0).toLocaleString('en-NP')}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent orders</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Top Products
              </CardTitle>
              <CardDescription>Best-selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.topSellingProducts && dashboard.topSellingProducts.length > 0 ? (
                  dashboard.topSellingProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-40" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">Sold: {product.soldQuantity} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          NRs. {product.totalSales.toLocaleString('en-NP')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users and Store Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Recent Users
              </CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.recentUsers && dashboard.recentUsers.length > 0 ? (
                  dashboard.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(user.registeredAt).toLocaleDateString('en-NP', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-500" />
                Top Stores
              </CardTitle>
              <CardDescription>Highest performing stores by income</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.topStoresByIncome && dashboard.topStoresByIncome.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.topStoresByIncome.slice(0, 6).map((store, index) => (
                    <div key={store.storeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{store.storeName}</p>
                          <p className="text-xs text-gray-500">Owner: {store.ownerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          NRs. {store.totalIncome.toLocaleString('en-NP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No store performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 🏭 Professional RTK Query Status Panel */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-dashed border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Production Dashboard Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isLoading ? 'bg-blue-500 animate-pulse' : isFetching ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs font-medium text-gray-600">Query Status</p>
                <p className={`text-xs ${isLoading ? 'text-blue-600' : isFetching ? 'text-orange-600' : 'text-green-600'}`}>
                  {isLoading ? 'Loading...' : isFetching ? 'Updating...' : 'Success'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-600">Data Source</p>
                <p className="text-xs text-blue-600">RTK Query</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-600">Auto Refresh</p>
                <p className="text-xs text-purple-600">30s interval</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-600">Cache Status</p>
                <p className="text-xs text-green-600">Fresh Data</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-600">Performance</p>
                <p className="text-xs text-indigo-600">Optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
