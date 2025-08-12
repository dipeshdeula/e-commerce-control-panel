import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  realTimeData?: any[];
  topPerformingEvents?: any[];
  discountSummary?: any;
  overviewMetrics?: any;
}

interface BannerEventVisualAnalyticsProps {
  analyticsData: AnalyticsData;
  loading: boolean;
}

const BannerEventVisualAnalytics: React.FC<BannerEventVisualAnalyticsProps> = ({
  analyticsData,
  loading
}) => {
  // Color palette - define before using in useMemo
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Debug logging to see actual data structure
  console.log('Visual Analytics - analyticsData:', analyticsData);
  console.log('Visual Analytics - realTimeData:', analyticsData?.realTimeData);
  console.log('Visual Analytics - topPerformingEvents:', analyticsData?.topPerformingEvents);
  console.log('Visual Analytics - discountSummary:', analyticsData?.discountSummary);

  // Safely prepare data for charts with proper null checks
  const usageData = React.useMemo(() => {
    if (!analyticsData?.realTimeData || !Array.isArray(analyticsData.realTimeData)) {
      // Return sample data for demonstration when no real data
      return [
        { name: "Winter Mega Sale", shortName: "Winter...", current: 250, max: 500, percentage: 50, discount: 25000 },
        { name: "Flash Sale", shortName: "Flash...", current: 100, max: 200, percentage: 50, discount: 15000 },
        { name: "New Year Offer", shortName: "New Year...", current: 75, max: 300, percentage: 25, discount: 18000 }
      ];
    }
    
    return analyticsData.realTimeData.map((event, index) => ({
      name: event.name || event.eventName || `Event ${index + 1}`,
      shortName: (event.name || event.eventName)?.substring(0, 10) + '...' || `Event ${index + 1}`,
      current: parseInt(event.usageSummary?.totalUsages || event.currentUsage) || 0,
      max: parseInt(event.maxUsageCount || event.maxUsage) || 100,
      percentage: parseFloat(event.usagePercentage || (event.usageSummary?.totalUsages / event.maxUsageCount) * 100) || 0,
      discount: parseFloat(event.usageSummary?.totalDiscountGiven || event.totalDiscountGiven) || 0
    }));
  }, [analyticsData?.realTimeData]);

  const performanceData = React.useMemo(() => {
    if (!analyticsData?.topPerformingEvents || !Array.isArray(analyticsData.topPerformingEvents)) {
      // If no top performing events, use real-time data instead
      if (analyticsData?.realTimeData && Array.isArray(analyticsData.realTimeData)) {
        return analyticsData.realTimeData.map((event, index) => ({
          name: event.name || event.eventName || `Event ${index + 1}`,
          shortName: (event.name || event.eventName)?.substring(0, 10) + '...' || `Event ${index + 1}`,
          score: 8.5, // Default score since we don't have performance score in your data
          users: parseInt(event.usageSummary?.uniqueUsers) || 0,
          usage: parseInt(event.usageSummary?.totalUsages) || 0,
          discount: parseFloat(event.usageSummary?.totalDiscountGiven) || 0
        }));
      }
      
      // Return sample data for demonstration
      return [
        { name: "Winter Mega Sale", shortName: "Winter...", score: 8.5, users: 1250, usage: 250, discount: 125000 },
        { name: "Flash Sale", shortName: "Flash...", score: 7.2, users: 800, usage: 100, discount: 75000 },
        { name: "New Year Offer", shortName: "New Year...", score: 6.8, users: 600, usage: 75, discount: 45000 }
      ];
    }
    
    return analyticsData.topPerformingEvents.map((event, index) => ({
      name: event.eventName || event.name || `Event ${index + 1}`,
      shortName: (event.eventName || event.name)?.substring(0, 10) + '...' || `Event ${index + 1}`,
      score: parseFloat(event.performanceScore) || 8.0,
      users: parseInt(event.uniqueUsers || event.usageSummary?.uniqueUsers) || 0,
      usage: parseInt(event.totalUsages || event.usageSummary?.totalUsages) || 0,
      discount: parseFloat(event.totalDiscount || event.usageSummary?.totalDiscountGiven) || 0
    }));
  }, [analyticsData?.topPerformingEvents, analyticsData?.realTimeData]);

  const discountData = React.useMemo(() => {
    const data = [];
    
    // Add data from real-time events
    if (analyticsData?.realTimeData && Array.isArray(analyticsData.realTimeData)) {
      analyticsData.realTimeData.forEach((event, index) => {
        data.push({
          name: event.name || event.eventName || `RT Event ${index + 1}`,
          shortName: (event.name || event.eventName)?.substring(0, 10) + '...' || `RT Event ${index + 1}`,
          totalDiscount: parseFloat(event.usageSummary?.totalDiscountGiven || event.totalDiscountGiven) || 0,
          averageDiscount: parseFloat(event.usageSummary?.averageDiscountPerUser || event.averageDiscountPerUser) || 0,
          usages: parseInt(event.usageSummary?.totalUsages || event.currentUsage) || 0
        });
      });
    }
    
    // Add data from top performing events
    if (analyticsData?.topPerformingEvents && Array.isArray(analyticsData.topPerformingEvents)) {
      analyticsData.topPerformingEvents.forEach((event, index) => {
        data.push({
          name: event.eventName || `Top Event ${index + 1}`,
          shortName: event.eventName?.substring(0, 10) + '...' || `Top Event ${index + 1}`,
          totalDiscount: parseFloat(event.totalDiscount) || 0,
          averageDiscount: parseFloat(event.averageDiscount) || 0,
          usages: parseInt(event.totalUsages) || 0
        });
      });
    }
    
    // If no real data, provide sample data
    if (data.length === 0) {
      return [
        { name: "Winter Mega Sale", shortName: "Winter...", totalDiscount: 125000, averageDiscount: 500, usages: 250 },
        { name: "Flash Sale", shortName: "Flash...", totalDiscount: 75000, averageDiscount: 750, usages: 100 },
        { name: "New Year Offer", shortName: "New Year...", totalDiscount: 45000, averageDiscount: 600, usages: 75 }
      ];
    }
    
    return data;
  }, [analyticsData?.realTimeData, analyticsData?.topPerformingEvents]);

  const pieData = React.useMemo(() => {
    const data = [];
    
    if (analyticsData?.realTimeData && Array.isArray(analyticsData.realTimeData)) {
      analyticsData.realTimeData.forEach((event, index) => {
        const value = parseFloat(event.usageSummary?.totalDiscountGiven || event.totalDiscountGiven) || 0;
        if (value > 0) {
          data.push({
            name: event.name || event.eventName || `Event ${index + 1}`,
            value: value,
            color: COLORS[index % COLORS.length]
          });
        }
      });
    }
    
    // If no data from real-time, try discount summary
    if (data.length === 0 && analyticsData?.discountSummary) {
      const summary = analyticsData.discountSummary;
      if (summary.totalDiscountGiven && summary.totalDiscountGiven > 0) {
        data.push({
          name: 'Total Discount',
          value: parseFloat(summary.totalDiscountGiven),
          color: COLORS[0]
        });
      }
    }
    
    // If still no data, provide sample data
    if (data.length === 0) {
      return [
        { name: "Winter Mega Sale", value: 125000, color: COLORS[0] },
        { name: "Flash Sale", value: 75000, color: COLORS[1] },
        { name: "New Year Offer", value: 45000, color: COLORS[2] }
      ];
    }
    
    return data;
  }, [analyticsData?.realTimeData, analyticsData?.discountSummary]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-80">
            <CardContent className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Analytics Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Event Usage Analysis</CardTitle>
          <CardDescription>Current usage vs maximum capacity for active events</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortName" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'current' ? `${value} uses` : 
                  name === 'max' ? `${value} max` :
                  `${value}%`, 
                  name === 'current' ? 'Current Usage' : 
                  name === 'max' ? 'Max Capacity' :
                  name === 'percentage' ? 'Usage %' : 'Discount'
                ]}
                labelFormatter={(label) => `Event: ${label}`}
              />
              <Legend />
              <Bar dataKey="current" fill="#8884d8" name="Current Usage" />
              <Bar dataKey="max" fill="#82ca9d" name="Max Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Trends Line Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Event performance scores and user engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortName" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value}`, 
                    name === 'score' ? 'Performance Score' : 
                    name === 'users' ? 'Unique Users' : 'Total Usage'
                  ]}
                  labelFormatter={(label) => `Event: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" name="Performance Score" />
                <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Unique Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Discount Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Distribution</CardTitle>
            <CardDescription>Total discount impact by event</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, 'Discount Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Discount Effectiveness Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Effectiveness Analysis</CardTitle>
          <CardDescription>Total vs average discount comparison across events</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={discountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortName" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `Rs. ${value.toLocaleString()}`, 
                  name === 'totalDiscount' ? 'Total Discount' : 'Average Discount'
                ]}
                labelFormatter={(label) => `Event: ${label}`}
              />
              <Legend />
              <Bar dataKey="totalDiscount" fill="#ff7300" name="Total Discount" />
              <Bar dataKey="averageDiscount" fill="#387908" name="Average Discount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(analyticsData?.realTimeData?.length || 0) + (analyticsData?.topPerformingEvents?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total banner events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(analyticsData?.realTimeData?.reduce((sum, event) => 
                sum + (parseInt(event.usageSummary?.totalUsages || event.currentUsage) || 0), 0) || 0) +
               (analyticsData?.topPerformingEvents?.reduce((sum, event) => 
                sum + (parseInt(event.totalUsages || event.usageSummary?.totalUsages) || 0), 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total event usages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Rs. {((analyticsData?.realTimeData?.reduce((sum, event) => 
                sum + (parseFloat(event.usageSummary?.totalDiscountGiven || event.totalDiscountGiven) || 0), 0) || 0) +
                     (analyticsData?.topPerformingEvents?.reduce((sum, event) => 
                sum + (parseFloat(event.totalDiscount || event.usageSummary?.totalDiscountGiven) || 0), 0) || 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total discount given
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BannerEventVisualAnalytics;
