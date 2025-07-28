
import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Store, RotateCcw, AlertTriangle, MapPin, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { NEPAL_PROVINCES, NEPAL_CITIES, getCitiesByProvince, searchCities, searchProvinces } from '@/constants/nepal-locations';

export const Stores: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isProductStoreOpen, setIsProductStoreOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
  });

  const [addressFormData, setAddressFormData] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
  });

  const [productStoreFormData, setProductStoreFormData] = useState({
    storeId: 0,
    productId: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize]);

  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ['stores', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => apiService.getStores({ page: currentPage, pageSize: pageSize }),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiService.getProducts({ page: 1, pageSize: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: ({ name, ownerName, imageFile }: {
      name: string,
      ownerName: string,
      imageFile?: File
    }) => apiService.createStore(name, ownerName, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Store created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating store', description: error.message, variant: 'destructive' })
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, ownerName, imageFile }: {
      id: number,
      name: string,
      ownerName: string,
      imageFile?: File
    }) => apiService.updateStore(id, name, ownerName, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'Store updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating store', description: error.message, variant: 'destructive' });
    }
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({ title: 'Store soft-deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error soft-deleting store', description: error.message, variant: 'destructive' })
    }
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({ title: 'Store restored successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error restoring store', description: error.message, variant: 'destructive' })
    }
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({ title: 'Store permanently deleted successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error hard deleting store', description: error.message, variant: 'destructive' })
    }
  });

  const addAddressMutation = useMutation({
    mutationFn: ({ storeId, addressData }: { storeId: number, addressData: typeof addressFormData }) =>
      apiService.addStoreAddress(storeId, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsAddressOpen(false);
      resetAddressForm();
      toast({ title: 'Store address added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding store address', description: error.message, variant: 'destructive' });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ storeId, addressData }: { storeId: number, addressData: typeof addressFormData }) =>
      apiService.updateStoreAddress(storeId, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsAddressOpen(false);
      resetAddressForm();
      toast({ title: 'Store address updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating store address', description: error.message, variant: 'destructive' });
    }
  });

  const createProductStoreMutation = useMutation({
    mutationFn: ({ storeId, productId }: { storeId: number, productId: number }) =>
      apiService.createProductStore(storeId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsProductStoreOpen(false);
      resetProductStoreForm();
      toast({ title: 'Product associated with store successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error associating product with store', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      ownerName: '',
    });
    setSelectedFile(null);
    setSelectedStore(null);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      street: '',
      city: '',
      province: '',
      postalCode: '',
      latitude: 0,
      longitude: 0,
    });
    setSelectedStore(null);
  };

  const resetProductStoreForm = () => {
    setProductStoreFormData({
      storeId: 0,
      productId: 0,
    });
  };

  const handleEdit = (store: any) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      ownerName: store.ownerName,
    });
    setIsEditOpen(true);
  };

  const handleAddressEdit = (store: any) => {
    setSelectedStore(store);
    if (store.address) {
      setAddressFormData({
        street: store.address.street || '',
        city: store.address.city || '',
        province: store.address.province || '',
        postalCode: store.address.postalCode || '',
        latitude: store.address.latitude || 0,
        longitude: store.address.longitude || 0,
      });
    } else {
      resetAddressForm();
    }
    setIsAddressOpen(true);
  };

  const handleProductStore = (store: any) => {
    setSelectedStore(store);
    setProductStoreFormData({
      storeId: store.id,
      productId: 0,
    });
    setIsProductStoreOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStore) {
      updateMutation.mutate({
         id: selectedStore.id,
         name: formData.name,
         ownerName: formData.ownerName,
         imageFile: selectedFile || undefined
        });
    } else {
      createMutation.mutate({
        name: formData.name,
        ownerName: formData.ownerName,
        imageFile: selectedFile || undefined
      });
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStore) {
      if (selectedStore.address) {
        updateAddressMutation.mutate({
          storeId: selectedStore.id,
          addressData: addressFormData
        });
      } else {
        addAddressMutation.mutate({
          storeId: selectedStore.id,
          addressData: addressFormData
        });
      }
    }
  };

  const handleProductStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createProductStoreMutation.mutate({
      storeId: productStoreFormData.storeId,
      productId: productStoreFormData.productId
    });
  };

  // Get filtered stores
  const stores_data = stores?.data?.data || [];
  const totalItems = stores?.data?.totalCount || stores_data.length;
  const totalPages = stores?.data?.totalCount 
    ? Math.ceil(stores.data.totalCount / pageSize) 
    : Math.ceil(stores_data.length / pageSize);

  const filteredStores = stores_data.filter((store: any) =>
    store.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    store.ownerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const displayTotalItems = stores?.data?.totalCount || `${stores_data.length}+`;

  // Pagination helpers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage('');
    }
  };

  // Location search helpers
  const filteredProvinces = searchProvinces(provinceSearch);
  const filteredCities = addressFormData.province 
    ? getCitiesByProvince(addressFormData.province).filter(city => 
        city.label.toLowerCase().includes(citySearch.toLowerCase())
      )
    : searchCities(citySearch);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stores</h1>
          <p className="text-gray-600">Manage stores on your platform</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Store</DialogTitle>
                <DialogDescription>Add a new store to your platform</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter store address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"                    
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Store'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store List</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store: any) => (
                <TableRow key={store.storeId}>
                  <TableCell>
                    <img
                      src={store.imageUrl || '/placeholder.png'}
                      alt={store.name}
                      className="w-10 h-10 rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-gray-500">ID: {store.storeId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{store.ownerName}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{store.address}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={store.isActive ? "default" : "secondary"}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(store)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit store</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {store.isActive ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => softDeleteMutation.mutate(store.storeId)}
                              className="hover:bg-orange-50 hover:border-orange-300"
                              disabled={softDeleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Soft delete store</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unDeleteMutation.mutate(store.storeId)}
                              className="hover:bg-green-50 hover:border-green-300"
                              disabled={unDeleteMutation.isPending}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Restore store</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => hardDeleteMutation.mutate(store.storeId)}
                            className="hover:bg-red-50 hover:border-red-300"
                            disabled={hardDeleteMutation.isPending}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hard delete store (permanent)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Store</DialogTitle>
              <DialogDescription>Update store information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Store Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ownerName">Owner Name</Label>
                <Input
                  id="edit-ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter store address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedStore?.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={selectedStore.imageUrl}
                      alt="Current store image"
                      className="w-20 h-20 rounded object-cover"
                    />
                    <p className="text-sm text-gray-500 mt-1">Current image</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Store'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};
