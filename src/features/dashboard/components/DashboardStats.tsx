import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { DashboardData } from '../types/dashboard.types';

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">₹{data.totalSales?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This Month: ₹{data.salesThisMonth?.toLocaleString()}</p>
          </div>
          <DollarSign className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{data.totalOrders}</p>
            <p className="text-xs text-muted-foreground">This Month: {data.ordersThisMonth}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
            <p className="text-2xl font-bold">₹{data.salesToday?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This Week: ₹{data.salesThisWeek?.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{data.totalUsers}</p>
            <p className="text-xs text-muted-foreground">New This Month: {data.newUsersThisMonth}</p>
          </div>
          <Users className="h-8 w-8 text-orange-500" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Stores</p>
            <p className="text-2xl font-bold">{data.totalStores}</p>
            <p className="text-xs text-muted-foreground">Out of Stock: {data.outOfStockProducts}</p>
          </div>
          <Package className="h-8 w-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{data.totalProducts}</p>
            <p className="text-xs text-muted-foreground">Low Stock: {data.lowStockProducts}</p>
          </div>
          <Package className="h-8 w-8 text-red-500" />
        </div>
      </Card>
    </div>
  );
};