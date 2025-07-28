
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Calendar, Filter, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PaymentMethodType } from '@/types/api';

interface PaymentRequestFilters {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  ordering?: string;
}

export const PaymentRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PaymentRequestFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch payment requests with filters
  const { data: paymentRequests, isLoading, error } = useQuery({
    queryKey: ['paymentRequests', searchTerm, filters, currentPage, pageSize],
    queryFn: async () => {
      const response = await apiService.getPaymentRequests({
        searchTerm: searchTerm || undefined,
        pageNumber: currentPage,
        pageSize,
        status: filters.status,
        paymentMethodId: filters.paymentMethod ? parseInt(filters.paymentMethod) : undefined,
        fromDate: filters.startDate,
        toDate: filters.endDate,
        orderBy: filters.ordering,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment requests');
      }
      return response;
    },
  });

  console.log("payment request:", paymentRequests);

  // Fetch payment methods for filter dropdown
  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const response = await apiService.getAllPaymentMethods();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment methods');
      }
      return response;
    },
  });

  const handleFilterChange = (key: keyof PaymentRequestFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (value === 'all' || value === 'default') ? undefined : value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      completed: { variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
      failed: { variant: 'destructive' as const, icon: XCircle, className: 'bg-red-100 text-red-700' },
      cancelled: { variant: 'secondary' as const, icon: AlertCircle, className: 'bg-gray-100 text-gray-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodName = (id: number) => {
    // Try to find the payment method from the fetched data first
    const paymentMethod = paymentMethods?.data?.data?.find((pm: any) => pm.id === id);
    if (paymentMethod) {
      return paymentMethod.name;
    }
    
    // Fallback to type-based names
    switch (id) {
      case 1: return 'eSewa';
      case 2: return 'Khalti';  
      case 3: return 'Cash on Delivery';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentRequestsArray = () => {
    if (!paymentRequests?.data?.data) return [];
    
    if (Array.isArray(paymentRequests.data.data)) {
      return paymentRequests.data.data;
    }
    
    return [];
  };

  const paymentRequestsArray = getPaymentRequestsArray();
  const totalItems = paymentRequests?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payment Requests</h1>
            <p className="text-gray-600">Monitor and manage payment requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              {totalItems} Total Requests
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={filters.paymentMethod || 'all'} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    <SelectItem value="1">eSewa</SelectItem>
                    <SelectItem value="2">Khalti</SelectItem>
                    <SelectItem value="3">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.ordering || 'default'} onValueChange={(value) => handleFilterChange('ordering', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="-created_at">Newest First</SelectItem>
                    <SelectItem value="created_at">Oldest First</SelectItem>
                    <SelectItem value="-amount">Highest Amount</SelectItem>
                    <SelectItem value="amount">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Requests</CardTitle>
              <div className="flex items-center space-x-2">
                <Label>Show:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentRequestsArray.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">
                      #{request.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{request.userName || 'Unknown User'}</span>
                        <span className="text-sm text-gray-500">User ID: {request.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(request.paymentAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.paymentMethodName || getPaymentMethodName(request.paymentMethodId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paymentRequestsArray.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No payment requests found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => Math.abs(page - currentPage) <= 2)
                      .map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
