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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, RotateCcw, Image as ImageIcon, AlertTriangle, Eye } from 'lucide-react';
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
import { useSubCategoryValidation } from '@/hooks/use-subcategory-validation';

export const SubCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {errors,isValid} = useSubCategoryValidation(
    {...formData,file:selectedFile}, isCreateOpen
  );

    const [touched,setTouched] = useState<{[key:string]:boolean}>({
      name:false,
      slug:false,
      description:false,
      file:false
    });

  const { data: subCategories, isLoading } = useQuery({
    queryKey: ['subcategories', currentPage, pageSize],
    queryFn: () => apiService.getSubCategories({ page: currentPage, pageSize: pageSize }),
  });

  console.log("subCategories data:", subCategories);

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => apiService.getCategories({ page: 1, pageSize: 100 }),
  });

  console.log("subcategories data", subCategories);
  console.log("subcategories structure:", {
    fullResponse: subCategories,
    data: subCategories?.data,
    length: subCategories?.data?.length
  });

  const createMutation = useMutation({
    mutationFn: ({ categoryId, name, slug, description, imageFile }: { 
      categoryId: number; 
      name: string; 
      slug: string; 
      description: string; 
      imageFile?: File 
    }) => apiService.createSubCategory(categoryId, name, slug, description, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'SubCategory created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating subcategory', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, slug, description, imageFile }: { 
      id: number; 
      name: string; 
      slug: string; 
      description: string; 
      imageFile?: File 
    }) => apiService.updateSubCategory(id, name, slug, description, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'SubCategory updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating subcategory', description: error.message, variant: 'destructive' });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast({ title: 'SubCategory soft deleted successfully' });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast({ title: 'SubCategory permanently deleted' });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      toast({ 
        title: 'SubCategory restored successfully',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error restoring subcategory', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      categoryId: '',
    });
    setSelectedFile(null);
    setSelectedSubCategory(null);
  };

  const handleEdit = (subCategory: any) => {
    setSelectedSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description,
      categoryId: subCategory.categoryId?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
    name: true,
    slug: true,
    description: true,
    categoryId: true,
    file: true,
  });
  if (!isValid) {
    toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
    return;
  }
    
    if (selectedSubCategory) {
      updateMutation.mutate({
        id: selectedSubCategory.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageFile: selectedFile || undefined
      });
    } else {
      createMutation.mutate({
        categoryId: parseInt(formData.categoryId),
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageFile: selectedFile || undefined
      });
    }
  };

  // Handle different possible response structures
  const getSubCategoriesArray = () => {
    if (!subCategories) return [];
    
    console.log("Debug - subCategories structure:", {
      fullResponse: subCategories,
      data: subCategories?.data,
      dataData: subCategories?.data?.data,
      isDataArray: Array.isArray(subCategories?.data),
      isDataDataArray: Array.isArray(subCategories?.data?.data)
    });
    
    // Try different possible structures based on API responses
    if (Array.isArray(subCategories.data)) {
      console.log("Using subCategories.data");
      return subCategories.data;
    } else if (Array.isArray(subCategories.data?.data)) {
      console.log("Using subCategories.data.data");
      return subCategories.data.data;
    } else if (Array.isArray(subCategories)) {
      console.log("Using subCategories directly");
      return subCategories;
    }
    
    console.warn("Unexpected subcategories structure, returning empty array:", subCategories);
    return [];
  };

  const subCategoriesArray = getSubCategoriesArray();
  const activeCount = subCategoriesArray.filter((sub: any) => !sub.isDeleted).length;
  const deletedCount = subCategoriesArray.filter((sub: any) => sub.isDeleted).length;

  const filteredSubCategories = subCategoriesArray.filter((subCategory: any) =>
    subCategory.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = subCategories?.data?.totalCount || filteredSubCategories.length;
  const totalPages = subCategories?.data?.totalCount 
    ? Math.ceil(totalItems / pageSize)
    : filteredSubCategories.length === pageSize 
      ? currentPage + 1 
      : currentPage;
  
  const hasMorePages = filteredSubCategories.length === pageSize;

  // Paginate the filtered results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSubCategories = filteredSubCategories.slice(startIndex, endIndex);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(goToPage);
      if (pageNumber && pageNumber > 0) {
        if (subCategories?.data?.totalCount) {
          // We have total count, validate against total pages
          if (pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setGoToPage('');
          }
        } else {
          // No total count, allow any positive number
          setCurrentPage(pageNumber);
          setGoToPage('');
        }
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SubCategories</h1>
          <p className="text-gray-600">Manage your product subcategories</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add SubCategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New SubCategory</DialogTitle>
                <DialogDescription>Add a new subcategory to your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Parent Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.data?.data?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={()=> setTouched({...touched,name:true})}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    onBlur={()=> setTouched({...touched,slug:true})}
                  />
                  {touched.slug && errors.slug && (
                    <p className="text-red-500 text-sm">{errors.slug}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onBlur={()=> setTouched({...touched,description:true})}
                  />
                  {touched.description && errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    onBlur={()=> setTouched({...touched,file:true})}
                  />
                  {touched.file && errors.file && (
                    <p className="text-red-500 text-sm">{errors.file}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!isValid || createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create SubCategory'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SubCategory List</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Search subcategories..."
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
                  {subCategoriesArray.length} Total
                </Badge>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubCategories.map((subCategory: any) => (
                <TableRow key={subCategory.id} className={subCategory.isDeleted ? 'opacity-60 bg-red-50' : ''}>
                  <TableCell>
                    {subCategory.imageUrl ? (
                      <img
                        src={subCategory.imageUrl.startsWith('http') ? subCategory.imageUrl : `${BASE_URL}/${subCategory.imageUrl}`}
                        alt={subCategory.name}
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
                      <span>{subCategory.name}</span>
                      {subCategory.isDeleted && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{subCategory.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories?.data?.data?.find((cat: any) => cat.id === subCategory.categoryId)?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{subCategory.description}</TableCell>
                  <TableCell>
                    <Badge variant={subCategory.isDeleted ? 'destructive' : 'default'}>
                      {subCategory.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex space-x-1">
                        {/* <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View SubCategory Details</p>
                          </TooltipContent>
                        </Tooltip> */}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleEdit(subCategory)}
                              disabled={subCategory.isDeleted}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{subCategory.isDeleted ? 'Cannot edit deleted item' : 'Edit SubCategory'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {!subCategory.isDeleted ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(subCategory.id)}
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
                                onClick={() => unDeleteMutation.mutate(subCategory.id)}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore SubCategory</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(subCategory.id)}
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
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {subCategories?.data?.totalCount ? (
                  <>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} subcategories
                  </>
                ) : (
                  <>
                    Showing {paginatedSubCategories.length} subcategories on page {currentPage}
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
                    max={subCategories?.data?.totalCount ? totalPages : undefined}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={handleGoToPage}
                    placeholder={subCategories?.data?.totalCount ? `1-${totalPages}` : 'Enter page'}
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
                {subCategories?.data?.totalCount ? (
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
                      if (subCategories?.data?.totalCount) {
                        // We have total count, check against total pages
                        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                      } else {
                        // No total count, allow next if current page has full data
                        if (hasMorePages) setCurrentPage(prev => prev + 1);
                      }
                    }}
                    className={
                      subCategories?.data?.totalCount 
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
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit SubCategory</DialogTitle>
              <DialogDescription>Update subcategory information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-categoryId">Parent Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.data?.data?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={() => setTouched({ ...touched, name: true })}
                />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  onBlur={() => setTouched({ ...touched, slug: true })}
                  
                />
                {touched.slug && errors.slug && (
                  <p className="text-red-500 text-sm">{errors.slug}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={() => setTouched({ ...touched, description: true })}
                />
                {touched.description && errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  onBlur={() => setTouched({ ...touched, file: true })}
                />
                {touched.file && errors.file && (
                  <p className="text-red-500 text-sm">{errors.file}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update SubCategory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
