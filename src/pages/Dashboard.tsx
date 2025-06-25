import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
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
  RefreshCw
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

export const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <TrendingDown className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
        <p className="text-gray-500">Please try again later or contact support.</p>
      </div>
    );
  }

  const dashboard = dashboardData?.data;

  if (!dashboard) return null;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">InstantMart Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <Calendar className="w-3 h-3 mr-1" />
                  Real-time data
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data is updated in real-time from your live store</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  <Activity className="w-3 h-3 mr-1" />
                  All systems operational
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>All store systems are running smoothly</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats with Gradient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl font-bold">NRs. {dashboard.totalSales.toLocaleString()}</p>
                      <p className="text-blue-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard.salesToday} from yesterday
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
              <p>Total revenue generated in Nepali Rupees from all sales</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold">{dashboard.totalOrders.toLocaleString()}</p>
                      <p className="text-purple-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard.ordersToday} from yesterday
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
              <p>Total number of orders placed by customers</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold">{dashboard.totalUsers.toLocaleString()}</p>
                      <p className="text-green-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard.newUsersToday} new today
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
              <p>Total registered users and customers on your platform</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Products</p>
                      <p className="text-2xl font-bold">{dashboard.totalProducts.toLocaleString()}</p>
                      <p className="text-orange-100 text-sm flex items-center mt-1">
                        <Package className="w-3 h-3 mr-1" />
                        {dashboard.outOfStockProducts} out of stock
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
              <p>Total products in inventory with stock status</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Total Stores</p>
                      <p className="text-2xl font-bold">{dashboard.totalStores.toLocaleString()}</p>
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
              <p>Total number of active merchant stores on the platform</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Successful Payments</p>
                      <p className="text-2xl font-bold">{dashboard.successfulPayments.toLocaleString()}</p>
                      <p className="text-emerald-100 text-sm flex items-center mt-1">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {dashboard.failedPayments} failed
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-400 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Payment transaction success rate and failure count</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="shadow-sm border-0 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Sales Trend
                  </CardTitle>
                  <CardDescription>Monthly sales performance and revenue growth in NRs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
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
                        dot={{ fill: chartConfig.sales.color, strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Track monthly sales performance and revenue trends in Nepali Rupees</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="shadow-sm border-0 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    Orders Overview
                  </CardTitle>
                  <CardDescription>Monthly order statistics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="orders" 
                        fill={chartConfig.orders.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Monitor order volume and patterns across different months</p>
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
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentOrders.slice(0, 5).map((order) => (
                <Tooltip key={order.orderId}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.userName}</p>
                          <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">NRs. {order.amount}</p>
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${
                            order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Order placed by {order.userName} - Amount: NRs. {order.amount}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-500" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Your best performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topSellingProducts.slice(0, 5).map((product, index) => (
                <Tooltip key={product.productId}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.soldQuantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">NRs. {product.totalSales}</p>
                        <div className="flex items-center text-xs text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          #{index + 1} Best seller
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{product.name} - Sold {product.soldQuantity} units for NRs. {product.totalSales}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Stores */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-500" />
            Top Stores by Income
          </CardTitle>
          <CardDescription>Highest earning stores on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.topStoresByIncome.slice(0, 6).map((store, index) => (
              <Tooltip key={store.storeId}>
                <TooltipTrigger asChild>
                  <div className="relative p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white cursor-pointer">
                    {index < 3 && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Store className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{store.storeName}</p>
                        <p className="text-xs text-gray-500">{store.ownerName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-bold text-green-600">NRs. {store.totalIncome.toLocaleString()}</p>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                            Top {index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{store.storeName} by {store.ownerName} - Total Income: NRs. {store.totalIncome.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
};
