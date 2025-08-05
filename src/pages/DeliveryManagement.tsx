import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  Eye,
  Edit,
  UserCheck,
  Navigation,
  Banknote,
  History,
  Download,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { 
  DeliveryStatus, 
  CODPaymentStatus, 
  PaymentRequestWithDelivery, 
  DeliveryStats,
  DeliveryPerson,
  DeliveryRequest,
  CODPaymentCollection
} from '@/services/delivery-service';

// Status color mappings
const getDeliveryStatusBadgeVariant = (status: DeliveryStatus) => {
  switch (status) {
    case DeliveryStatus.PENDING: return 'secondary';
    case DeliveryStatus.OUT_FOR_DELIVERY: return 'default';
    case DeliveryStatus.DELIVERED: return 'default';
    case DeliveryStatus.FAILED_DELIVERY: return 'destructive';
    case DeliveryStatus.RETURNED: return 'outline';
    default: return 'secondary';
  }
};

const getCODStatusBadgeVariant = (status: CODPaymentStatus) => {
  switch (status) {
    case CODPaymentStatus.PENDING: return 'secondary';
    case CODPaymentStatus.COLLECTED: return 'default';
    case CODPaymentStatus.FAILED: return 'destructive';
    case CODPaymentStatus.REFUNDED: return 'outline';
    default: return 'secondary';
  }
};

const getDeliveryStatusIcon = (status: DeliveryStatus) => {
  switch (status) {
    case DeliveryStatus.PENDING: return <Clock className="h-4 w-4" />;
    case DeliveryStatus.OUT_FOR_DELIVERY: return <Truck className="h-4 w-4" />;
    case DeliveryStatus.DELIVERED: return <CheckCircle className="h-4 w-4" />;
    case DeliveryStatus.FAILED_DELIVERY: return <XCircle className="h-4 w-4" />;
    case DeliveryStatus.RETURNED: return <Package className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

// Main Delivery Management Component
const DeliveryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<PaymentRequestWithDelivery | null>(null);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [isCODDialogOpen, setIsCODDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [codNotes, setCodNotes] = useState('');
  const [collectedAmount, setCollectedAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFilter, setDateFilter] = useState({
    fromDate: '',
    toDate: ''
  });

  const queryClient = useQueryClient();

  // Fetch pending deliveries (COD orders ready for delivery)
  const { data: pendingDeliveries, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingDeliveries', currentPage, pageSize, selectedDeliveryPerson, selectedCity],
    queryFn: () => apiService.getPendingDeliveries({
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(selectedDeliveryPerson && selectedDeliveryPerson !== 'all' && { deliveryPersonId: parseInt(selectedDeliveryPerson) }),
      ...(selectedCity && selectedCity !== 'all' && { city: selectedCity })
    })
  });

  // Fetch completed deliveries
  const { data: completedDeliveries, isLoading: loadingCompleted } = useQuery({
    queryKey: ['completedDeliveries', currentPage, pageSize, dateFilter, selectedDeliveryPerson],
    queryFn: () => apiService.getCompletedDeliveries({
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(dateFilter.fromDate && { fromDate: dateFilter.fromDate }),
      ...(dateFilter.toDate && { toDate: dateFilter.toDate }),
      ...(selectedDeliveryPerson && selectedDeliveryPerson !== 'all' && { deliveryPersonId: parseInt(selectedDeliveryPerson) })
    })
  });

  // Fetch delivery statistics
  const { data: deliveryStats } = useQuery({
    queryKey: ['deliveryStats', dateFilter, selectedDeliveryPerson],
    queryFn: () => apiService.getDeliveryStats({
      ...(dateFilter.fromDate && { fromDate: dateFilter.fromDate }),
      ...(dateFilter.toDate && { toDate: dateFilter.toDate }),
      ...(selectedDeliveryPerson && selectedDeliveryPerson !== 'all' && { deliveryPersonId: parseInt(selectedDeliveryPerson) })
    })
  });

  // Fetch delivery persons
  const { data: deliveryPersons } = useQuery({
    queryKey: ['deliveryPersons'],
    queryFn: () => apiService.getDeliveryPersons()
  });

  // Fetch delivery history for selected delivery
  const { data: deliveryHistory } = useQuery({
    queryKey: ['deliveryHistory', selectedDelivery?.id],
    queryFn: () => selectedDelivery ? apiService.getDeliveryHistory(selectedDelivery.id) : null,
    enabled: !!selectedDelivery && isHistoryDialogOpen
  });

  // Mark order as delivered mutation
  const markDeliveredMutation = useMutation({
    mutationFn: (request: DeliveryRequest) => apiService.markOrderAsDelivered(request),
    onSuccess: (response) => {
      toast.success('Order marked as delivered successfully!');
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['completedDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
      setIsDeliveryDialogOpen(false);
      setDeliveryNotes('');
    },
    onError: (error: any) => {
      toast.error(`Failed to mark order as delivered: ${error.message}`);
    }
  });

  // COD payment collection mutation
  const collectCODMutation = useMutation({
    mutationFn: (request: CODPaymentCollection) => apiService.collectCODPayment(request),
    onSuccess: (response) => {
      toast.success('COD payment collected successfully!');
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['completedDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
      setIsCODDialogOpen(false);
      setCodNotes('');
      setCollectedAmount('');
    },
    onError: (error: any) => {
      toast.error(`Failed to collect COD payment: ${error.message}`);
    }
  });

  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ paymentRequestId, status, notes, deliveryPersonId }: {
      paymentRequestId: number;
      status: DeliveryStatus;
      notes?: string;
      deliveryPersonId?: number;
    }) => apiService.updateDeliveryStatus(paymentRequestId, status, notes, deliveryPersonId),
    onSuccess: () => {
      toast.success('Delivery status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['completedDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update delivery status: ${error.message}`);
    }
  });

  // Assign delivery mutation
  const assignDeliveryMutation = useMutation({
    mutationFn: ({ paymentRequestId, deliveryPersonId, notes }: {
      paymentRequestId: number;
      deliveryPersonId: number;
      notes?: string;
    }) => apiService.assignDelivery(paymentRequestId, deliveryPersonId, notes),
    onSuccess: () => {
      toast.success('Delivery assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to assign delivery: ${error.message}`);
    }
  });

  // Handle mark as delivered
  const handleMarkAsDelivered = () => {
    if (!selectedDelivery) return;

    const request: DeliveryRequest = {
      paymentRequestId: selectedDelivery.id,
      companyInfoId: 1, // Default company info ID
      isDelivered: true,
      deliveryNotes: deliveryNotes,
      deliveryPersonId: selectedDelivery.deliveryPersonId
    };

    markDeliveredMutation.mutate(request);
  };

  // Handle COD payment collection
  const handleCODCollection = () => {
    if (!selectedDelivery) return;

    const request: CODPaymentCollection = {
      paymentRequestId: selectedDelivery.id,
      deliveryStatus: DeliveryStatus.DELIVERED,
      notes: codNotes,
      collectedAmount: collectedAmount ? parseFloat(collectedAmount) : undefined
    };

    collectCODMutation.mutate(request);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter deliveries based on search term
  const filterDeliveries = (deliveries: PaymentRequestWithDelivery[]) => {
    if (!searchTerm) return deliveries;
    
    return deliveries.filter(delivery => 
      delivery.id.toString().includes(searchTerm) ||
      delivery.orderId.toString().includes(searchTerm) ||
      delivery.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order?.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order?.shippingCity?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Helper function to safely extract array from API response
  const getArrayFromResponse = (response: any, fallback: any[] = []) => {
    if (!response) return fallback;
    
    // Check different possible structures
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    
    console.warn("Unexpected response structure:", response);
    return fallback;
  };

  const pendingDeliveriesArray = getArrayFromResponse(pendingDeliveries);
  const completedDeliveriesArray = getArrayFromResponse(completedDeliveries);
  
  const pendingList = filterDeliveries(pendingDeliveriesArray);
  const completedList = filterDeliveries(completedDeliveriesArray);
  const stats = deliveryStats?.data;

  // Debug logging
  console.log("Delivery Management Debug:", {
    pendingDeliveries,
    completedDeliveries,
    pendingDeliveriesArray,
    completedDeliveriesArray,
    pendingListLength: pendingList.length,
    completedListLength: completedList.length
  });

  return (
    <TooltipProvider>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Delivery Management</h1>
            <p className="text-muted-foreground">Manage order deliveries and COD payments</p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
                  queryClient.invalidateQueries({ queryKey: ['completedDeliveries'] });
                  queryClient.invalidateQueries({ queryKey: ['deliveryStats'] });
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh all delivery data</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                <p className="text-xs text-muted-foreground">All time deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingDeliveries}</div>
                <p className="text-xs text-muted-foreground">Awaiting delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">COD Collections</CardTitle>
                <Banknote className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.codCollectedAmount)}</div>
                <p className="text-xs text-muted-foreground">{stats.codPendingCollection} pending collections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.deliverySuccessRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Delivery success rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search deliveries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Person</Label>
                <Select value={selectedDeliveryPerson} onValueChange={setSelectedDeliveryPerson}>
                  <SelectTrigger>
                    <SelectValue placeholder="All delivery persons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All delivery persons</SelectItem>
                    {deliveryPersons?.data?.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {person.name} ({person.currentDeliveries} active)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                    <SelectItem value="Pokhara">Pokhara</SelectItem>
                    <SelectItem value="Chitwan">Chitwan</SelectItem>
                    <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                    <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFilter.fromDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={dateFilter.toDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Deliveries ({pendingList.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed Deliveries
            </TabsTrigger>
          </TabsList>

          {/* Pending Deliveries Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Deliveries - COD Orders Ready for Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading pending deliveries...</p>
                    </div>
                  </div>
                ) : pendingList.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No pending deliveries found</p>
                    <p className="text-sm text-gray-500">COD orders will appear here when ready for delivery</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Info</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Delivery Address</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(pendingList) && pendingList.length > 0 ? (
                          pendingList.map((delivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">Payment #{delivery.id}</div>
                                <div className="text-sm text-gray-500">Order #{delivery.orderId}</div>
                                <div className="text-xs text-gray-400">
                                  {formatDate(delivery.createdAt)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{delivery.userName}</div>
                                <div className="text-sm text-gray-500">ID: {delivery.userId}</div>
                                {delivery.order?.customerPhone && (
                                  <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {delivery.order.customerPhone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm">{delivery.order?.shippingAddress}</div>
                                    <div className="text-xs text-gray-500">{delivery.order?.shippingCity}</div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(delivery.paymentAmount)}</div>
                                <div className="text-xs text-gray-500">{delivery.currency}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {delivery.paymentMethodName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge 
                                  variant={getDeliveryStatusBadgeVariant(delivery.deliveryStatus || DeliveryStatus.PENDING)}
                                  className="flex items-center w-fit"
                                >
                                  {getDeliveryStatusIcon(delivery.deliveryStatus || DeliveryStatus.PENDING)}
                                  <span className="ml-1">{delivery.deliveryStatus || 'PENDING'}</span>
                                </Badge>
                                {delivery.codPaymentStatus && (
                                  <Badge 
                                    variant={getCODStatusBadgeVariant(delivery.codPaymentStatus)}
                                    className="flex items-center w-fit text-xs"
                                  >
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    COD: {delivery.codPaymentStatus}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {delivery.deliveryPersonName ? (
                                <div className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3 text-green-500" />
                                  <span className="text-sm">{delivery.deliveryPersonName}</span>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Unassigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setSelectedDelivery(delivery);
                                        setIsHistoryDialogOpen(true);
                                      }}
                                    >
                                      <History className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View delivery history</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setSelectedDelivery(delivery);
                                        setIsDeliveryDialogOpen(true);
                                      }}
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Mark as delivered</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setSelectedDelivery(delivery);
                                        setIsCODDialogOpen(true);
                                        setCollectedAmount(delivery.paymentAmount.toString());
                                      }}
                                    >
                                      <Banknote className="w-4 h-4 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Collect COD payment</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="text-muted-foreground">
                                {!Array.isArray(pendingList) ? (
                                  <>
                                    <div className="mb-2">⚠️ Error loading delivery data</div>
                                    <div className="text-sm">Data format issue. Please check console for details.</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="mb-2">📦 No pending deliveries</div>
                                    <div className="text-sm">All COD orders have been delivered or there are no pending orders.</div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Deliveries Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCompleted ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading completed deliveries...</p>
                    </div>
                  </div>
                ) : completedList.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No completed deliveries found</p>
                    <p className="text-sm text-gray-500">Completed deliveries will appear here</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Info</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Delivery Address</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>COD Status</TableHead>
                          <TableHead>Delivered By</TableHead>
                          <TableHead>Delivery Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(completedList) && completedList.length > 0 ? (
                          completedList.map((delivery) => (
                          <TableRow key={delivery.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">Payment #{delivery.id}</div>
                                <div className="text-sm text-gray-500">Order #{delivery.orderId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{delivery.userName}</div>
                                <div className="text-sm text-gray-500">ID: {delivery.userId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm">{delivery.order?.shippingAddress}</div>
                                    <div className="text-xs text-gray-500">{delivery.order?.shippingCity}</div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(delivery.paymentAmount)}</div>
                                {delivery.codCollectedAmount && (
                                  <div className="text-xs text-green-600">
                                    Collected: {formatCurrency(delivery.codCollectedAmount)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={getCODStatusBadgeVariant(delivery.codPaymentStatus || CODPaymentStatus.PENDING)}
                                className="flex items-center w-fit"
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                {delivery.codPaymentStatus || 'PENDING'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {delivery.deliveryPersonName ? (
                                <div className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3 text-green-500" />
                                  <span className="text-sm">{delivery.deliveryPersonName}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Unknown</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {delivery.deliveredAt ? (
                                <div className="text-sm">
                                  {formatDate(delivery.deliveredAt)}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setSelectedDelivery(delivery);
                                        setIsHistoryDialogOpen(true);
                                      }}
                                    >
                                      <History className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View delivery history</p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setSelectedDelivery(delivery);
                                        // Add view details functionality
                                      }}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="text-muted-foreground">
                                {!Array.isArray(completedList) ? (
                                  <>
                                    <div className="mb-2">⚠️ Error loading completed deliveries</div>
                                    <div className="text-sm">Data format issue. Please check console for details.</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="mb-2">📋 No completed deliveries</div>
                                    <div className="text-sm">No deliveries have been completed yet.</div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mark as Delivered Dialog */}
        <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Order as Delivered</DialogTitle>
              <DialogDescription>
                Confirm that payment request #{selectedDelivery?.id} has been delivered successfully.
                This will update the order status and generate billing items.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedDelivery && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedDelivery.paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedDelivery.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="font-medium">{selectedDelivery.paymentMethodName}</span>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="delivery-notes">Delivery Notes (Optional)</Label>
                <Textarea
                  id="delivery-notes"
                  placeholder="Add any delivery notes or comments..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAsDelivered}
                disabled={markDeliveredMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {markDeliveredMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* COD Payment Collection Dialog */}
        <Dialog open={isCODDialogOpen} onOpenChange={setIsCODDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Collect COD Payment</DialogTitle>
              <DialogDescription>
                Confirm that the cash payment for order #{selectedDelivery?.orderId} has been collected from the customer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedDelivery && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected Amount:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(selectedDelivery.paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedDelivery.userName}</span>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="collected-amount">Collected Amount</Label>
                <Input
                  id="collected-amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter collected amount"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cod-notes">Collection Notes (Optional)</Label>
                <Textarea
                  id="cod-notes"
                  placeholder="Add any notes about the payment collection..."
                  value={codNotes}
                  onChange={(e) => setCodNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCODDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCODCollection}
                disabled={collectCODMutation.isPending || !collectedAmount}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {collectCODMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Banknote className="h-4 w-4 mr-2" />
                    Confirm Collection
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delivery History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery History - Payment #{selectedDelivery?.id}</DialogTitle>
              <DialogDescription>
                Complete delivery timeline and status updates for this order
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedDelivery && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <div className="font-medium">{selectedDelivery.userName}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <div className="font-medium">{formatCurrency(selectedDelivery.paymentAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <div className="font-medium">{selectedDelivery.paymentMethodName}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <div className="font-medium">{formatDate(selectedDelivery.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-3">Delivery Timeline</h3>
                {deliveryHistory?.data && deliveryHistory.data.length > 0 ? (
                  <div className="space-y-3">
                    {deliveryHistory.data.map((entry, index) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            entry.status === DeliveryStatus.DELIVERED ? 'bg-green-500' :
                            entry.status === DeliveryStatus.OUT_FOR_DELIVERY ? 'bg-blue-500' :
                            entry.status === DeliveryStatus.FAILED_DELIVERY ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          {index < deliveryHistory.data.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            {getDeliveryStatusIcon(entry.status)}
                            <span className="font-medium">{entry.status.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                          </div>
                          {entry.deliveryPersonName && (
                            <div className="text-sm text-gray-600 mb-1">
                              By: {entry.deliveryPersonName}
                            </div>
                          )}
                          {entry.notes && (
                            <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No delivery history available</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default DeliveryManagement;
