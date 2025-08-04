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

// SubSubCategories component with full pagination and CRUD functionality
export const SubSubCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    subCategoryId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goToPage, setGoToPage] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subSubCategories, isLoading } = useQuery({
    queryKey: ['subsubcategories', currentPage, pageSize],
    queryFn: () => apiService.getSubSubCategories({ page: currentPage, pageSize: pageSize }),
  });

  console.log('SubSubCategories data:', subSubCategories);

  const { data: subCategories } = useQuery({
    queryKey: ['subcategories-all'],
    queryFn: () => apiService.getSubCategories({ page: 1, pageSize: 100 }),
  });

  console.log('SubCategories data:', subCategories);
  console.log('subcategories structure:', {
    fullResponse: subCategories,
    data: subCategories?.data,
    length: subCategories?.data?.length
  });

  const createMutation = useMutation({
    mutationFn: ({ subCategoryId, name, slug, description, imageFile }: { 
      subCategoryId: number; 
      name: string; 
      slug: string; 
      description: string; 
      imageFile?: File 
    }) => apiService.createSubSubCategory(subCategoryId, name, slug, description, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsubcategories'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'SubSubCategory created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating subsubcategory', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, slug, description, imageFile }: { 
      id: number; 
      name: string; 
      slug: string; 
      description: string; 
      imageFile?: File 
    }) => apiService.updateSubSubCategory(id, name, slug, description, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsubcategories'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'SubSubCategory updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating subsubcategory', description: error.message, variant: 'destructive' });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteSubSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsubcategories'] });
      toast({ title: 'SubSubCategory soft deleted successfully' });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteSubSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsubcategories'] });
      toast({ title: 'SubSubCategory permanently deleted' });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteSubSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsubcategories'] });
      toast({ 
        title: 'SubSubCategory restored successfully',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error restoring subsubcategory', 
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
      subCategoryId: '',
    });
    setSelectedFile(null);
    setSelectedSubSubCategory(null);
  };

  const handleEdit = (subSubCategory: any) => {
    setSelectedSubSubCategory(subSubCategory);
    setFormData({
      name: subSubCategory.name,
      slug: subSubCategory.slug,
      description: subSubCategory.description,
      subCategoryId: subSubCategory.subCategoryId?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubSubCategory) {
      updateMutation.mutate({
        id: selectedSubSubCategory.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageFile: selectedFile || undefined
      });
    } else {
      createMutation.mutate({
        subCategoryId: parseInt(formData.subCategoryId),
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageFile: selectedFile || undefined
      });
    }
  };

  // Handle different possible response structures
  const getSubSubCategoriesArray = () => {
    if (!subSubCategories) return [];
    
    console.log("Debug - subSubCategories structure:", {
      fullResponse: subSubCategories,
      data: subSubCategories?.data,
      dataData: subSubCategories?.data?.data,
      isDataArray: Array.isArray(subSubCategories?.data),
      isDataDataArray: Array.isArray(subSubCategories?.data?.data)
    });
    
    // Try different possible structures based on API responses
    if (Array.isArray(subSubCategories.data)) {
      console.log("Using subSubCategories.data");
      return subSubCategories.data;
    } else if (Array.isArray(subSubCategories.data?.data)) {
      console.log("Using subSubCategories.data.data");
      return subSubCategories.data.data;
    } else if (Array.isArray(subSubCategories)) {
      console.log("Using subSubCategories directly");
      return subSubCategories;
    }
    
    console.warn("Unexpected subsubcategories structure, returning empty array:", subSubCategories);
    return [];
  };

  const subSubCategoriesArray = getSubSubCategoriesArray();
  const activeCount = subSubCategoriesArray.filter((sub: any) => !sub.isDeleted).length;
  const deletedCount = subSubCategoriesArray.filter((sub: any) => sub.isDeleted).length;

  const filteredSubSubCategories = subSubCategoriesArray.filter((subSubCategory: any) =>
    subSubCategory.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = subSubCategories?.data?.totalCount || filteredSubSubCategories.length;
  const totalPages = subSubCategories?.data?.totalCount 
    ? Math.ceil(totalItems / pageSize)
    : filteredSubSubCategories.length === pageSize 
      ? currentPage + 1 
      : currentPage;
  
  const hasMorePages = filteredSubSubCategories.length === pageSize;

  // Paginate the filtered results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSubSubCategories = filteredSubSubCategories.slice(startIndex, endIndex);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(goToPage);
      if (pageNumber && pageNumber > 0) {
        if (subSubCategories?.data?.totalCount) {
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
          <h1 className="text-2xl font-semibold text-gray-900">SubSubCategories</h1>
          <p className="text-gray-600">Manage your product sub-subcategories</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add SubSubCategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New SubSubCategory</DialogTitle>
                <DialogDescription>Add a new sub-subcategory to your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subCategoryId">Parent SubCategory</Label>
                  <Select value={formData.subCategoryId} onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories?.data?.data?.map((subCategory: any) => (
                        <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                          {subCategory.name}
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
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {createMutation.isPending ? 'Creating...' : 'Create SubSubCategory'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SubSubCategory List</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Search sub-subcategories..."
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
                  {subSubCategoriesArray.length} Total
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
                <TableHead>Parent SubCategory</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubSubCategories.map((subSubCategory: any) => (
                <TableRow key={subSubCategory.id} className={subSubCategory.isDeleted ? 'opacity-60 bg-red-50' : ''}>
                  <TableCell>
                    {subSubCategory.imageUrl ? (
                      <img
                        src={subSubCategory.imageUrl.startsWith('http') ? subSubCategory.imageUrl : `${BASE_URL}/${subSubCategory.imageUrl}`}
                        alt={subSubCategory.name}
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
                      <span>{subSubCategory.name}</span>
                      {subSubCategory.isDeleted && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{subSubCategory.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subCategories?.data?.data?.find((sub: any) => sub.id === subSubCategory.subCategoryId)?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{subSubCategory.description}</TableCell>
                  <TableCell>
                    <Badge variant={subSubCategory.isDeleted ? 'destructive' : 'default'}>
                      {subSubCategory.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View SubSubCategory Details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleEdit(subSubCategory)}
                              disabled={subSubCategory.isDeleted}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{subSubCategory.isDeleted ? 'Cannot edit deleted item' : 'Edit SubSubCategory'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {!subSubCategory.isDeleted ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(subSubCategory.id)}
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
                                onClick={() => unDeleteMutation.mutate(subSubCategory.id)}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore SubSubCategory</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => hardDeleteMutation.mutate(subSubCategory.id)}
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
                {subSubCategories?.data?.totalCount ? (
                  <>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} sub-subcategories
                  </>
                ) : (
                  <>
                    Showing {paginatedSubSubCategories.length} sub-subcategories on page {currentPage}
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
                    max={subSubCategories?.data?.totalCount ? totalPages : undefined}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyDown={handleGoToPage}
                    placeholder={subSubCategories?.data?.totalCount ? `1-${totalPages}` : 'Enter page'}
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
                {subSubCategories?.data?.totalCount ? (
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
                      if (subSubCategories?.data?.totalCount) {
                        // We have total count, check against total pages
                        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                      } else {
                        // No total count, allow next if current page has full data
                        if (hasMorePages) setCurrentPage(prev => prev + 1);
                      }
                    }}
                    className={
                      subSubCategories?.data?.totalCount 
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
              <DialogTitle>Edit SubSubCategory</DialogTitle>
              <DialogDescription>Update sub-subcategory information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-subCategoryId">Parent SubCategory</Label>
                <Select value={formData.subCategoryId} onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories?.data?.data?.map((subCategory: any) => (
                      <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                        {subCategory.name}
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
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
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
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update SubSubCategory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
