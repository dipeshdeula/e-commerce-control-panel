import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardData } from '../types/dashboard.types';

interface RecentActivityProps {
  data: DashboardData;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  // Safety check for data
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="shadow-lg border-primary/10 animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="shadow-lg border-primary/10 hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-primary">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.slice(0, 5).map((order) => (
                <div key={order.orderId} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Order #{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">₹{(order.amount || 0).toLocaleString()}</p>
                    <Badge 
                      variant={order.status === 'Confirmed' ? 'default' : order.status === 'COMPLETED' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {order.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent orders available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-green-500/10 hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-green-600">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topSellingProducts && data.topSellingProducts.length > 0 ? (
              data.topSellingProducts.slice(0, 5).map((product) => (
                <div key={product.productId} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{product.name || 'Unknown Product'}</p>
                    <p className="text-xs text-muted-foreground">Sold: {product.soldQuantity || 0} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">₹{(product.totalSales || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No top selling products available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-purple-500/10 hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-purple-600">Top Stores by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topStoresByIncome && data.topStoresByIncome.length > 0 ? (
              data.topStoresByIncome.slice(0, 5).map((store) => (
                <div key={store.storeId} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{(store.storeName || 'U').charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{store.storeName || 'Unknown Store'}</p>
                      <p className="text-xs text-muted-foreground">{store.ownerName || 'Unknown Owner'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">₹{(store.totalIncome || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No top stores available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};