
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Filter, 
  Receipt, 
  Trash2, 
  RotateCcw, 
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  CreditCard,
  Package
} from 'lucide-react';

interface BillFilters {
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  ordering?: string;
}

export const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BillFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bills with pagination
  const { data: bills, isLoading, error } = useQuery({
    queryKey: ['bills', searchTerm, filters, currentPage, pageSize],
    queryFn: async () => {
      const response = await apiService.getAllBills({
        pageNumber: currentPage,
        pageSize,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch bills');
      }
      return response;
    },
  });

  const handleFilterChange = (key: keyof BillFilters, value: string) => {
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

  // Reset pagination when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-700' },
      paid: { variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      failed: { variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
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

  const getBillsArray = () => {
    if (!bills?.data) return [];
    
    // Handle different response structures
    if (Array.isArray(bills.data)) {
      return bills.data;
    } else if (bills.data.data && Array.isArray(bills.data.data)) {
      return bills.data.data;
    } else {
      return [];
    }
  };

  const billsArray = getBillsArray();

  // Apply client-side filtering and search
  const filteredBills = billsArray.filter((bill: any) => {
    // Search filter
    const matchesSearch = !searchTerm || 
      bill.id.toString().includes(searchTerm) ||
      bill.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.paymentRequest?.esewaTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.companyInfo?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Payment status filter
    const matchesPaymentStatus = !filters.paymentStatus || 
      bill.paymentRequest?.paymentStatus.toLowerCase() === filters.paymentStatus.toLowerCase();
    
    // Date filters
    const billDate = new Date(bill.billingDate);
    const matchesStartDate = !filters.startDate || billDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || billDate <= new Date(filters.endDate + 'T23:59:59');
    
    return matchesSearch && matchesPaymentStatus && matchesStartDate && matchesEndDate;
  });
  
  // Apply sorting
  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (filters.ordering) {
      case '-billingDate':
        return new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime();
      case 'billingDate':
        return new Date(a.billingDate).getTime() - new Date(b.billingDate).getTime();
      case '-paymentAmount':
        return (b.paymentRequest?.paymentAmount || 0) - (a.paymentRequest?.paymentAmount || 0);
      case 'paymentAmount':
        return (a.paymentRequest?.paymentAmount || 0) - (b.paymentRequest?.paymentAmount || 0);
      default:
        return new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime();
    }
  });
  
  // Apply pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBills = sortedBills.slice(startIndex, endIndex);
  
  const totalItems = sortedBills.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleViewBill = (bill: any) => {
    setSelectedBill(bill);
    setIsBillDetailsOpen(true);
  };

  // Helper function to determine if a bill is deleted
  const isBillDeleted = (bill: any) => {
    return bill.isDeleted === true;
  };

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteBill(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast({ 
        title: 'Bill moved to trash', 
        description: `Bill #${variables} has been soft deleted successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting bill', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteBill(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast({ 
        title: 'Bill restored', 
        description: `Bill #${variables} has been restored successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error restoring bill', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteBill(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast({ 
        title: 'Bill permanently deleted', 
        description: `Bill #${variables} has been permanently deleted.` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting bill', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading bills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center text-red-600">
          <Receipt className="w-8 h-8 mx-auto mb-4" />
          <p>Error loading bills: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Billing Management</h1>
            <p className="text-gray-600">Monitor and manage customer bills and invoices</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              {totalItems} Total Bills
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
                    placeholder="Search by bill ID, customer, transaction..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={filters.paymentStatus || 'all'} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payment statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payment statuses</SelectItem>
                    <SelectItem value="Succeeded">Succeeded</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
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
                    <SelectItem value="-billingDate">Newest First</SelectItem>
                    <SelectItem value="billingDate">Oldest First</SelectItem>
                    <SelectItem value="-paymentAmount">Highest Amount</SelectItem>
                    <SelectItem value="paymentAmount">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
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

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBills.map((bill: any) => (
                  <TableRow 
                    key={bill.id}
                    className={isBillDeleted(bill) ? 'bg-red-50 opacity-75' : ''}
                  >
                    <TableCell className="font-mono text-sm">
                      #{bill.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{bill.user?.name}</span>
                        <span className="text-sm text-gray-500">{bill.user?.email}</span>
                        <span className="text-xs text-gray-400">ID: {bill.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{bill.companyInfo?.name}</span>
                        <span className="text-sm text-gray-500">{bill.companyInfo?.city}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(bill.paymentRequest?.paymentAmount || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {getPaymentStatusBadge(bill.paymentRequest?.paymentStatus || 'pending')}
                        {isBillDeleted(bill) && (
                          <Badge variant="destructive" className="text-xs">
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(bill.billingDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {bill.items?.length || 0} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleViewBill(bill)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Bill Details</p>
                          </TooltipContent>
                        </Tooltip>

                        {!isBillDeleted(bill) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(bill.id)}
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
                                onClick={() => unDeleteMutation.mutate(bill.id)}
                                disabled={unDeleteMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore Bill</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(bill.id)}
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

            {paginatedBills.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No bills found</p>
                <p className="text-sm text-gray-400">
                  {Object.values(filters).some(v => v) || searchTerm 
                    ? 'Try adjusting your filters or search terms' 
                    : 'Bills will appear here when they are generated'
                  }
                </p>
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

        {/* Professional Bill Display Dialog */}
        <Dialog open={isBillDetailsOpen} onOpenChange={setIsBillDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Invoice #{selectedBill?.id}</span>
              </DialogTitle>
              <DialogDescription>
                Professional bill/invoice display
              </DialogDescription>
            </DialogHeader>
            {selectedBill && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="border-b pb-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedBill.companyInfo?.name}</h2>
                        <div className="text-sm text-gray-600 space-y-1 mt-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedBill.companyInfo?.street}, {selectedBill.companyInfo?.city}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedBill.companyInfo?.contact}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{selectedBill.companyInfo?.email}</span>
                          </div>
                          {selectedBill.companyInfo?.websiteUrl && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4" />
                              <span>{selectedBill.companyInfo.websiteUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Registration No:</span>
                          <p>{selectedBill.companyInfo?.registrationNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium">PAN No:</span>
                          <p>{selectedBill.companyInfo?.registeredPanNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium">VAT No:</span>
                          <p>{selectedBill.companyInfo?.registeredVatNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium">Postal Code:</span>
                          <p>{selectedBill.companyInfo?.postalCode}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-3xl font-bold text-blue-600">INVOICE</div>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Invoice #:</span> {selectedBill.id}</div>
                        <div><span className="font-medium">Date:</span> {formatDate(selectedBill.billingDate)}</div>
                        <div><span className="font-medium">Order #:</span> {selectedBill.orderId}</div>
                        <div><span className="font-medium">Payment #:</span> {selectedBill.paymentId}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To & Payment Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Bill To:
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">{selectedBill.user?.name}</div>
                      <div>{selectedBill.user?.email}</div>
                      <div>{selectedBill.user?.contact}</div>
                      <div className="text-gray-500">Customer ID: {selectedBill.userId}</div>
                      {selectedBill.order?.shippingAddress && (
                        <div className="mt-2">
                          <div className="font-medium">Shipping Address:</div>
                          <div>{selectedBill.order.shippingAddress}</div>
                          <div>{selectedBill.order.shippingCity}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Information:
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span>{getPaymentStatusBadge(selectedBill.paymentRequest?.paymentStatus || 'pending')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedBill.paymentRequest?.paymentAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span>{selectedBill.paymentRequest?.currency || 'NPR'}</span>
                      </div>
                      {selectedBill.paymentRequest?.esewaTransactionId && (
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="font-mono text-xs">{selectedBill.paymentRequest.esewaTransactionId}</span>
                        </div>
                      )}
                      {selectedBill.paymentRequest?.metadata?.provider && (
                        <div className="flex justify-between">
                          <span>Provider:</span>
                          <span>{selectedBill.paymentRequest.metadata.provider}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Description:</span>
                        <span>{selectedBill.paymentRequest?.description || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Invoice Items:
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-left">Product</TableHead>
                        <TableHead className="text-center">SKU</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBill.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500">Product ID: {item.productId}</div>
                              {item.notes && (
                                <div className="text-xs text-gray-400 mt-1">{item.notes}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm">
                            {item.productSku}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Invoice Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedBill.items?.reduce((sum: number, item: any) => sum + item.totalPrice, 0) || 0)}</span>
                      </div>
                      {selectedBill.items?.some((item: any) => item.discountAmount) && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(selectedBill.items.reduce((sum: number, item: any) => sum + (item.discountAmount || 0), 0))}</span>
                        </div>
                      )}
                      {selectedBill.items?.some((item: any) => item.taxAmount) && (
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>{formatCurrency(selectedBill.items.reduce((sum: number, item: any) => sum + (item.taxAmount || 0), 0))}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Amount:</span>
                          <span className="text-blue-600">{formatCurrency(selectedBill.paymentRequest?.paymentAmount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-4 text-center text-sm text-gray-500">
                  <p>Thank you for your business!</p>
                  <p className="mt-1">This is a computer-generated invoice and does not require a signature.</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBillDetailsOpen(false)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                Print Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
