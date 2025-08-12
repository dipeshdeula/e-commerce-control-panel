import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService as api } from '@/services/api';
import { ProductDTO, SubSubCategoryDTO } from '@/types/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  RefreshCw,
  Star,
  Package,
  RotateCcw,
  AlertTriangle,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api.config';

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [goToPage, setGoToPage] = useState('');
  const [openSubSubCategory, setOpenSubSubCategory] = useState(false);
  const [openEditSubSubCategory, setOpenEditSubSubCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    marketPrice: '',
    costPrice: '',
    discountPercentage: '',
    stockQuantity: '',
    sku: '',
    weight: '',
    dimensions: '',
    subSubCategoryId: ''
  });

  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products', currentPage, pageSize, searchTerm],
    queryFn: () => api.getAllProductsAdmin({ 
      page: currentPage, 
      size: pageSize,
      searchTerm: searchTerm || undefined
    }),
    placeholderData: (previousData) => previousData
  });

  // Fetch sub-sub-categories for dropdown
  const { data: subSubCategories, isLoading: subSubCategoriesLoading, error: subSubCategoriesError } = useQuery({
    queryKey: ['subSubCategories'],
    queryFn: () => api.getSubSubCategories({ page: 1, pageSize: 100 }),
    retry: 3,
    retryDelay: 1000
  });

  // Fetch subcategories to show parent hierarchy
  const { data: subCategories } = useQuery({
    queryKey: ['subcategories-all'],
    queryFn: () => api.getSubCategories({ page: 1, pageSize: 100 }),
  });

  // Fetch categories to show full hierarchy
  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => api.getCategories({ page: 1, pageSize: 100 }),
  });

  console.log("Products data:", products);
  console.log("SubSubCategories data:", subSubCategories);
  console.log("SubSubCategories loading:", subSubCategoriesLoading);
  console.log("SubSubCategories error:", subSubCategoriesError);
  console.log("SubSubCategories structure:", {
    fullResponse: subSubCategories,
    data: subSubCategories?.data,
    dataData: subSubCategories?.data?.data,
    isDataArray: Array.isArray(subSubCategories?.data),
    isDataDataArray: Array.isArray(subSubCategories?.data?.data)
  });

  // Handle different possible response structures for sub-subcategories
  const getSubSubCategoriesArray = () => {
    if (!subSubCategories) {
      console.log("No subSubCategories data");
      return [];
    }
    
    console.log("Processing subSubCategories structure:", subSubCategories);
    
    let allCategories = [];
    
    // Try different possible structures based on API responses
    if (Array.isArray(subSubCategories.data)) {
      console.log("Using subSubCategories.data as array, length:", subSubCategories.data.length);
      allCategories = subSubCategories.data;
    } else if (Array.isArray(subSubCategories.data?.data)) {
      console.log("Using subSubCategories.data.data as array, length:", subSubCategories.data.data.length);
      allCategories = subSubCategories.data.data;
    } else if (Array.isArray(subSubCategories)) {
      console.log("Using subSubCategories directly as array, length:", subSubCategories.length);
      allCategories = subSubCategories;
    } else {
      console.warn("Unexpected sub-subcategories structure, returning empty array:", subSubCategories);
      return [];
    }

    console.log("All categories before filtering:", allCategories);
    
    // Filter for active categories and add parent hierarchy info
    const activeCategories = allCategories.filter((cat: SubSubCategoryDTO) => {
      if (!cat || typeof cat !== 'object') {
        console.warn("Invalid category object:", cat);
        return false;
      }
      console.log("Category:", cat.name, "isActive:", cat.isActive);
      // Include all categories that have required fields
      return cat.subSubCategoryId && cat.name && cat.subCategoryId;
    }).map((cat: SubSubCategoryDTO) => {
      // Find parent subcategory
      const parentSubCategory = getSubCategoriesArray().find((sub: any) => 
        sub.subCategoryId === cat.subCategoryId || sub.id === cat.subCategoryId
      );
      
      // Find parent category
      const parentCategory = getCategoriesArray().find((category: any) => 
        category.categoryId === parentSubCategory?.categoryId || category.id === parentSubCategory?.categoryId
      );

      return {
        ...cat,
        parentSubCategoryName: parentSubCategory?.name || 'Unknown SubCategory',
        parentCategoryName: parentCategory?.name || 'Unknown Category',
        fullHierarchy: `${parentCategory?.name || 'Unknown'} > ${parentSubCategory?.name || 'Unknown'} > ${cat.name}`
      };
    });
    
    console.log("Active categories after filtering and hierarchy processing:", activeCategories);
    return activeCategories;
  };

  // Helper function to get subcategories array
  const getSubCategoriesArray = () => {
    if (!subCategories) return [];
    
    if (Array.isArray(subCategories.data)) {
      return subCategories.data;
    } else if (Array.isArray(subCategories.data?.data)) {
      return subCategories.data.data;
    } else if (Array.isArray(subCategories)) {
      return subCategories;
    }
    
    return [];
  };

  // Helper function to get categories array
  const getCategoriesArray = () => {
    if (!categories) return [];
    
    if (Array.isArray(categories.data)) {
      return categories.data;
    } else if (Array.isArray(categories.data?.data)) {
      return categories.data.data;
    } else if (Array.isArray(categories)) {
      return categories;
    }
    
    return [];
  };

  const subSubCategoriesArray = getSubSubCategoriesArray();
  console.log("Final subSubCategoriesArray:", subSubCategoriesArray);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      marketPrice: '',
      costPrice: '',
      discountPercentage: '',
      stockQuantity: '',
      sku: '',
      weight: '',
      dimensions: '',
      subSubCategoryId: ''
    });
    setOpenSubSubCategory(false);
    setOpenEditSubSubCategory(false);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { subSubCategoryId: number; productData: any }) => 
      api.createProduct(data.subSubCategoryId, data.productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create product",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditOpen(false);
      setSelectedProduct(null);
      resetForm();
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    }
  });

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: api.softDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  });

  // Restore mutation (undelete)
  const restoreMutation = useMutation({
    mutationFn: api.unDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product restored successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore product",
        variant: "destructive",
      });
    }
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: api.hardDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Success",
        description: "Product permanently deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to permanently delete product",
        variant: "destructive",
      });
    }
  });

  // Image upload mutation
  const uploadImagesMutation = useMutation({
    mutationFn: ({ id, images }: { id: number; images: File[] }) => 
      api.uploadProductImages(id.toString(), images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsImageUploadOpen(false);
      setSelectedImages([]);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload images",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      marketPrice: parseFloat(formData.marketPrice),
      costPrice: parseFloat(formData.costPrice),
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : 0,
      stockQuantity: parseInt(formData.stockQuantity),
      sku: formData.sku,
      weight: formData.weight,
      reviews: 0,
      rating: 0,
      dimensions: formData.dimensions,
    };

    

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: productData });
    } else {
      const subSubCategoryId = parseInt(formData.subSubCategoryId);
      if (!subSubCategoryId) {
        toast({
          title: "Error",
          description: "Please select a sub-subcategory",
          variant: "destructive",
        });
        return;
      }
      createMutation.mutate({ subSubCategoryId, productData });
    }
  };

  const handleEdit = (product: ProductDTO) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      marketPrice: product.marketPrice.toString(),
      costPrice: product.costPrice.toString(),
      discountPercentage: product.discountPercentage?.toString() || '',
      stockQuantity: product.stockQuantity.toString(),
      sku: product.sku,
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      subSubCategoryId: product.subSubCategoryId?.toString() || ''
    });
    setIsEditOpen(true);
  };

  const handleImageUpload = (product: ProductDTO) => {
    setSelectedProduct(product);
    setIsImageUploadOpen(true);
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && selectedImages.length > 0) {
      uploadImagesMutation.mutate({ 
        id: selectedProduct.id, 
        images: selectedImages 
      });
    }
  };

  const handleGoToPage = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = parseInt(goToPage);
      const totalPages = products?.data?.totalCount ? 
        Math.ceil(products.data.totalCount / pageSize) : 1;
      
      if (page >= 1 && (!products?.data?.totalCount || page <= totalPages)) {
        setCurrentPage(page);
        setGoToPage('');
      }
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate pagination info
  const totalItems = products?.data?.totalCount || 0;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const paginatedProducts = products?.data?.data || [];
  const hasMorePages = paginatedProducts.length === pageSize;

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>Add a new product to your inventory</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Enter SKU"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="subSubCategoryId">Sub-SubCategory</Label>
                      <Select value={formData.subSubCategoryId} onValueChange={(value)=>setFormData({...formData,subSubCategoryId:value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-subcategory" />
                      </SelectTrigger>
                        <SelectContent>
                          {subSubCategories?.data?.data?.map((subSubCategory : any) => (
                            <SelectItem
                              key={subSubCategory.id}
                              value={subSubCategory.id.toString()}
                            >
                              {subSubCategory.name}
                             
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                    </div>                    
                    
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="Enter weight (e.g., 1kg, 500g)"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="Enter dimensions (e.g., 10x5x2 cm)"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed product description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="marketPrice">Market Price</Label>
                      <Input
                        id="marketPrice"
                        type="number"
                        step="0.01"
                        value={formData.marketPrice}
                        onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="costPrice">Cost Price</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="discountPercentage">Discount %</Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        step="0.01"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Product'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm border-gray-200 focus:border-blue-400"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="pageSize" className="text-sm font-medium">Show:</Label>
          <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
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
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {totalItems > 0 
              ? `${totalItems} total products`
              : `${paginatedProducts.length} products on this page`
            }
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products
          </CardTitle>
          <CardDescription>
            Manage your product inventory<br/>
            <span className="text-sm text-gray-500">MP: Market Price<br />DP: Discount Price</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Id</TableHead>
                  <TableHead className="font-semibold">Image</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Rating</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} className={product.isDeleted ? 'opacity-60 bg-red-50' : ''}>
                   <TableCell>
                    <div>
                      <div className="font-medium">#{product.id}</div>                     
                    </div>
                  </TableCell>

                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={`${API_BASE_URL}/${product.images[0].imageUrl}`} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                   
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium">null</div>                      
                    </div>
                  </TableCell>


                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium"> MP: Rs.{product.marketPrice}</div>
                       <div className="text-smfont-medium text-gray-600"> CP: Rs.{product.costPrice}</div>
                      {product.discountPrice > 0 && (
                        <div className="text-sm font-medium text-green-600">DP: Rs.{product.discountPrice}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                      {product.stockQuantity} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating || 0}</span>
                      <span className="text-gray-400">({product.reviewCount || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isDeleted ? "destructive" : "default"}>
                      {product.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
                        {!product.isDeleted ? (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Product</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                  onClick={() => handleImageUpload(product)}
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload Images</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                                  onClick={() => softDeleteMutation.mutate(product.id)}
                                  disabled={softDeleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Move to Trash (Soft Delete)</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => restoreMutation.mutate(product.id)}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore Product</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(product.id)}
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
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {products?.data?.totalCount ? (
                  <>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} products
                  </>
                ) : (
                  <>
                    Showing {paginatedProducts.length} products on page {currentPage}
                    {hasMorePages ? ' (more pages available)' : ''}
                  </>
                )}
              </div>
              {(totalPages > 1 || hasMorePages) && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="goToPage" className="text-sm">Go to page:</Label>
                  <Input
                    id="goToPage"
                    type="number"
                    min="1"
                    max={products?.data?.totalCount ? totalPages : undefined}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={handleGoToPage}
                    placeholder={products?.data?.totalCount ? `1-${totalPages}` : 'Enter page'}
                    className="w-20 h-8 text-sm"
                  />
                </div>
              )}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(prev => prev - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {/* Simple pagination */}
                {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (products?.data?.totalCount) {
                        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                      } else {
                        if (hasMorePages) setCurrentPage(prev => prev + 1);
                      }
                    }}
                    className={
                      products?.data?.totalCount 
                        ? (currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')
                        : (!hasMorePages ? 'pointer-events-none opacity-50' : 'cursor-pointer')
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-subSubCategoryId">Sub-SubCategory</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['subSubCategories'] })}
                    disabled={subSubCategoriesLoading}
                  >
                    🔄 Refresh
                  </Button>
                </div>
                <Popover open={openEditSubSubCategory} onOpenChange={setOpenEditSubSubCategory}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openEditSubSubCategory}
                      className="w-full justify-between h-auto min-h-[40px] text-left"
                      disabled={subSubCategoriesLoading}
                    >
                      <div className="flex flex-col items-start">
                        {formData.subSubCategoryId
                          ? (() => {
                              const selectedCategory = subSubCategoriesArray.find((category) => 
                                category?.subSubCategoryId?.toString() === formData.subSubCategoryId
                              );
                              return selectedCategory ? (
                                <>
                                  <span className="font-medium">{selectedCategory.name}</span>
                                  <span className="text-xs text-gray-500">{selectedCategory.fullHierarchy}</span>
                                </>
                              ) : 'Unknown Category';
                            })()
                          : subSubCategoriesLoading 
                            ? "Loading categories..." 
                            : "Select sub-subcategory..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          {subSubCategoriesArray.filter(category => category && category.subSubCategoryId && category.name).map((category) => (
                            <CommandItem
                              key={category.subSubCategoryId}
                              value={`${category.name} ${category.fullHierarchy}`}
                              onSelect={() => {
                                setFormData({ ...formData, subSubCategoryId: category.subSubCategoryId.toString() });
                                setOpenEditSubSubCategory(false);
                              }}
                              className="flex flex-col items-start py-3"
                            >
                              <div className="flex items-center w-full">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    formData.subSubCategoryId === category.subSubCategoryId.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{category.name}</span>
                                  <span className="text-xs text-gray-500">{category.fullHierarchy}</span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  {subSubCategoriesArray.length > 0 ? 
                    `${subSubCategoriesArray.length} active categories available` : 
                    'Loading categories...'
                  }
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-weight">Weight</Label>
                <Input
                  id="edit-weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dimensions">Dimensions</Label>
                <Input
                  id="edit-dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-marketPrice">Market Price</Label>
                  <Input
                    id="edit-marketPrice"
                    type="number"
                    step="0.01"
                    value={formData.marketPrice}
                    onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-costPrice">Cost Price</Label>
                  <Input
                    id="edit-costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-discountPercentage">Discount %</Label>
                  <Input
                    id="edit-discountPercentage"
                    type="number"
                    step="0.01"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stockQuantity">Stock Quantity</Label>
                <Input
                  id="edit-stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent>
          <form onSubmit={handleImageSubmit}>
            <DialogHeader>
              <DialogTitle>Upload Product Images</DialogTitle>
              <DialogDescription>
                Upload images for {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="images">Select Images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                />
                {selectedImages.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedImages.length} image(s) selected
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={uploadImagesMutation.isPending || selectedImages.length === 0}
              >
                {uploadImagesMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;


