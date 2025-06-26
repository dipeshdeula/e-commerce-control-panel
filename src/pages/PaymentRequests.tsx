
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export const PaymentRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    userId: '',
    orderId: '',
    paymentAmount: '',
    paymentMethodId: '',
    paymentStatus: 'pending',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentRequests, isLoading } = useQuery({
    queryKey: ['paymentRequests'],
    queryFn: () => apiService.getPaymentRequests(),
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => apiService.getPaymentMethods(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createPaymentRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Payment request created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating payment request', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiService.updatePaymentRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'Payment request updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating payment request', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deletePaymentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      toast({ title: 'Payment request deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting payment request', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      userId: '',
      orderId: '',
      paymentAmount: '',
      paymentMethodId: '',
      paymentStatus: 'pending',
    });
    setSelectedPaymentRequest(null);
  };

  const handleEdit = (paymentRequest: any) => {
    setSelectedPaymentRequest(paymentRequest);
    setFormData({
      userId: paymentRequest.userId?.toString() || '',
      orderId: paymentRequest.orderId?.toString() || '',
      paymentAmount: paymentRequest.paymentAmount?.toString() || '',
      paymentMethodId: paymentRequest.paymentMethodId?.toString() || '',
      paymentStatus: paymentRequest.paymentStatus || 'pending',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      userId: parseInt(formData.userId),
      orderId: parseInt(formData.orderId),
      paymentAmount: parseFloat(formData.paymentAmount),
      paymentMethodId: parseInt(formData.paymentMethodId),
    };

    if (selectedPaymentRequest) {
      updateMutation.mutate({ id: selectedPaymentRequest.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPaymentRequests = paymentRequests?.data?.filter((request: any) => {
    const matchesSearch = 
      request.id.toString().includes(searchTerm) ||
      request.orderId.toString().includes(searchTerm) ||
      request.userId.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || request.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payment Requests</h1>
          <p className="text-gray-600">Manage payment requests and transactions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Payment Request</DialogTitle>
                <DialogDescription>Add a new payment request</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    type="number"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethodId">Payment Method</Label>
                  <Select value={formData.paymentMethodId} onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods?.data?.map((method: any) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentStatus">Status</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Payment Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Requests List</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Search payment requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPaymentRequests.map((request: any) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono">#{request.id}</TableCell>
                  <TableCell>{request.userId}</TableCell>
                  <TableCell className="font-mono">#{request.orderId}</TableCell>
                  <TableCell>${request.paymentAmount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {paymentMethods?.data?.find((method: any) => method.id === request.paymentMethodId)?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.paymentStatus)}
                      <Badge className={getStatusColor(request.paymentStatus)}>
                        {request.paymentStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(request)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(request.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Payment Request</DialogTitle>
              <DialogDescription>Update payment request information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-userId">User ID</Label>
                <Input
                  id="edit-userId"
                  type="number"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-orderId">Order ID</Label>
                <Input
                  id="edit-orderId"
                  type="number"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentAmount">Payment Amount</Label>
                <Input
                  id="edit-paymentAmount"
                  type="number"
                  step="0.01"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentMethodId">Payment Method</Label>
                <Select value={formData.paymentMethodId} onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods?.data?.map((method: any) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentStatus">Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Payment Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
