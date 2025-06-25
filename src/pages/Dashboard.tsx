
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Store,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error loading dashboard</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    );
  }

  const dashboard = dashboardData?.data;

  if (!dashboard) return null;

  const stats = [
    {
      title: 'Total Sales',
      value: `$${dashboard.totalSales.toLocaleString()}`,
      change: dashboard.salesToday,
      changeLabel: 'from yesterday',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: dashboard.totalOrders.toLocaleString(),
      change: dashboard.ordersToday,
      changeLabel: 'from yesterday',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: dashboard.totalUsers.toLocaleString(),
      change: dashboard.newUsersToday,
      changeLabel: 'new today',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Total Products',
      value: dashboard.totalProducts.toLocaleString(),
      change: dashboard.outOfStockProducts,
      changeLabel: 'out of stock',
      icon: Package,
      color: 'text-orange-600',
    },
    {
      title: 'Total Stores',
      value: dashboard.totalStores.toLocaleString(),
      change: 0,
      changeLabel: 'active stores',
      icon: Store,
      color: 'text-indigo-600',
    },
    {
      title: 'Successful Payments',
      value: dashboard.successfulPayments.toLocaleString(),
      change: dashboard.failedPayments,
      changeLabel: 'failed',
      icon: CreditCard,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change > 0 ? '+' : ''}{stat.change} {stat.changeLabel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentOrders.slice(0, 5).map((order) => (
                <div key={order.orderId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.userName}</p>
                    <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.amount}</p>
                    <p className={`text-xs ${
                      order.status === 'completed' ? 'text-green-600' :
                      order.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Your best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topSellingProducts.slice(0, 5).map((product) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.soldQuantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${product.totalSales}</p>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Sales
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Stores */}
      <Card>
        <CardHeader>
          <CardTitle>Top Stores by Income</CardTitle>
          <CardDescription>Highest earning stores on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.topStoresByIncome.slice(0, 6).map((store) => (
              <div key={store.storeId} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Store className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{store.storeName}</p>
                  <p className="text-xs text-gray-500">{store.ownerName}</p>
                  <p className="text-sm font-semibold text-green-600">${store.totalIncome.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
