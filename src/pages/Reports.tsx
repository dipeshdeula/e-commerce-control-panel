
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
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

// Sample data for charts
const salesData = [
  { month: "Jan", sales: 45000, orders: 120, users: 15 },
  { month: "Feb", sales: 52000, orders: 142, users: 23 },
  { month: "Mar", sales: 48000, orders: 135, users: 18 },
  { month: "Apr", sales: 61000, orders: 167, users: 31 },
  { month: "May", sales: 55000, orders: 153, users: 27 },
  { month: "Jun", sales: 67000, orders: 178, users: 35 },
];

const categoryData = [
  { name: "Electronics", value: 35, color: "#2377FC" },
  { name: "Baby Care", value: 25, color: "#60A5FA" },
  { name: "Home & Kitchen", value: 20, color: "#34D399" },
  { name: "Cosmetics", value: 15, color: "#F59E0B" },
  { name: "Others", value: 5, color: "#EF4444" },
];

const reportTypes = [
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'Comprehensive sales performance and revenue analysis',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Stock levels, product performance, and inventory turnover',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'orders',
    title: 'Orders Report',
    description: 'Order trends, processing times, and fulfillment metrics',
    icon: ShoppingCart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'customers',
    title: 'Customer Report',
    description: 'User analytics, acquisition, and behavior patterns',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30');
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = (reportType: string, format: string) => {
    // Simulate report generation
    const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
    
    // In a real application, this would trigger the actual export
    console.log(`Exporting ${reportType} report as ${format}`);
    
    // Show success message
    alert(`Report "${filename}" has been generated and will be downloaded shortly.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive business reports and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            <Calendar className="w-3 h-3 mr-1" />
            Last 30 days
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Revenue</p>
                <p className="text-2xl font-bold">$328,000</p>
                <p className="text-blue-100 text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Orders</p>
                <p className="text-2xl font-bold">1,245</p>
                <p className="text-purple-100 text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">New Customers</p>
                <p className="text-2xl font-bold">149</p>
                <p className="text-green-100 text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.3% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Products Sold</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-orange-100 text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +22.1% from last month
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-500" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <RechartsLineChart data={salesData}>
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
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Sales by Category
            </CardTitle>
            <CardDescription>Product category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-gray-600">{data.value}% of total sales</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Generate Reports
          </CardTitle>
          <CardDescription>
            Create detailed reports for business analysis and record keeping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedReport === report.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-3`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
              </div>
            ))}
          </div>

          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last 12 months</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => handleExport(selectedReport, exportFormat)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Report Preview: {reportTypes.find(r => r.id === selectedReport)?.title}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">1,247</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-600 font-medium">Growth Rate</p>
                  <p className="text-2xl font-bold text-green-900">+15.2%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-600 font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900">94.8%</p>
                </div>
              </div>

              {/* Sample Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="font-medium text-gray-900">Sample Data (Last 5 Records)</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">Record #{i}</p>
                        <p className="text-sm text-gray-500">Sample data entry for preview</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">$1,{200 + i * 150}</p>
                        <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
