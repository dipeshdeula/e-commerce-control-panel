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

  // Mutations
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

  // Form reset functions
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

  // Event handlers
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

  // Data processing
  const stores_data = stores?.data || [];
  const totalItems = stores?.message ? stores_data.length : 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const filteredStores = stores_data.filter((store: any) =>
    store.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    store.ownerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const displayTotalItems = `${totalItems}`;

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
            <h1 className="text-2xl font-semibold text-gray-900">Store Management</h1>
            <p className="text-gray-600">Manage stores and their locations on your platform</p>
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
                    <Label htmlFor="image">Store Image</Label>
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
            <div className="flex items-center justify-between">
              <CardTitle>Stores</CardTitle>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  {displayTotalItems} total stores
                </Badge>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="pageSize" className="text-sm font-medium">
                    Show:
                  </Label>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
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
                    <TableRow key={store.id}>
                      <TableCell>
                        <img
                          src={store.imageUrl || '/placeholder.svg'}
                          alt={store.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <Store className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{store.name}</div>
                            <div className="text-sm text-gray-500">ID: {store.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{store.ownerName}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {store.address ? (
                            <div className="text-sm">
                              <div className="font-medium">{store.address.city}, {store.address.province}</div>
                              <div className="text-gray-500 truncate">{store.address.street}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No address</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={!store.isDeleted ? "default" : "secondary"}>
                          {!store.isDeleted ? 'Active' : 'Inactive'}
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
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddressEdit(store)}
                                className="hover:bg-purple-50 hover:border-purple-300"
                              >
                                <MapPin className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{store.address ? 'Update address' : 'Add address'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleProductStore(store)}
                                className="hover:bg-yellow-50 hover:border-yellow-300"
                              >
                                <Package className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Associate products</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {!store.isDeleted ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => softDeleteMutation.mutate(store.id)}
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
                                  onClick={() => unDeleteMutation.mutate(store.id)}
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
                                onClick={() => hardDeleteMutation.mutate(store.id)}
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

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
                  {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    placeholder={`1-${totalPages}`}
                    className="w-20 text-center"
                  />
                  <Button onClick={handleGoToPage} variant="outline" size="sm">
                    Go
                  </Button>
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Store Dialog */}
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
                  <Label htmlFor="edit-image">Store Image</Label>
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

        {/* Address Management Dialog */}
        <Dialog open={isAddressOpen} onOpenChange={setIsAddressOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleAddressSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {selectedStore?.address ? 'Update Store Address' : 'Add Store Address'}
                </DialogTitle>
                <DialogDescription>
                  Manage the address for {selectedStore?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={addressFormData.street}
                    onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="province">Province</Label>
                  <Select 
                    value={addressFormData.province} 
                    onValueChange={(value) => setAddressFormData({ ...addressFormData, province: value, city: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEPAL_PROVINCES.map(province => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Select 
                    value={addressFormData.city} 
                    onValueChange={(value) => setAddressFormData({ ...addressFormData, city: value })}
                    disabled={!addressFormData.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map(city => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={addressFormData.postalCode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                    placeholder="Enter postal code"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={addressFormData.latitude}
                      onChange={(e) => setAddressFormData({ ...addressFormData, latitude: parseFloat(e.target.value) || 0 })}
                      placeholder="27.7172"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={addressFormData.longitude}
                      onChange={(e) => setAddressFormData({ ...addressFormData, longitude: parseFloat(e.target.value) || 0 })}
                      placeholder="85.3240"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addAddressMutation.isPending || updateAddressMutation.isPending}>
                  {(addAddressMutation.isPending || updateAddressMutation.isPending) 
                    ? 'Saving...' 
                    : selectedStore?.address ? 'Update Address' : 'Add Address'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Product Store Association Dialog */}
        <Dialog open={isProductStoreOpen} onOpenChange={setIsProductStoreOpen}>
          <DialogContent>
            <form onSubmit={handleProductStoreSubmit}>
              <DialogHeader>
                <DialogTitle>Associate Product with Store</DialogTitle>
                <DialogDescription>
                  Add products to {selectedStore?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select 
                    value={productStoreFormData.productId.toString()} 
                    onValueChange={(value) => setProductStoreFormData({ ...productStoreFormData, productId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.data?.data?.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - Rs. {product.marketPrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProductStoreMutation.isPending}>
                  {createProductStoreMutation.isPending ? 'Associating...' : 'Associate Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
