import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Role } from '@/types/api';
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
import { Plus, Edit, Trash2, Search, RotateCcw, Upload } from 'lucide-react';

interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  roleId: string;
  phone?: string;
  address?: string;
}

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [tempRegistrationData, setTempRegistrationData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UserFormValues>({
    name: '',
    email: '',
    password: '',
    roleId: '',
    phone: '',
    address: '',
  });
  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', currentPage, pageSize],
    queryFn: () => apiService.getUsers(currentPage, pageSize),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.register(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const responseData = response.data;
        if (responseData.requiresOTP || responseData.requiresVerification) {
          setTempRegistrationData(responseData.data);
          setOtpData({ ...otpData, email: responseData.data.email });
          setIsCreateOpen(false);
          setIsOtpOpen(true);
          toast({ 
            title: 'Registration initiated', 
            description: responseData.message || 'Please verify OTP to complete registration'
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setIsCreateOpen(false);
          resetForm();
          toast({ title: 'User created successfully' });
        }
      }
    },
    onError: (error) => {
      toast({ title: 'Error creating user', description: error.message, variant: 'destructive' });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => apiService.verifyOtp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOtpOpen(false);
      resetForm();
      toast({ title: 'User verified and created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error verifying OTP', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) => 
      apiService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: 'User updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ userId, formData }: { userId: number; formData: FormData }) => 
      apiService.uploadUserImage(userId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User image uploaded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error uploading image', description: error.message, variant: 'destructive' });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User soft deleted successfully' });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User permanently deleted' });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User restored successfully' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      roleId: '',
      phone: '',
      address: '',
    });
    setImageFile(null);
    setSelectedUser(null);
    setTempRegistrationData(null);
    setOtpData({ email: '', otp: '' });
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.roleId?.toString() || '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      roleId: parseInt(formData.roleId),
    };

    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.userId, userData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate(otpData);
  };

  const handleImageUpload = (userId: number) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      uploadImageMutation.mutate({ userId, formData });
      setImageFile(null);
    }
  };

  const filteredUsers = users?.data?.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your user accounts</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the system</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="roleId">Role</Label>
                  <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">SuperAdmin</SelectItem>
                      <SelectItem value="2">Admin</SelectItem>
                      <SelectItem value="3">Vendor</SelectItem>
                      <SelectItem value="4">DeliveryBoy</SelectItem>
                      <SelectItem value="5">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search users..."
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role || 'User'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => softDeleteMutation.mutate(user.userId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unDeleteMutation.mutate(user.userId)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id={`image-${user.userId}`}
                        />
                        <Label htmlFor={`image-${user.userId}`} className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="w-4 h-4" />
                            </span>
                          </Button>
                        </Label>
                        {imageFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImageUpload(user.userId)}
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent>
          <form onSubmit={handleOtpSubmit}>
            <DialogHeader>
              <DialogTitle>Verify OTP</DialogTitle>
              <DialogDescription>Enter the OTP sent to the user's email</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  value={otpData.otp}
                  onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-roleId">Role</Label>
                <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">SuperAdmin</SelectItem>
                    <SelectItem value="2">Admin</SelectItem>
                    <SelectItem value="3">Vendor</SelectItem>
                    <SelectItem value="4">DeliveryBoy</SelectItem>
                    <SelectItem value="5">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
