import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, BASE_URL } from '@/services/api';
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
import { Plus, Edit, Trash2, Search, RotateCcw, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PaymentMethodType } from '@/types/api';

export const PaymentMethods: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: PaymentMethodType.DigitalPayments,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment methods
  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const response = await apiService.getAllPaymentMethods();
      console.log("Payment methods response:", response);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment methods');
      }
      return response;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async ({ name, type, file }: { name: string; type: PaymentMethodType; file?: File }) => {
      const response = await apiService.createPaymentMethod({ name, type, file });
      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment method');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Payment method created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating payment method', description: error.message, variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, name, type, file }: { id: number; name?: string; type?: PaymentMethodType; file?: File }) => {
      const response = await apiService.updatePaymentMethod(id, { name, type, file });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update payment method');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'Payment method updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating payment method', description: error.message, variant: 'destructive' });
    }
  });

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.softDeletePaymentMethod(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete payment method');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: 'Payment method moved to trash' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting payment method', description: error.message, variant: 'destructive' });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.hardDeletePaymentMethod(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to permanently delete payment method');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: 'Payment method permanently deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error permanently deleting payment method', description: error.message, variant: 'destructive' });
    },
  });

  // Restore mutation
  const unDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.unDeletePaymentMethod(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to restore payment method');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: 'Payment method restored successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error restoring payment method', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: PaymentMethodType.DigitalPayments,
    });
    setSelectedFile(null);
    setSelectedPaymentMethod(null);
  };

  const handleEdit = (paymentMethod: any) => {
    setFormData({
      name: paymentMethod.name,
      type: paymentMethod.type,
    });
    setSelectedPaymentMethod(paymentMethod);
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPaymentMethod) {
      updateMutation.mutate({
        id: selectedPaymentMethod.id,
        name: formData.name,
        type: formData.type,
        file: selectedFile || undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        type: formData.type,
        file: selectedFile || undefined,
      });
    }
  };

  const getPaymentMethodsArray = () => {
    if (!paymentMethods?.data?.data) return [];
    
    // Handle different possible response structures
    if (Array.isArray(paymentMethods.data.data)) {
      return paymentMethods.data.data;
    }

    console.log("Unexpected payment methods structure:", paymentMethods.data.data);
    
    return [];
  };

  const paymentMethodsArray = getPaymentMethodsArray();
  const activeCount = paymentMethodsArray.filter((pm: any) => !pm.isDeleted).length;
  const deletedCount = paymentMethodsArray.filter((pm: any) => pm.isDeleted).length;

  console.log("payment method array",paymentMethodsArray);
  const filteredPaymentMethods = paymentMethodsArray.filter((paymentMethod: any) =>
    paymentMethod.providerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Filtered payment methods:", filteredPaymentMethods);

  const getPaymentTypeLabel = (type: number) => {
    switch (type) {
      case PaymentMethodType.DigitalPayments: return 'Digital Payments';
      case PaymentMethodType.COD: return 'Cash on Delivery';
      default: return 'Unknown';
    }
  };

  const getPaymentTypeColor = (type: number) => {
    switch (type) {
      case PaymentMethodType.DigitalPayments: return 'bg-green-100 text-green-700';      
      case PaymentMethodType.COD: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

 

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600">Manage payment methods for your store</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Payment Method</DialogTitle>
                  <DialogDescription>Add a new payment method to your store</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.type.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) as PaymentMethodType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentMethodType.DigitalPayments.toString()}>Digital Payments</SelectItem>
                        <SelectItem value={PaymentMethodType.COD.toString()}>Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Payment Method'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method List</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search payment methods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    {activeCount} Active
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {deletedCount} Deleted
                  </Badge>
                  <Badge variant="outline">
                    {paymentMethodsArray.length} Total
                  </Badge>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaymentMethods.map((paymentMethod: any) => (
                  <TableRow key={paymentMethod.id} className={paymentMethod.isDeleted ? 'opacity-60 bg-red-50' : ''}>
                    <TableCell>
                      {paymentMethod.logo ? (
                        <img
                          src={paymentMethod.logo.startsWith('http') ? paymentMethod.logo : `${BASE_URL}/${paymentMethod.logo}`}
                          alt={paymentMethod.providerName}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{paymentMethod.providerName}</span>
                        {paymentMethod.isDeleted && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPaymentTypeColor(paymentMethod.type)}>
                        {getPaymentTypeLabel(paymentMethod.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentMethod.isDeleted ? 'destructive' : 'default'}>
                        {paymentMethod.isDeleted ? 'Deleted' : 'Active'}
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
                              onClick={() => handleEdit(paymentMethod)}
                              disabled={paymentMethod.isDeleted}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{paymentMethod.isDeleted ? 'Cannot edit deleted item' : 'Edit Payment Method'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {!paymentMethod.isDeleted ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(paymentMethod.id)}
                                disabled={softDeleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{softDeleteMutation.isPending ? 'Deleting...' : 'Move to Trash (Soft Delete)'}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => unDeleteMutation.mutate(paymentMethod.id)}
                                disabled={unDeleteMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{unDeleteMutation.isPending ? 'Restoring...' : 'Restore Payment Method'}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(paymentMethod.id)}
                              disabled={hardDeleteMutation.isPending}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{hardDeleteMutation.isPending ? 'Permanently deleting...' : 'Permanently Delete'}</p>
                          </TooltipContent>
                        </Tooltip>
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
                <DialogTitle>Edit Payment Method</DialogTitle>
                <DialogDescription>Update payment method information</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select 
                    value={formData.type.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) as PaymentMethodType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethodType.DigitalPayments.toString()}>Digital Payments</SelectItem>
                      <SelectItem value={PaymentMethodType.COD.toString()}>Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-logo">Logo</Label>
                  <Input
                    id="edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Payment Method'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
