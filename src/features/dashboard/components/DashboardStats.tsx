import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { DashboardData } from '../types/dashboard.types';

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  // Safety check for data
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <p className="text-3xl font-bold text-primary">₹{(data.totalSales || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">This Month: ₹{(data.salesThisMonth || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-primary/20 rounded-full">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <p className="text-3xl font-bold text-green-600">{data.totalOrders || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">This Month: {data.ordersThisMonth || 0}</p>
          </div>
          <div className="p-3 bg-green-500/20 rounded-full">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
            <p className="text-3xl font-bold text-blue-600">₹{(data.salesToday || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">This Week: ₹{(data.salesThisWeek || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-full">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold text-orange-600">{data.totalUsers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">New This Month: {data.newUsersThisMonth || 0}</p>
          </div>
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Stores</p>
            <p className="text-3xl font-bold text-purple-600">{data.totalStores || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Stores</p>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-full">
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <p className="text-3xl font-bold text-red-600">{data.totalProducts || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Out of Stock: {data.outOfStockProducts || 0}</p>
          </div>
          <div className="p-3 bg-red-500/20 rounded-full">
            <Package className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};