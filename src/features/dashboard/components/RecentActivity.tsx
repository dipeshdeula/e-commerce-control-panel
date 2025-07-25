import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardData } from '../types/dashboard.types';

interface RecentActivityProps {
  data: DashboardData;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentOrders?.slice(0, 5).map((order) => (
              <div key={order.orderId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Order #{order.orderId}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{order.amount.toLocaleString()}</p>
                  <Badge variant={order.status === 'Confirmed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topSellingProducts?.slice(0, 5).map((product) => (
              <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Sold: {product.soldQuantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{product.totalSales.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Stores by Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topStoresByIncome?.slice(0, 5).map((store) => (
              <div key={store.storeId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">{store.storeName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{store.storeName}</p>
                    <p className="text-xs text-muted-foreground">{store.ownerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{store.totalIncome.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};