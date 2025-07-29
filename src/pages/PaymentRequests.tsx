import React, { useState } from 'react';
import { useMutation, useQuery,useQueryClient } from '@tanstack/react-query';
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
import { Search, Calendar, Filter, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethodType } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  const [goToPage,setGoToPage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [localDeletedItems, setLocalDeletedItems] = useState<Set<number>>(new Set());
  const [localRestoredItems, setLocalRestoredItems] = useState<Set<number>>(new Set());

  const {toast} = useToast();
  const queryClient = useQueryClient();

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

  // Clear local state when fresh data is loaded
  React.useEffect(() => {
    if (paymentRequests) {
      setLocalDeletedItems(new Set());
      setLocalRestoredItems(new Set());
    }
  }, [paymentRequests]);

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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Reset pagination when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  // Helper function to determine if a request is deleted
  const isRequestDeleted = (request: any) => {
    // Check local state first for immediate UI updates
    if (localDeletedItems.has(request.id)) return true;
    if (localRestoredItems.has(request.id)) return false;
    
    // Fall back to API response
    return request.isDeleted === true;
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-100 text-yellow-700' },
      succeeded: { variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
      completed: { variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
      failed: { variant: 'destructive' as const, icon: XCircle, className: 'bg-red-100 text-red-700' },
      cancelled: { variant: 'secondary' as const, icon: AlertCircle, className: 'bg-gray-100 text-gray-700' },
      expired: { variant: 'secondary' as const, icon: AlertCircle, className: 'bg-orange-100 text-orange-700' },
    };

    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;
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
    if (!paymentRequests?.data) return [];
    
    // Try different possible structures based on API response
    let requests_data = [];
    if (paymentRequests.data.data && Array.isArray(paymentRequests.data.data)) {
      // Nested structure like { data: { data: [...] } }
      requests_data = paymentRequests.data.data;
    } else if (paymentRequests.data && Array.isArray(paymentRequests.data)) {
      // Direct structure like { data: [...] }
      requests_data = paymentRequests.data;
    } else {
      requests_data = [];
    }
    
    // Debug: Check isDeleted property
    if (requests_data.length > 0) {
      console.log('Sample request data:', requests_data[0]);
      console.log('isDeleted properties:', requests_data.map(r => ({ id: r.id, isDeleted: r.isDeleted })));
    }
    
    return requests_data;
  };

  const softDeleteMutation = useMutation({
    mutationFn : (id:number)=> apiService.softDeletePaymentRequest(id),
    onSuccess:(data, variables) => {
      console.log('Soft delete response:', data);
      // Update local state immediately for UI responsiveness
      setLocalDeletedItems(prev => new Set([...prev, variables]));
      setLocalRestoredItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });
      queryClient.invalidateQueries({queryKey:['paymentRequests']});
      toast({title:'Payment request soft deleted successfully'});
    },
    onError: (error: any) => {
      console.error('Soft delete error:', error);
      toast({ 
        title: 'Error deleting payment request', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn : (id:number)=> apiService.unDeletePaymentRequest(id),
    onSuccess:(data, variables) => {
      console.log('Undelete response:', data);
      // Update local state immediately for UI responsiveness
      setLocalRestoredItems(prev => new Set([...prev, variables]));
      setLocalDeletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });
      queryClient.invalidateQueries({queryKey:['paymentRequests']});
      toast({title:'Payment request restored successfully'});
    },
    onError: (error: any) => {
      console.error('Undelete error:', error);
      toast({ 
        title: 'Error restoring payment request', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn:(id:number)=>apiService.hardDeletePaymentRequest(id),
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:['paymentRequests']});
      toast({title:'Payment request permanently deleted successfully'});
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error permanently deleting payment request', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const paymentRequestsArray = getPaymentRequestsArray();
  
  // Apply client-side filtering and search
  const filteredRequests = paymentRequestsArray.filter((request: any) => {
    // Search filter
    const matchesSearch = !searchTerm || 
      request.id.toString().includes(searchTerm) ||
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.paymentMethodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId.toString().includes(searchTerm);
    
    // Status filter
    const matchesStatus = !filters.status || request.paymentStatus.toLowerCase() === filters.status.toLowerCase();
    
    // Payment method filter
    const matchesPaymentMethod = !filters.paymentMethod || 
      request.paymentMethodId.toString() === filters.paymentMethod;
    
    // Date filters
    const requestDate = new Date(request.createdAt);
    const matchesStartDate = !filters.startDate || requestDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || requestDate <= new Date(filters.endDate + 'T23:59:59');
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesStartDate && matchesEndDate;
  });
  
  // Apply sorting
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (filters.ordering) {
      case '-created_at':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'created_at':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case '-amount':
        return b.paymentAmount - a.paymentAmount;
      case 'amount':
        return a.paymentAmount - b.paymentAmount;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Apply pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = sortedRequests.slice(startIndex, endIndex);
  
  const totalItems = sortedRequests.length;
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
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
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
                {paginatedRequests.map((request: any) => (
                  <TableRow 
                    key={request.id} 
                    className={isRequestDeleted(request) ? 'bg-red-50 opacity-75' : ''}
                  >
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
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(request.paymentStatus)}
                        {isRequestDeleted(request) && (
                          <Badge variant="destructive" className="text-xs">
                            Deleted
                          </Badge>
                        )}
                      </div>
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
                              onClick={() => handleViewDetails(request)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>

                        {!isRequestDeleted(request) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(request.id)}
                                disabled={softDeleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Move to Trash (Soft Delete)</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => unDeleteMutation.mutate(request.id)}
                                disabled={unDeleteMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore Payment Request</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(request.id)}
                              disabled={hardDeleteMutation.isPending}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Permanently Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paginatedRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No payment requests found</p>
                {(searchTerm || Object.values(filters).some(v => v)) && (
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                )}
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

        {/* Payment Request Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Request Details - #{selectedRequest?.id}</DialogTitle>
              <DialogDescription>
                View complete payment request information
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Request ID:</span> #{selectedRequest.id}</div>
                      <div><span className="font-medium">Amount:</span> {formatCurrency(selectedRequest.paymentAmount)}</div>
                      <div><span className="font-medium">Currency:</span> {selectedRequest.currency}</div>
                      <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRequest.paymentStatus)}</div>
                      <div><span className="font-medium">Payment Method:</span> {selectedRequest.paymentMethodName}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Order & User Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">User:</span> {selectedRequest.userName}</div>
                      <div><span className="font-medium">User ID:</span> {selectedRequest.userId}</div>
                      <div><span className="font-medium">Order ID:</span> {selectedRequest.orderId}</div>
                      <div><span className="font-medium">Order Total:</span> {formatCurrency(selectedRequest.orderTotal)}</div>
                      <div><span className="font-medium">Created:</span> {formatDate(selectedRequest.createdAt)}</div>
                      <div><span className="font-medium">Updated:</span> {formatDate(selectedRequest.updatedAt)}</div>
                    </div>
                  </div>
                </div>

                {selectedRequest.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
                  </div>
                )}

                {selectedRequest.instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.instructions}</p>
                  </div>
                )}

                {(selectedRequest.esewaTransactionId || selectedRequest.khaltiPidx) && (
                  <div>
                    <h3 className="font-semibold mb-2">Transaction Details</h3>
                    <div className="space-y-2 text-sm">
                      {selectedRequest.esewaTransactionId && (
                        <div><span className="font-medium">eSewa Transaction ID:</span> {selectedRequest.esewaTransactionId}</div>
                      )}
                      {selectedRequest.khaltiPidx && (
                        <div><span className="font-medium">Khalti PIDX:</span> {selectedRequest.khaltiPidx}</div>
                      )}
                      {selectedRequest.paymentUrl && (
                        <div>
                          <span className="font-medium">Payment URL:</span> 
                          <a href={selectedRequest.paymentUrl} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800 ml-2">
                            Open Payment Link
                          </a>
                        </div>
                      )}
                      {selectedRequest.expiresAt && (
                        <div><span className="font-medium">Expires At:</span> {formatDate(selectedRequest.expiresAt)}</div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequest.metadata && (
                  <div>
                    <h3 className="font-semibold mb-2">Metadata</h3>
                    <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedRequest.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
