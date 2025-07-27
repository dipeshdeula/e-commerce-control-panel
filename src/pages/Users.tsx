import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Role, getRoleDisplayInfo, getRoleNameFromId } from '@/types/api';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RotateCcw, 
  Users as UsersIcon, 
  Eye,
  EyeOff,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  UserX,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api.config';

interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  contact: string;  // Changed from phone to contact
}

interface User {
  id?: number;        // API returns 'id'
  userId?: number;    // Keep for backward compatibility
  name: string;
  email: string;
  roleId: number;
  role?: string;
  phone?: string;
  contact?: string;   // API returns 'contact' instead of 'phone'
  address?: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  imageUrl?: string;
}

export const Users: React.FC = () => {
  console.log('Users component rendering...');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempRegistrationData, setTempRegistrationData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormValues>({
    name: '',
    email: '',
    password: '',
    contact: '',
  });
  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with improved error handling
  const { data: usersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['users', currentPage, pageSize, searchTerm],
    queryFn: async () => {
      console.log('Fetching users with params:', { page: currentPage, pageSize, search: searchTerm });
      try {
        const result = await apiService.getUsers({ page: currentPage, pageSize, search: searchTerm });
        console.log('Users API response:', result);
        return result;
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Create user mutation - using auth/register endpoint
  const createMutation = useMutation({
    mutationFn: (data: UserFormValues) => {
      return apiService.register(data);
    },
    onSuccess: (response: any) => {
      console.log('Registration response:', response);
      if (response.success) {
        // Registration successful, now need OTP verification
        setTempRegistrationData(response.data);
        setOtpData({ ...otpData, email: formData.email });
        setIsCreateOpen(false);
        setIsOtpOpen(true);
        toast({ 
          title: 'Registration initiated', 
          description: 'Please check your email for OTP verification',
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create user';
      toast({ 
        title: 'Error creating user', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // OTP verification
  const verifyOtpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => apiService.verifyOtp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOtpOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'User verified and created successfully',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to verify OTP';
      toast({ 
        title: 'Error verifying OTP', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Update user mutation - using correct endpoint and structure
  const updateMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UserFormValues }) => 
      apiService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'User updated successfully',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage = error?.message || 'Failed to update user';
      toast({ 
        title: 'Error updating user', 
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: 'User soft deleted successfully',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Soft delete error:', error);
      const errorMessage = error?.message || 'Failed to soft delete user';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: 'User permanently deleted',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Hard delete error:', error);
      const errorMessage = error?.message || 'Failed to delete user permanently';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Restore user mutation
  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteUser(id),
    onSuccess: (response: any) => {
      console.log('Undelete response:', response);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: response?.data?.message || response?.message || 'User undeleted successfully',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Undelete error:', error);
      const errorMessage = error?.message || 'Failed to restore user';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      contact: '',
    });
    setImageFile(null);
    setSelectedUser(null);
    setTempRegistrationData(null);
    setOtpData({ email: '', otp: '' });
    setShowPassword(false);
  };

  const handleEdit = (user: User) => {
    if (!user) return;
    
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't populate password for security
      contact: user.phone || user.contact || '',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = selectedUser?.id || selectedUser?.userId;
    if (selectedUser && userId) {
      // Update existing user
      console.log('Updating user with ID:', userId);
      console.log('Update data:', formData);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        ...(formData.password && { password: formData.password }) // Only include password if provided
      };
      updateMutation.mutate({ id: userId, userData: updateData });
    } else {
      // Create new user
      console.log('Creating new user:', formData);
      createMutation.mutate(formData);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate(otpData);
  };

  // Data processing with proper null checks
  console.log('Full usersResponse:', usersResponse);
  
  // Handle nested response structure: usersResponse.data.data contains the actual users array
  const responseData = usersResponse?.data;
  const users = Array.isArray(responseData?.data) ? responseData.data : 
                Array.isArray(responseData) ? responseData : [];
  const totalUsers = responseData?.totalCount || responseData?.count || users.length;
  const totalPages = Math.ceil(totalUsers / pageSize);

  console.log('Processed users:', users);
  console.log('Total users:', totalUsers);

  const filteredUsers = users.filter((user: User) =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <UserX className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load users</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Something went wrong while fetching users'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions with professional controls
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Create New User
                  </DialogTitle>
                  <DialogDescription>Add a new user to the system with role assignment</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter secure password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contact" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number
                    </Label>
                    <Input
                      id="contact"
                      placeholder="Enter contact number"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Professional User Management Card */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UsersIcon className="w-6 h-6 text-blue-600" />
                User Directory ({totalUsers} users)
              </CardTitle>
              <CardDescription className="mt-1">
                Professional user management with role-based access control
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">User Info</TableHead>
                  <TableHead className="font-semibold">Role & Status</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user: User) => {
                  const roleInfo = getRoleDisplayInfo(user.role);
                  console.log("role info:", roleInfo);
                  const userPhone = user.phone || user.contact;
                  const userId = user.id || user.userId;
                  const userImage = user.imageUrl || '';
                  console.log("user image:", userImage);
                  console.log("API_BASE_URL:", API_BASE_URL);
                  console.log("Full image URL:", userImage ? `${API_BASE_URL}/${userImage}` : 'No image');
                  
                  return (
                    <TableRow key={userId || user.email} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            {user.imageUrl ? (
                              <img 
                                src={`${API_BASE_URL}/${user.imageUrl}`} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  console.error('Failed to load image:', `${API_BASE_URL}/${user.imageUrl}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <UsersIcon className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className={roleInfo.color}>
                            <Shield className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                          <div>
                            <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {userPhone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-3 h-3" />
                              {userPhone}
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-32" title={user.address}>
                                {user.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log('Soft delete clicked for user:', userId);
                              if (userId) {
                                softDeleteMutation.mutate(userId);
                              }
                            }}
                            disabled={softDeleteMutation.isPending || !userId}
                            className="hover:bg-yellow-50 hover:text-yellow-600"
                          >
                            {softDeleteMutation.isPending ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => userId && unDeleteMutation.mutate(userId)}
                            disabled={unDeleteMutation.isPending || !userId}
                            className="hover:bg-green-50 hover:text-green-600"
                          >
                            {unDeleteMutation.isPending ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user account for <strong>{user.name || 'this user'}</strong> and remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    console.log('Hard delete clicked for user:', userId);
                                    if (userId) {
                                      hardDeleteMutation.mutate(userId);
                                    }
                                  }}
                                  disabled={!userId}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No users found</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first user'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of{' '}
                <span className="font-medium">{totalUsers}</span> results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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
                <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contact">Contact</Label>
                <Input
                  id="edit-contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
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
