import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Store, Package, Eye, Search, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export const ProductStores: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isViewProductsOpen, setIsViewProductsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    storeId: '',
    productId: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState('');

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

  // Fetch stores with their products
  const { data: storesWithProducts, isLoading, refetch: refetchStoresWithProducts } = useQuery({
    queryKey: ['storesWithProducts', currentPage, pageSize],
    queryFn: async () => {
      const storesResponse = await apiService.getStores({ page: 1, pageSize: 1000 });
      
      // Handle different possible structures for stores data
      let stores_data = [];
      if (storesResponse?.data?.data && Array.isArray(storesResponse.data.data)) {
        stores_data = storesResponse.data.data;
      } else if (storesResponse?.data && Array.isArray(storesResponse.data)) {
        stores_data = storesResponse.data;
      }

      // Fetch products for each store
      const storesWithProductsData = await Promise.all(
        stores_data.map(async (store: any) => {
          try {
            const productsResponse = await apiService.getProductsByStoreId(store.id || store.storeId, { page: 1, pageSize: 100 });
            
            // Handle different possible structures for products data
            let products_data = [];
            if (productsResponse?.data && Array.isArray(productsResponse.data)) {
              const storeData = productsResponse.data.find((item: any) => item.store && item.products);
              if (storeData && storeData.products && Array.isArray(storeData.products)) {
                products_data = storeData.products;
              }
            }
            
            return {
              store,
              products: products_data,
              productCount: products_data.length
            };
          } catch (error) {
            console.error(`Error fetching products for store ${store.id || store.storeId}:`, error);
            return {
              store,
              products: [],
              productCount: 0
            };
          }
        })
      );

      return storesWithProductsData;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiService.getProducts({ page: 1, pageSize: 1000 }),
  });

  const { data: storeProducts, isLoading: isLoadingStoreProducts } = useQuery({
    queryKey: ['storeProducts', selectedStore?.id],
    queryFn: () => selectedStore ? apiService.getProductsByStoreId(selectedStore.id, { page: 1, pageSize: 100 }) : null,
    enabled: !!selectedStore,
  });

  // Mutation for creating product store association
  const createProductStoreMutation = useMutation({
    mutationFn: ({ storeId, productId }: { storeId: number, productId: number }) =>
      apiService.createProductStore(storeId, productId),
    onSuccess: (_, variables) => {
      // Optimistically update the cache instead of refetching
      queryClient.setQueryData(['storesWithProducts', currentPage, pageSize], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((item: any) => {
          const store = item.store;
          const storeId = store.id || store.storeId;
          
          // If this is the store we just added a product to
          if (storeId.toString() === variables.storeId.toString()) {
            return {
              ...item,
              productCount: item.productCount + 1
            };
          }
          return item;
        });
      });
      
      // Invalidate queries to ensure data consistency in the background
      queryClient.invalidateQueries({ queryKey: ['storesWithProducts'] });
      queryClient.invalidateQueries({ queryKey: ['storeProducts'] });
      
      setIsCreateOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'Product store association created successfully' 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create product store association', 
        variant: 'destructive' 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      storeId: '',
      productId: '',
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.storeId && formData.productId) {
      // Check if the product is already associated with the store
      const selectedStoreData = storesWithProducts?.find((item: any) => 
        (item.store.id || item.store.storeId).toString() === formData.storeId
      );
      
      if (selectedStoreData) {
        const isProductAlreadyAssociated = selectedStoreData.products.some((product: any) => 
          product.id.toString() === formData.productId
        );
        
        if (isProductAlreadyAssociated) {
          toast({
            title: 'Product Already Associated',
            description: 'This product is already available in the selected store.',
            variant: 'destructive'
          });
          return;
        }
      }
      
      createProductStoreMutation.mutate({
        storeId: parseInt(formData.storeId),
        productId: parseInt(formData.productId)
      });
    }
  };

  const handleViewProducts = (store: any) => {
    setSelectedStore(store);
    setIsViewProductsOpen(true);
  };

  // Data processing - handle both possible response structures
  console.log('StoresWithProducts API Response:', storesWithProducts); // Debug log
  console.log('StoreProducts API Response:', storeProducts); // Debug log
  
  // Process the stores with products data
  const storesWithProductsData = storesWithProducts || [];
  
  const totalItems = storesWithProductsData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const filteredStoresWithProducts = storesWithProductsData.filter((item: any) => {
    const storeName = item.store?.name?.toLowerCase() || '';
    const ownerName = item.store?.ownerName?.toLowerCase() || '';
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return storeName.includes(searchLower) || ownerName.includes(searchLower);
  });

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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Store Products</h1>
            <p className="text-gray-600">View products available in each store</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} disabled={createProductStoreMutation.isPending}>
                {createProductStoreMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Association
                  </>
                )}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Store Products Overview</CardTitle>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  {totalItems} stores
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
            <div className="flex items-center space-x-2 mt-4">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {createProductStoreMutation.isPending && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700">Creating association...</span>
                </div>
              </div>
            )}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Products Count</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStoresWithProducts.map((item: any) => {
                    const store = item.store;
                    const productCount = item.productCount;
                    
                    return (
                      <TableRow key={store.id || store.storeId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                              <Store className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{store.name || 'Unknown Store'}</div>
                              <div className="text-sm text-gray-500">ID: {store.id || store.storeId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{store.ownerName || 'Unknown Owner'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="font-medium">
                              {productCount} {productCount === 1 ? 'Product' : 'Products'}
                            </Badge>
                          </div>
                        </TableCell>
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
                                  onClick={() => handleViewProducts(store)}
                                  className="hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View all products in this store</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

        {/* View Store Products Dialog */}
        <Dialog open={isViewProductsOpen} onOpenChange={setIsViewProductsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Products in {selectedStore?.name}</DialogTitle>
              <DialogDescription>
                All products available in this store
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {isLoadingStoreProducts ? (
                <div className="flex justify-center py-8">Loading products...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Handle different possible data structures for store products
                      let productsData = [];
                      
                      console.log('Store Products Raw Data:', storeProducts); // Debug log
                      
                      if (storeProducts?.data && Array.isArray(storeProducts.data)) {
                        // API returns array with store and products structure
                        const storeData = storeProducts.data.find((item: any) => item.store && item.products);
                        if (storeData && storeData.products && Array.isArray(storeData.products)) {
                          productsData = storeData.products;
                        }
                      } else if (storeProducts?.data?.data && Array.isArray(storeProducts.data.data)) {
                        // Nested structure
                        const storeData = storeProducts.data.data.find((item: any) => item.store && item.products);
                        if (storeData && storeData.products && Array.isArray(storeData.products)) {
                          productsData = storeData.products;
                        }
                      } else if (storeProducts?.data?.[0]?.products && Array.isArray(storeProducts.data[0].products)) {
                        // Fallback to original structure
                        productsData = storeProducts.data[0].products;
                      }
                      
                      console.log('Processed Products Data:', productsData); // Debug log
                      
                      return productsData.length > 0 ? productsData.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">{product.name || 'Unknown Product'}</div>
                                <div className="text-sm text-gray-500">{product.sku || 'N/A'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">Rs. {product.marketPrice || 0}</div>
                            {product.discountPrice && product.discountPrice !== product.marketPrice && (
                              <div className="text-sm text-green-600">
                                Sale: Rs. {product.discountPrice}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{product.stockQuantity || 0}</div>
                            <div className="text-sm text-gray-500">{product.stockStatus || 'Unknown'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={!product.isDeleted ? "default" : "secondary"}>
                              {!product.isDeleted ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No products found in this store
                          </TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Product Store Association Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Create Product Store Association</DialogTitle>
                <DialogDescription>
                  Associate a product with a specific store
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="store">Store</Label>
                  <Select 
                    value={formData.storeId} 
                    onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {storesWithProducts?.map((item: any) => {
                        const store = item.store;
                        return (
                          <SelectItem key={store.id || store.storeId} value={(store.id || store.storeId).toString()}>
                            {store.name || 'Unknown Store'} - {store.ownerName || 'Unknown Owner'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select 
                    value={formData.productId} 
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        // Handle different possible structures for products data
                        let productsData = [];
                        if (products?.data?.data && Array.isArray(products.data.data)) {
                          productsData = products.data.data;
                        } else if (products?.data && Array.isArray(products.data)) {
                          productsData = products.data;
                        }
                        
                        return productsData.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - Rs. {product.marketPrice || 0}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProductStoreMutation.isPending || !formData.storeId || !formData.productId}>
                  {createProductStoreMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Association'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
