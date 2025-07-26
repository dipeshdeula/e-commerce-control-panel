import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';
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

const DashboardRedux: React.FC = () => {
  const dispatch = useDispatch();
  
  // ✅ CORRECT: Using Redux state
  const { data: dashboard, loading: isLoading, error } = useSelector((state: RootState) => state.dashboard);

  // ✅ CORRECT: Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDashboardData() as any);
  }, [dispatch]);

  // ✅ CORRECT: Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchDashboardData() as any);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

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
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={() => dispatch(fetchDashboardData() as any)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
        <button 
          onClick={() => dispatch(fetchDashboardData() as any)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Data
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">InstantMart Dashboard (Redux)</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => dispatch(fetchDashboardData() as any)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Refresh
            </button>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <Calendar className="w-3 h-3 mr-1" />
                  Redux Data
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data managed by Redux Toolkit</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats with Gradient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Sales Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl font-bold">NRs. {dashboard.totalSales?.toLocaleString() || 0}</p>
                      <p className="text-blue-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard.salesToday || 0} from yesterday
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
              <p>Total revenue: NRs. {dashboard.totalSales?.toLocaleString() || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Orders Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold">{dashboard.totalOrders?.toLocaleString() || 0}</p>
                      <p className="text-purple-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard.ordersToday || 0} from yesterday
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
              <p>Total orders: {dashboard.totalOrders?.toLocaleString() || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Users Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold">{dashboard.totalUsers?.toLocaleString() || 0}</p>
                      <p className="text-green-100 text-sm flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{dashboard.newUsersToday || 0} new today
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
              <p>Total users: {dashboard.totalUsers?.toLocaleString() || 0}</p>
            </TooltipContent>
          </Tooltip>

          {/* Additional cards... */}
        </div>

        {/* Debug Information */}
        <Card className="bg-gray-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Data Exists:</strong> {dashboard ? 'Yes' : 'No'}</p>
              <p><strong>Total Sales:</strong> {dashboard?.totalSales || 'N/A'}</p>
              <p><strong>Total Orders:</strong> {dashboard?.totalOrders || 'N/A'}</p>
              <p><strong>Recent Orders Count:</strong> {dashboard?.recentOrders?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default DashboardRedux;
