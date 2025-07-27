
import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FolderOpen, 
  RefreshCw,
  Upload,
  Eye,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

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

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['categories', currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => apiService.getCategories({ 
      page: currentPage, 
      pageSize: pageSize, 
      search: debouncedSearchTerm || undefined 
    }),
  });

  console.log("category data", categories);
  console.log("categories structure:", {
    fullResponse: categories,
    data: categories?.data,
    dataData: categories?.data?.data,
    totalCount: categories?.data?.totalCount,
    length: categories?.data?.data?.length
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'Category created successfully',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create category',
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => 
      apiService.updateCategory(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsEditOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'Category updated successfully',
        className: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update category',
        variant: 'destructive'
      });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ 
        title: 'Success', 
        description: 'Category moved to trash',
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ 
        title: 'Success', 
        description: 'Category permanently deleted',
        className: 'bg-red-50 border-red-200 text-red-800'
      });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ 
        title: 'Success', 
        description: 'Category restored successfully',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
    setImageFile(null);
    setSelectedCategory(null);
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent, isEdit: boolean = false) => {
    e.preventDefault();
    
    const submitFormData = new FormData();
    submitFormData.append('Name', formData.name);
    submitFormData.append('Slug', formData.slug);
    submitFormData.append('Description', formData.description);
    
    if (imageFile) {
      submitFormData.append('File', imageFile);
    }
    
    if (isEdit && selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, formData: submitFormData });
    } else {
      createMutation.mutate(submitFormData);
    }
  };

  const categories_data = categories?.data?.data || [];
  const totalItems = categories?.data?.totalCount || categories_data.length;
  
  // Calculate total pages - if we don't have totalCount, estimate based on current data
  const totalPages = categories?.data?.totalCount 
    ? Math.ceil(totalItems / pageSize)
    : categories_data.length === pageSize 
      ? currentPage + 1 // Assume there might be more pages
      : currentPage; // This is likely the last page

  // For display purposes when we don't have exact total
  const displayTotalItems = categories?.data?.totalCount || `${categories_data.length}+`;
  const hasMorePages = categories_data.length === pageSize;

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Handle go to page
  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(goToPage);
      if (pageNumber >= 1) {
        if (categories?.data?.totalCount) {
          // We have total count, validate against total pages
          if (pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setGoToPage('');
          } else {
            toast({
              title: 'Invalid Page',
              description: `Please enter a page number between 1 and ${totalPages}`,
              variant: 'destructive'
            });
          }
        } else {
          // No total count, allow navigation
          setCurrentPage(pageNumber);
          setGoToPage('');
        }
      } else {
        toast({
          title: 'Invalid Page',
          description: 'Please enter a valid page number (1 or greater)',
          variant: 'destructive'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories and organization</p>
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
              <Button 
                onClick={() => resetForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-500" />
                    Create New Category
                  </DialogTitle>
                  <DialogDescription>
                    Add a new category to organize your products better
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="category-slug"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your category"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">Category Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                    {createMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Category
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            Category Management
          </CardTitle>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
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
                  {categories?.data?.totalCount ? `${totalItems} total categories` : `${categories_data.length} categories on this page`}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Slug</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories_data.map((category: any) => (
                  <TableRow key={category.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          {category.imageUrl ? (
                            <img 
                              src={`${BASE_URL}/${category.imageUrl}`} 
                              alt={category.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <FolderOpen className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">ID: {category.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={category.description}>
                        {category.description || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium">{category.productCount || 0} products</span>
                        {category.productsOnSale > 0 && (
                          <Badge variant="secondary" className="w-fit text-xs bg-green-100 text-green-700">
                            {category.productsOnSale} on sale
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex justify-center space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Category Details</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Category</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(category.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Move to Trash (Soft Delete)</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => unDeleteMutation.mutate(category.id)}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore Category</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => hardDeleteMutation.mutate(category.id)}
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
                {categories_data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FolderOpen className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No categories found</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsCreateOpen(true)}
                        >
                          Create your first category
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {categories?.data?.totalCount ? (
                  <>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} categories
                  </>
                ) : (
                  <>
                    Showing {categories_data.length} categories on page {currentPage}
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
                    max={categories?.data?.totalCount ? totalPages : undefined}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={handleGoToPage}
                    placeholder={categories?.data?.totalCount ? `1-${totalPages}` : 'Enter page'}
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
                
                {/* Show page numbers - only if we have total count */}
                {categories?.data?.totalCount ? (
                  (() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Adjust start page if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // First page
                    if (startPage > 1) {
                      pages.push(
                        <PaginationItem key={1}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(1);
                            }}
                            isActive={currentPage === 1}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <PaginationItem key="start-ellipsis">
                            <span className="px-3 py-2">...</span>
                          </PaginationItem>
                        );
                      }
                    }

                    // Middle pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i);
                            }}
                            isActive={currentPage === i}
                            className="cursor-pointer"
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Last page
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <PaginationItem key="end-ellipsis">
                            <span className="px-3 py-2">...</span>
                          </PaginationItem>
                        );
                      }
                      pages.push(
                        <PaginationItem key={totalPages}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages);
                            }}
                            isActive={currentPage === totalPages}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    return pages;
                  })()
                ) : (
                  /* Simple pagination when no total count */
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      isActive={true}
                      className="cursor-default"
                    >
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (categories?.data?.totalCount) {
                        // We have total count, check against total pages
                        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                      } else {
                        // No total count, allow next if current page has full data
                        if (hasMorePages) setCurrentPage(prev => prev + 1);
                      }
                    }}
                    className={
                      categories?.data?.totalCount 
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
        <DialogContent className="sm:max-w-md">
          <form onSubmit={(e) => handleSubmit(e, true)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                Edit Category
              </DialogTitle>
              <DialogDescription>
                Update category information and settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
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
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Category Image</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {updateMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Category
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
