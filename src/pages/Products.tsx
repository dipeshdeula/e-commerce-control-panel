import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService as api, BASE_URL } from '@/services/api';
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
  ChevronsUpDown,
  Image as ImageIcon,
  FolderOpen
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
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  
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
    categoryId:'',
    subCategoryId:'',
    subSubCategoryId: ''

  });

  const [includeDeleted, setIncludeDeleted] = useState('all');
  const [onSaleOnly, setOnSaleOnly] = useState('all');
  const [prioritizeEventProducts, setPrioritizeEventProducts] = useState('all');
  const [subCategoriesForCategory, setSubCategoriesForCategory] = useState([]);
  const [subSubCategoriesForSubCategory, setSubSubCategoriesForSubCategory] = useState([]);

  const queryClient = useQueryClient();

  // Fetch products using ProductService and correct param names
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['products', currentPage, pageSize, searchTerm, includeDeleted, onSaleOnly, prioritizeEventProducts],
    queryFn: async () => {
      // Match backend param names (PageNumber, PageSize, etc)
      const params: any = {
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchTerm || undefined,
        includeDeleted: includeDeleted !== 'all' ? includeDeleted === 'true' : undefined,
        onSaleOnly: onSaleOnly !== 'all' ? onSaleOnly === 'true' : undefined,
        prioritizeEventProducts: prioritizeEventProducts !== 'all' ? prioritizeEventProducts === 'true' : undefined,
      };
      // Remove undefined params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      // Use ProductService
      const result = await api.getProducts(params);
      // Defensive: result.data may be undefined/null
      if (!result || !result.data) {
        console.warn('No products data returned:', result);
        return { data: [], pagination: result?.pagination || {} };
      }
      return result;
    }
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

  console.log("Products data:", productsData);
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
      categoryId: '',
      subCategoryId: '',
      subSubCategoryId: ''
    });
    setOpenSubSubCategory(false);
    setOpenEditSubSubCategory(false);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {productData: any,categoryId:number,subCategoryId:number, subSubCategoryId: number;  }) => 
      api.createProduct(data.productData, data.categoryId, data.subCategoryId, data.subSubCategoryId),
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
      marketPrice: parseFloat(formData.marketPrice) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      sku: formData.sku,
      weight: formData.weight,
      reviews: 0,
      rating: 0,
      dimensions: formData.dimensions,
    };          

    const categoryId = Number(formData.categoryId) || 0;
  const subCategoryId = formData.subCategoryId && Number(formData.subCategoryId) > 0
    ? Number(formData.subCategoryId)
    : undefined;
  const subSubCategoryId = formData.subSubCategoryId && Number(formData.subSubCategoryId) > 0
    ? Number(formData.subSubCategoryId)
    : undefined;

  if (!categoryId) {
    toast({
      title: "Error",
      description: "Please select a category",
      variant: "destructive",
    });
    return;
  }

  if (selectedProduct) {
    updateMutation.mutate({ id: selectedProduct.id, data: productData });
  } else {
    createMutation.mutate({ categoryId, subCategoryId, subSubCategoryId, productData });
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
      categoryId: product.categoryId?.toString() || '',
      subCategoryId: product.subCategoryId?.toString() || '',
      subSubCategoryId: product.subSubCategoryId?.toString() || ''
    });
      if (product.categoryId) {
    fetch(`${API_BASE_URL}/category/getAllSubCategoryByCategoryId?categoryId=${product.categoryId}&pageNumber=1&pageSize=100`)
      .then(res => res.json())
      .then(result => {
        const subCats = Array.isArray(result?.data?.subCategories) ? result.data.subCategories : [];
        setSubCategoriesForCategory(subCats || []);
      });
  }
  if (product.subCategoryId) {
    fetch(`${API_BASE_URL}/category/getAllSubSubCategoryBySubCategoryId?subCategoryId=${product.subCategoryId}&pageNumber=1&pageSize=100`)
      .then(res => res.json())
      .then(result => {
        const subSubCats = Array.isArray(result?.data?.subSubCategories) ? result.data.subSubCategories : [];
        setSubSubCategoriesForSubCategory(subSubCats || []);
      });
  }
    setIsEditOpen(true);
  };

  const handleImageUpload = async (product: ProductDTO) => {
    setSelectedProduct(product);
    setIsImageUploadOpen(true);

    try{
      const res = await api.getProductImages(product.id);
      setPreviewImages(res.data || []);
    }catch{
      setPreviewImages([]);
    }
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
      const totalPages = productsData?.pagination?.totalPages || 1;
      
      if (page >= 1 && (!productsData?.pagination?.totalCount || page <= totalPages)) {
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
  const pagedList = Array.isArray(productsData?.data?.data) ? productsData.data.data : [];
  const totalCount = productsData?.pagination?.totalCount || 0;
  const totalPages = productsData?.pagination?.totalPages || 1;
  const hasNextPage = productsData?.pagination?.hasNextPage || false;
  const hasPreviousPage = productsData?.pagination?.hasPreviousPage || false;

  console.log("Paged list:", pagedList);

  useEffect(() => {
    if (formData.categoryId) {
      // Fetch subcategories for selected category
      fetch(`${API_BASE_URL}/category/getAllSubCategoryByCategoryId?categoryId=${formData.categoryId}&pageNumber=1&pageSize=100`)
        .then(res => res.json())
        .then(result => {
          const subCats = Array.isArray(result?.data?.subCategories) ? result.data.subCategories: [];
          setSubCategoriesForCategory(subCats || []);
        });
     
    } else {
      setSubCategoriesForCategory([]);    
    }
  }, [formData.categoryId]);

  useEffect(()=>{
    if(formData.subCategoryId)
    {
      fetch(`${API_BASE_URL}/category/getAllSubSubCategoryBySubCategoryId?subCategoryId=${formData.subCategoryId}&pageNumber=1&pageSize=100`)
      .then(res=>res.json())
      .then(result=>{
        const subSubCats = Array.isArray(result?.data?.subSubCategories) ? result.data.subSubCategories : [];
        setSubSubCategoriesForSubCategory(subSubCats || []);

      })
    }
  }, [formData.subCategoryId]);

  console.log("Fetch SubSubCategory data by categoryId ",`${API_BASE_URL}/category/getAllSubCategoryByCategoryId?categoryId=${formData.categoryId}&pageNumber=1&pageSize=100`);
  console.log("Fetch SubSubCategory data by subCategoryId ",`${API_BASE_URL}/category/getAllSubSubCategoryBySubCategoryId?subCategoryId=${formData.subCategoryId}&pageNumber=1&pageSize=100`);


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
                  <div className="grid grid-cols-3 gap-4">
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
                      <Label htmlFor="categoryId">Category</Label>
                      <Select value={formData.categoryId} onValueChange={value => {
                        setFormData({ ...formData, categoryId: value, subCategoryId: '', subSubCategoryId: '' });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(categories?.data?.data)
                            ? categories.data.data.map((cat: any) => (
                                <SelectItem key={cat.id || cat.categoryId} value={(cat.id || cat.categoryId).toString()}>
                                  {cat.name} (ID: {cat.id || cat.categoryId})
                                </SelectItem>
                              ))
                            : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subCategoryId">SubCategory</Label>
                      <Select value={formData.subCategoryId} onValueChange={value => setFormData({ ...formData, subCategoryId: value, subSubCategoryId: '' })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategoriesForCategory.map((sub: any) => (
                            <SelectItem key={sub.id || sub.subCategoryId} value={(sub.id || sub.subCategoryId).toString()}>
                              {sub.name} (ID: {sub.id || sub.subCategoryId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subSubCategoryId">Sub-SubCategory</Label>
                      <Select value={formData.subSubCategoryId} onValueChange={value => setFormData({ ...formData, subSubCategoryId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subSubCategoriesForSubCategory.map((subsub: any) => (
                            <SelectItem key={subsub.id || subsub.subSubCategoryId} value={(subsub.id || subsub.subSubCategoryId).toString()}>
                              {subsub.name} (ID: {subsub.id || subsub.subSubCategoryId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Enter weight (e.g., 1kg, 500g)"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        placeholder="Enter dimensions (e.g., 10x5x2 cm)"
                      />
                    </div>
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
            {totalCount > 0 
              ? `${totalCount} total products`
              : `${pagedList.length} products on this page`
            }
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <div className="flex flex-wrap gap-4 items-center mt-2 rounded-lg p-4 shadow-sm">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="w-64 border-blue-200 focus:border-blue-500 shadow-sm"
            />
            <span className="font-medium text-gray-700">Show:</span>
            <Select value={pageSize.toString()} onValueChange={v => handlePageSizeChange(Number(v))}>
              <SelectTrigger className="w-16 border-blue-200 focus:border-blue-500">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50, 100].map(size => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-medium text-gray-700">Include Deleted:</span>
            <Select value={includeDeleted} onValueChange={setIncludeDeleted}>
              <SelectTrigger className="w-20 border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <span className="font-medium text-gray-700">On Sale Only:</span>
            <Select value={onSaleOnly} onValueChange={setOnSaleOnly}>
              <SelectTrigger className="w-20 border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <span className="font-medium text-gray-700">Prioritize Event:</span>
            <Select value={prioritizeEventProducts} onValueChange={setPrioritizeEventProducts}>
              <SelectTrigger className="w-20 border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-2">
              {totalCount > 0 
                ? `${totalCount} total products`
                : `${pagedList.length} products on this page`
              }
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((product: any) => {                
                    const isActive = product.statusBadge === 'ACTIVE' || product.isActive;
                    const isOnSale = product.isOnSale;
                    const isInStock = product.isInStock;
                    return (
                      <TableRow key={product.id} className="hover:bg-blue-50 transition-all">
                        
                        <TableCell>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              {Array.isArray(product.images) && product.images.length > 0 && product.images[0].imageUrl ? (
                                <img
                                src={`${BASE_URL}/${product.images[0].imageUrl}`}
                                alt={product.images[0].altText || product.name}
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              <FolderOpen className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{product.name || product.ProductName}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                       
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Maket Price: {product.formattedMarketPrice || product.marketPrice}</span>
                          <span className="text-xs text-gray-500">Cost Price: Rs.{product.costPrice}</span>
                          <span className="text-xs text-gray-500">Discount Price: Rs.{product.discountPrice}</span>
                          <span className="text-xs text-gray-500">Discount Percentage: {product.discountPercentage} %</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Stock Qty: {product.stockQuantity ?? product.stock ?? '-'}</span>
                          <span className="text-xs text-gray-500">Available Qty: {product.availableStock ?? '-'}</span>
                          <span className="text-xs text-gray-500">Reserved Qty: {product.reservedStock ?? '-'}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {isOnSale && (
                          <Badge className="ml-1 bg-yellow-100 text-yellow-700">On Sale</Badge>
                        )}
                        {isInStock && (
                          <Badge className="ml-1 bg-blue-100 text-blue-700">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>{product.pricing?.activeEventName || product.activeEventName || '-'}</TableCell>
                      <TableCell className="flex gap-2">
                        <TooltipProvider>
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="mr-1" onClick={() => handleImageUpload(product)}>
                                <ImageIcon className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Upload Images</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="mr-1" onClick={() => handleEdit(product)}><Edit className="w-4 h-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="mr-1" onClick={() => softDeleteMutation.mutate(product.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Soft Delete</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="mr-1" onClick={() => restoreMutation.mutate(product.id)} disabled={!product.isDeleted}><RotateCcw className="w-4 h-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Restore</TooltipContent>
                          </Tooltip>                         
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagedList.length ? ((currentPage - 1) * pageSize + 1) : 0}</span> to{' '}
              <span className="font-medium">{pagedList.length ? ((currentPage - 1) * pageSize + pagedList.length) : 0}</span> of{' '}
              <span className="font-medium">{totalCount}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={goToPage}
                onChange={e => setGoToPage(e.target.value)}
                className="w-16 h-8 text-center"
                placeholder={`${currentPage}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const page = Number(goToPage);
                  if (page >= 1 && page <= totalPages) setCurrentPage(page);
                }}
                disabled={!goToPage || Number(goToPage) < 1 || Number(goToPage) > totalPages}
              >Go</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>{currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
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
               <div className="grid grid-cols-3 gap-29 items-center justify-between">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-categoryId">Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={value => {
                          setFormData({ ...formData, categoryId: value, subCategoryId: '', subSubCategoryId: '' });
                          // Fetch subcategories for new category
                          fetch(`${API_BASE_URL}/category/getAllSubCategoryByCategoryId?categoryId=${value}&pageNumber=1&pageSize=100`)
                            .then(res => res.json())
                            .then(result => {
                              const subCats = Array.isArray(result?.data?.subCategories) ? result.data.subCategories : [];
                              setSubCategoriesForCategory(subCats || []);
                            });
                          setSubSubCategoriesForSubCategory([]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(categories?.data?.data)
                            ? categories.data.data.map((cat: any) => (
                                <SelectItem key={cat.id || cat.categoryId} value={(cat.id || cat.categoryId).toString()}>
                                  {cat.name} (ID: {cat.id || cat.categoryId})
                                </SelectItem>
                              ))
                            : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-subCategoryId">SubCategory</Label>
                      <Select
                        value={formData.subCategoryId}
                        onValueChange={value => {
                          setFormData({ ...formData, subCategoryId: value, subSubCategoryId: '' });
                          // Fetch subsubcategories for new subcategory
                          fetch(`${API_BASE_URL}/category/getAllSubSubCategoryBySubCategoryId?subCategoryId=${value}&pageNumber=1&pageSize=100`)
                            .then(res => res.json())
                            .then(result => {
                              const subSubCats = Array.isArray(result?.data?.subSubCategories) ? result.data.subSubCategories : [];
                              setSubSubCategoriesForSubCategory(subSubCats || []);
                            });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategoriesForCategory.map((sub: any) => (
                            <SelectItem key={sub.id || sub.subCategoryId} value={(sub.id || sub.subCategoryId).toString()}>
                              {sub.name} (ID: {sub.id || sub.subCategoryId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 ml-15">
                      <Label htmlFor="edit-subSubCategoryId">Sub-SubCategory</Label>
                      <Select
                        value={formData.subSubCategoryId}
                        onValueChange={value => setFormData({ ...formData, subSubCategoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subSubCategoriesForSubCategory.map((subsub: any) => (
                            <SelectItem key={subsub.id || subsub.subSubCategoryId} value={(subsub.id || subsub.subSubCategoryId).toString()}>
                              {subsub.name} (ID: {subsub.id || subsub.subSubCategoryId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
             {/* --- Preview Existing Images --- */}
              {previewImages.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {previewImages.map(img => (
                    <div key={img.imageUrl} className="flex flex-col items-center">
                      <img
                        src={`${API_BASE_URL}/${img.imageUrl}`}
                        alt={img.altText || 'Product image'}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <span className="text-xs mt-1">{img.altText}</span>
                    </div>
                  ))}
                </div>
              )}
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


