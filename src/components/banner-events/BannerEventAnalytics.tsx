import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import { Activity, Users, TrendingUp, DollarSign } from 'lucide-react';

interface BannerEventAnalyticsProps {
  eventId?: number;
}

const BannerEventAnalytics: React.FC<BannerEventAnalyticsProps> = ({ eventId }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  
  // Get analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['banner-event-analytics', eventId, selectedTimeRange],
    queryFn: () => {
      if (eventId) {
        const days = parseInt(selectedTimeRange.replace('d', ''));
        const toDate = new Date().toISOString().split('T')[0];
        const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return apiService.getEventAnalytics(eventId, fromDate, toDate);
      }
      return null;
    },
    enabled: !!eventId
  });

  // Get top performing events
  const { data: topPerformingData, isLoading: topPerformingLoading } = useQuery({
    queryKey: ['top-performing-events'],
    queryFn: () => apiService.getTopPerformingEvents(5)
  });

  // Get discount summary
  const { data: discountSummaryData, isLoading: discountSummaryLoading } = useQuery({
    queryKey: ['discount-summary'],
    queryFn: () => apiService.getDiscountSummary()
  });

  // Get real-time data
  const { data: realTimeData, isLoading: realTimeLoading } = useQuery({
    queryKey: ['real-time-data'],
    queryFn: () => apiService.getRealTimeData(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const isLoading = analyticsLoading || topPerformingLoading || discountSummaryLoading || realTimeLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your banner events performance and engagement
          </p>
        </div>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(realTimeData?.data) ? realTimeData.data.filter(event => event.status === 'active').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running events
            </p>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.data?.totalViews?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData?.data?.viewsGrowth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        {/* Total Clicks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.data?.totalClicks?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.data?.clickThroughRate || 0}% CTR
            </p>
          </CardContent>
        </Card>

        {/* Total Discount Given */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${discountSummaryData?.data?.totalDiscountGiven?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {discountSummaryData?.data?.totalOrders || 0} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>
            Events with highest engagement rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(topPerformingData?.data) && topPerformingData.data.length > 0 ? (
              topPerformingData.data.map((event, index) => (
                <div key={event.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                    >
                      {event.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {event.discountPercentage}% off
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No events data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Discount Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Usage</CardTitle>
            <CardDescription>
              Current discount distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Discount</span>
                <span className="text-sm font-medium">
                  {discountSummaryData?.data?.averageDiscountPercentage || 0}%
                </span>
              </div>
              <Progress 
                value={discountSummaryData?.data?.averageDiscountPercentage || 0} 
                className="h-2" 
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{discountSummaryData?.data?.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Savings</p>
                  <p className="font-medium">${discountSummaryData?.data?.totalDiscountGiven || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Event Status Overview</CardTitle>
            <CardDescription>
              Current status of all events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(realTimeData?.data) && realTimeData.data.length > 0 ? (
                realTimeData.data.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.status === 'active' ? 'bg-green-500' : 
                        event.status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-sm truncate max-w-[150px]">{event.title}</span>
                    </div>
                    <Badge 
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {event.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No real-time data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BannerEventAnalytics;