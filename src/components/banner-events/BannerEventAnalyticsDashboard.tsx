import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';
import { BannerEventService } from '@/services/banner-event-service';
import BannerEventVisualAnalytics from './BannerEventVisualAnalytics';

interface AnalyticsData {
  realTimeData?: any[];
  topPerformingEvents?: any[];
  discountSummary?: any;
  overviewMetrics?: any;
}

const BannerEventAnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  // Create banner event service instance
  const bannerEventService = React.useMemo(() => new BannerEventService(), []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch all analytics data with proper error handling
        const [realTimeResult, topEventsResult, summaryResult] = await Promise.allSettled([
          bannerEventService.getRealTimeData(),
          bannerEventService.getTopPerformingEvents(5),
          bannerEventService.getDiscountSummary()
        ]);

        const newData: AnalyticsData = {};

        // Process real-time data
        if (realTimeResult.status === 'fulfilled' && realTimeResult.value?.data) {
          const realTimeData = realTimeResult.value.data;
          newData.realTimeData = Array.isArray(realTimeData) 
            ? realTimeData 
            : (realTimeData as any)?.data || [];
        }

        // Process top performing events
        if (topEventsResult.status === 'fulfilled' && topEventsResult.value?.data) {
          newData.topPerformingEvents = Array.isArray(topEventsResult.value.data) 
            ? topEventsResult.value.data 
            : [];
        }

        // Process discount summary
        if (summaryResult.status === 'fulfilled' && summaryResult.value?.data) {
          newData.discountSummary = summaryResult.value.data;
        }

        console.log('Analytics Data Loaded:', newData);
        setAnalyticsData(newData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Only set empty data on error - no static fallback
        setAnalyticsData({
          realTimeData: [],
          topPerformingEvents: [],
          discountSummary: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod, bannerEventService]);

  const refreshData = () => {
    setAnalyticsData({});
    setLoading(true);
    // Trigger re-fetch by changing a dependency
    setSelectedPeriod(prev => prev);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banner Event Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your banner events performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24 hours</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="visual">Visual Analytics</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="rules">Rule Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Events
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : (analyticsData?.realTimeData?.filter(event => event.isActive).length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running events
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usage
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : (analyticsData?.realTimeData?.reduce((sum, event) => sum + (event.currentUsage || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total event applications
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Discount Given</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs.{loading ? '...' : (analyticsData?.discountSummary?.totalDiscountGiven?.toLocaleString() || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.discountSummary?.period || 'Current period'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Discount/Day
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs.{loading ? '...' : (analyticsData?.discountSummary?.averageDiscountPerDay?.toFixed(2) || '0.00')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Daily average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events Performance</CardTitle>
              <CardDescription>
                Overview of your most recent banner events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : analyticsData?.realTimeData?.slice(0, 3).map((event, index) => (
                  <div key={event.eventId || index} className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {event.eventName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.eventType} • {event.timeStatus}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.isActive ? "default" : "secondary"}>
                        {event.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="w-20">
                        <Progress value={event.usagePercentage * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {Math.round(event.usagePercentage * 100)}%
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent events data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Events</CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : (analyticsData?.realTimeData?.filter(event => event.isActive).length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : (analyticsData?.realTimeData?.reduce((sum, event) => sum + (event.uniqueUsers || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total unique users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue Impact</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  Rs.{loading ? '...' : (analyticsData?.realTimeData?.reduce((sum, event) => sum + (event.totalDiscountGiven || 0), 0)?.toLocaleString() || '0')}
                </div>
                <p className="text-xs text-muted-foreground">Discount given</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Event Status</CardTitle>
              <CardDescription>Real-time monitoring of active banner events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading real-time data...</div>
                ) : analyticsData?.realTimeData && analyticsData.realTimeData.length > 0 ? (
                  analyticsData.realTimeData.filter(event => event.isActive).map((event, index) => (
                    <div key={event.eventId || index} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{event.eventName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.eventType} Event • Priority {event.priority}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="mb-1">Live</Badge>
                          <p className="text-sm text-muted-foreground">
                            {event.timeStatus || `${event.daysRemaining} days remaining`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Usage Progress</span>
                          <span>{(event.usagePercentage * 100).toFixed(1)}% used ({event.currentUsage}/{event.maxUsage})</span>
                        </div>
                        <Progress value={event.usagePercentage * 100} className="h-3" />
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>Remaining: {event.remainingUsage} uses</div>
                          <div>Performance: {event.healthIndicator}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Discount Impact:</span>
                          <span className="font-semibold">Rs.{event.totalDiscountGiven?.toLocaleString()} ({event.uniqueUsers} users)</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active events at the moment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.2min</div>
                <p className="text-xs text-muted-foreground">Average session</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32.1%</div>
                <p className="text-xs text-muted-foreground">-4.2% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245%</div>
                <p className="text-xs text-muted-foreground">+15% from last period</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
              <CardDescription>Events with the highest performance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading performance data...</div>
                ) : analyticsData?.topPerformingEvents && analyticsData.topPerformingEvents.length > 0 ? (
                  analyticsData.topPerformingEvents.map((event, index) => (
                    <div key={event.eventId || index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{event.eventName}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.totalUsages} usages • {event.uniqueUsers} users • Rs.{event.totalDiscount?.toLocaleString()} total discount
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">Score: {event.performanceScore?.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Avg: Rs.{event.averageDiscount?.toFixed(2)}</div>
                        </div>
                        <div className="w-20">
                          <Progress value={Math.min(event.performanceScore * 10, 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Analytics Tab */}
        <TabsContent value="visual" className="space-y-4">
          <BannerEventVisualAnalytics 
            analyticsData={analyticsData}
            loading={loading}
          />
        </TabsContent>

        {/* Detailed Analytics Tab */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time-based Analysis</CardTitle>
                <CardDescription>Performance trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Hours</span>
                    <Badge>2PM - 6PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Day</span>
                    <Badge>Saturday</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session</span>
                    <span className="text-sm font-medium">8m 23s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Event performance by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">North America</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Europe</span>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asia</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Others</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Analysis Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discount Rules Performance</CardTitle>
              <CardDescription>Analysis of how your discount rules are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      Rs.{loading ? '...' : (analyticsData?.discountSummary?.totalDiscountGiven?.toLocaleString() || '0')}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Discounts Given</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      Rs.{loading ? '...' : (analyticsData?.discountSummary?.averageDiscountPerDay?.toFixed(2) || '0.00')}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Daily Discount</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {loading ? '...' : (analyticsData?.realTimeData?.length || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Events</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {loading ? '...' : (analyticsData?.realTimeData?.reduce((sum, event) => sum + (event.currentUsage || 0), 0) || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Usage</p>
                  </div>
                </div>

                {analyticsData?.discountSummary && (
                  <Card className="p-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">Period Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-2 font-medium">{analyticsData.discountSummary.period}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">From:</span>
                          <span className="ml-2 font-medium">
                            {new Date(analyticsData.discountSummary.fromDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To:</span>
                          <span className="ml-2 font-medium">
                            {new Date(analyticsData.discountSummary.toDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Event Performance Analysis</h4>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading performance analysis...</div>
                  ) : analyticsData?.realTimeData && analyticsData.realTimeData.length > 0 ? (
                    analyticsData.realTimeData.map((event, index) => (
                      <div key={event.eventId || index} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{event.eventName}</h5>
                          <Badge variant="outline">Rs.{event.totalDiscountGiven?.toLocaleString()} impact</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Usage Rate</span>
                              <span>{(event.usagePercentage * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={event.usagePercentage * 100} className="h-2" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Performance Score</span>
                              <span>{event.performanceScore?.toFixed(2) || 'N/A'}</span>
                            </div>
                            <Progress value={Math.min((event.performanceScore || 0) * 20, 100)} className="h-2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <div>Users: {event.uniqueUsers}</div>
                          <div>Usage: {event.currentUsage}/{event.maxUsage}</div>
                          <div>Health: {event.healthIndicator}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No event performance data available
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BannerEventAnalyticsDashboard;
