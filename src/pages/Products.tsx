
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
import { Plus, Edit, Trash2, Search, RotateCcw } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    marketPrice: '',
    costPrice: '',
    discountPrice: '',
    stockQuantity: '',
    sku: '',
    weight: '',
    dimensions: '',
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', currentPage, pageSize],
    queryFn: () => apiService.getProducts(currentPage, pageSize),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => apiService.getCategories(1, 100),
  });

  const { data: subCategories } = useQuery({
    queryKey: ['subcategories-all'],
    queryFn: () => apiService.getSubCategories(1, 100),
  });

  const { data: subSubCategories } = useQuery({
    queryKey: ['subsubcategories-all'],
    queryFn: () => apiService.getSubSubCategories(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Product created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating product', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiService.updateProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'Product updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product soft deleted successfully' });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product permanently deleted' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      marketPrice: '',
      costPrice: '',
      discountPrice: '',
      stockQuantity: '',
      sku: '',
      weight: '',
      dimensions: '',
      categoryId: '',
      subCategoryId: '',
      subSubCategoryId: '',
    });
    setSelectedProduct(null);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      marketPrice: product.marketPrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      discountPrice: product.discountPrice?.toString() || '',
      stockQuantity: product.stockQuantity?.toString() || '',
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      categoryId: product.categoryId?.toString() || '',
      subCategoryId: product.subCategoryId?.toString() || '',
      subSubCategoryId: product.subSubCategoryId?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      marketPrice: parseFloat(formData.marketPrice),
      costPrice: parseFloat(formData.costPrice),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      stockQuantity: parseInt(formData.stockQuantity),
      categoryId: parseInt(formData.categoryId),
      subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
      subSubCategoryId: formData.subSubCategoryId ? parseInt(formData.subSubCategoryId) : null,
    };

    if (selectedProduct) {
      updateMutation.mutate({ ...data, id: selectedProduct.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter subcategories based on selected category
  const filteredSubCategories = subCategories?.data?.filter((subCat: any) => 
    subCat.categoryId === parseInt(formData.categoryId)
  ) || [];

  // Filter sub-subcategories based on selected subcategory
  const filteredSubSubCategories = subSubCategories?.data?.filter((subSubCat: any) => 
    subSubCat.subCategoryId === parseInt(formData.subCategoryId)
  ) || [];

  const filteredProducts = products?.data?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountPrice">Discount Price</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value, subCategoryId: '', subSubCategoryId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.data?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.categoryId && (
                  <div className="grid gap-2">
                    <Label htmlFor="subCategoryId">SubCategory</Label>
                    <Select 
                      value={formData.subCategoryId} 
                      onValueChange={(value) => setFormData({ ...formData, subCategoryId: value, subSubCategoryId: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubCategories.map((subCategory: any) => (
                          <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.subCategoryId && (
                  <div className="grid gap-2">
                    <Label htmlFor="subSubCategoryId">SubSubCategory</Label>
                    <Select 
                      value={formData.subSubCategoryId} 
                      onValueChange={(value) => setFormData({ ...formData, subSubCategoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubSubCategories.map((subSubCategory: any) => (
                          <SelectItem key={subSubCategory.id} value={subSubCategory.id.toString()}>
                            {subSubCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search products..."
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
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">Rs. {product.marketPrice}</div>
                      {product.discountPrice && (
                        <div className="text-sm text-green-600">Sale: Rs. {product.discountPrice}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                      {product.stockQuantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories?.data?.find((cat: any) => cat.id === product.categoryId)?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isInStock ? "default" : "secondary"}>
                      {product.isInStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => softDeleteMutation.mutate(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <Label htmlFor="edit-discountPrice">Discount Price</Label>
                  <Input
                    id="edit-discountPrice"
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-categoryId">Category</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value, subCategoryId: '', subSubCategoryId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.data?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
    </div>
  );
};
