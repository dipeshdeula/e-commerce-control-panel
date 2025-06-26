
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, RotateCcw, Image as ImageIcon } from 'lucide-react';

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
  const [pageSize] = useState(10);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subSubCategories, isLoading } = useQuery({
    queryKey: ['subsubcategories', currentPage, pageSize],
    queryFn: () => apiService.getSubSubCategories(currentPage, pageSize),
  });

  const { data: subCategories } = useQuery({
    queryKey: ['subcategories-all'],
    queryFn: () => apiService.getSubCategories(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.createSubSubCategory(formData),
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
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => 
      apiService.updateSubSubCategory(id, formData),
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
      toast({ title: 'SubSubCategory restored successfully' });
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
    const submitFormData = new FormData();
    submitFormData.append('Name', formData.name);
    submitFormData.append('Slug', formData.slug);
    submitFormData.append('Description', formData.description);
    submitFormData.append('SubCategoryId', formData.subCategoryId);
    
    if (selectedFile) {
      submitFormData.append('File', selectedFile);
    }

    if (selectedSubSubCategory) {
      updateMutation.mutate({ id: selectedSubSubCategory.id, formData: submitFormData });
    } else {
      createMutation.mutate(submitFormData);
    }
  };

  const filteredSubSubCategories = subSubCategories?.data?.filter((subSubCategory: any) =>
    subSubCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                      {subCategories?.data?.map((subCategory: any) => (
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
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search sub-subcategories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubSubCategories.map((subSubCategory: any) => (
                <TableRow key={subSubCategory.id}>
                  <TableCell>
                    {subSubCategory.imageUrl ? (
                      <img
                        src={`${apiService.BASE_URL}/${subSubCategory.imageUrl}`}
                        alt={subSubCategory.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{subSubCategory.name}</TableCell>
                  <TableCell>{subSubCategory.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subCategories?.data?.find((subCat: any) => subCat.id === subSubCategory.subCategoryId)?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{subSubCategory.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(subSubCategory)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => softDeleteMutation.mutate(subSubCategory.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unDeleteMutation.mutate(subSubCategory.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
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
                    {subCategories?.data?.map((subCategory: any) => (
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
