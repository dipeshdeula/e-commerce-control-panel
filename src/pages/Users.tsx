import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useFormValidation, FormData, ValidationRules } from '@/hooks/use-form-validation';
import { 
  Role, 
  RoleDisplayNames, 
  UserListDTO, 
  RegisterRequest,
  getRoleNameFromId,
  getRoleDisplayInfo
} from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import Draggable from 'react-draggable';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Eye,
  Plus,
  RefreshCw,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RotateCcw,
  AlertTriangle,
  UserPlus,
  UserCog,
  Shield,
  Move
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const BASE_URL = 'http://110.34.2.30:5013';

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOTPOpen, setIsOTPOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListDTO | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [otp, setOtp] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    contact: '',
  });

  // Validation rules for create and edit forms
  const createValidationRules: ValidationRules = {
    name: true,
    email: true,
    password: true,
    contact: true
  };

  const { errors, isValid, validateForUpdate, setErrors } = useFormValidation(
    formData, 
    isEditOpen ? {} : createValidationRules
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdminOrAbove } = useRoleAccess();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users', currentPage, pageSize],
    queryFn: () => apiService.getUsers(currentPage, pageSize),
  });

  const createMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiService.register(data),
    onSuccess: (response) => {
      console.log('Registration response:', response);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Check multiple possible ways the backend might indicate OTP requirement
      const requiresOTP = response.data?.requiresOTP || 
                         response.data?.requiresVerification || 
                         response.data?.data?.requiresOTP || 
                         response.data?.data?.requiresVerification ||
                         response.data?.message?.toLowerCase().includes('otp') ||
                         response.data?.message?.toLowerCase().includes('verification');
      
      // For admin panel user creation, we'll assume OTP is always required unless explicitly stated otherwise
      const shouldShowOTP = requiresOTP !== false; // Will be true unless explicitly false
      
      if (shouldShowOTP) {
        setRegistrationEmail(formData.email);
        setIsOTPOpen(true);
        toast({ 
          title: 'Registration Initiated', 
          description: 'Please check your email for OTP verification code.',
          className: 'bg-blue-50 border-blue-200 text-blue-800'
        });
      } else {
        setIsCreateOpen(false);
        resetForm();
        toast({ 
          title: 'Success', 
          description: 'User created successfully.',
          className: 'bg-green-50 border-green-200 text-green-800'
        });
      }
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create user',
        variant: 'destructive'
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => apiService.verifyOtp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOTPOpen(false);
      setOtp('');
      setRegistrationEmail('');
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'User verified and created successfully!',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Verification Failed', 
        description: error.message || 'Invalid OTP code',
        variant: 'destructive'
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: number }) => 
      apiService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUpdatingRole(null);
      toast({ 
        title: 'Success', 
        description: 'User role updated successfully',
        className: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    },
    onError: (error: Error) => {
      setUpdatingRole(null);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update user role',
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; email: string; password?: string; contact: string } }) => 
      apiService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditOpen(false);
      resetForm();
      toast({ 
        title: 'Success', 
        description: 'User updated successfully',
        className: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiService.uploadUserImage(userId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: 'User image updated successfully',
        className: 'bg-blue-50 border-blue-200 text-blue-800'
      });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.softDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: 'User moved to trash',
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      });
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.hardDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: 'User permanently deleted',
        className: 'bg-red-50 border-red-200 text-red-800'
      });
    },
  });

  const unDeleteMutation = useMutation({
    mutationFn: (id: number) => apiService.unDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ 
        title: 'Success', 
        description: 'User restored successfully',
        className: 'bg-green-50 border-green-200 text-green-800'
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      contact: '',
    });
    setImageFile(null);
    setSelectedUser(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent, isEdit: boolean = false) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEdit) {
        // For edit form, only validate non-empty fields
        const updateErrors = validateForUpdate();
        if (Object.keys(updateErrors).length > 0) {
          setErrors(updateErrors);
          setIsSubmitting(false);
          return;
        }

        if (selectedUser) {
          // Only send fields that have been modified
          const updateData: Partial<RegisterRequest> = {};
          if (formData.name.trim()) updateData.name = formData.name.trim();
          if (formData.email.trim()) updateData.email = formData.email.trim();
          if (formData.password.trim()) updateData.password = formData.password;
          if (formData.contact.trim()) updateData.contact = formData.contact.trim();

          updateMutation.mutate({ 
            id: selectedUser.userId, 
            data: updateData as { name: string; email: string; password?: string; contact: string }
          });
        }
      } else {
        // For create form, validate all required fields
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }

        createMutation.mutate({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          contact: formData.contact.trim(),
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserListDTO) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      contact: user.contact || '',
    });
    setIsEditOpen(true);
  };

  const handleImageUpload = (userId: number) => {
    if (imageFile) {
      uploadImageMutation.mutate({ userId, file: imageFile });
      setImageFile(null);
    }
  };

  const handleRoleUpdate = (userId: number, newRole: Role) => {
    if (!isAdminOrAbove) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update user roles',
        variant: 'destructive'
      });
      return;
    }
    
    setUpdatingRole(userId);
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleOTPVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit OTP code',
        variant: 'destructive'
      });
      return;
    }
    verifyOTPMutation.mutate({ email: registrationEmail, otp });
  };

  const getRoleLabel = (roleId: number) => {
    return getRoleDisplayInfo(roleId);
  };

  const filteredUsers = users?.data?.filter((user: UserListDTO) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.contact && user.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage your platform users and their information</p>
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
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <Draggable handle=".drag-handle">
              <DialogContent className="sm:max-w-md">
                <form onSubmit={(e) => handleSubmit(e, false)}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 drag-handle cursor-move">
                      <Move className="w-4 h-4 text-gray-400" />
                      <UserPlus className="w-5 h-5 text-blue-500" />
                      Create New User
                    </DialogTitle>
                    <DialogDescription>
                      Add a new user to the platform. They will receive an OTP for verification.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name (alphabetic only)"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@example.com (cannot start with number)"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Phone Number *</Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="9741569852 (must start with 97 or 98)"
                        className={errors.contact ? "border-red-500" : ""}
                      />
                      {errors.contact && (
                        <p className="text-sm text-red-500">{errors.contact}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 8 chars, 1 upper, 1 lower, 1 special"
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || isSubmitting || !isValid} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createMutation.isPending || isSubmitting ? (
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
            </Draggable>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Users Database
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm border-gray-200 focus:border-blue-400"
                />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {filteredUsers.length} users found
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Contact Info</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  {isAdminOrAbove && <TableHead className="font-semibold">Role Management</TableHead>}
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: UserListDTO) => {
                  console.log("User Data: ",user);
                  const roleId = user.roleId || user.role; // Support both possible field names
                  const role = getRoleLabel(roleId);
                  const roleName = getRoleNameFromId(roleId);
                  
                  return (
                    <TableRow key={user.userId} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                            {user.imageUrl ? (
                              <img 
                                src={`${BASE_URL}/${user.imageUrl}`} 
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.userId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{user.email}</span>
                          </div>
                          {user.contact && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{user.contact}</span>
                            </div>
                          )}
                          {user.addresses && user.addresses.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{user.addresses[0].city}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={role.color}>
                          {role.label}
                        </Badge>
                      </TableCell>
                      {isAdminOrAbove && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={roleId?.toString() || "5"}
                              onValueChange={(value) => handleRoleUpdate(user.userId, parseInt(value) as Role)}
                              disabled={updatingRole === user.userId}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(RoleDisplayNames).map(([roleId, roleName]) => (
                                  <SelectItem key={roleId} value={roleId}>
                                    <div className="flex items-center gap-2">
                                      {roleId === '1' && <Shield className="w-3 h-3 text-red-500" />}
                                      {roleId === '2' && <UserCog className="w-3 h-3 text-blue-500" />}
                                      {roleId === '3' && <User className="w-3 h-3 text-green-500" />}
                                      {roleId === '4' && <User className="w-3 h-3 text-yellow-500" />}
                                      {roleId === '5' && <User className="w-3 h-3 text-gray-500" />}
                                      {roleName}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {updatingRole === user.userId && (
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={user.isDeleted ? "destructive" : "default"} className={
                          user.isDeleted 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }>
                          {user.isDeleted ? 'Deleted' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt || user.registeredAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          <ActionTooltip content="View user details and profile information">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </ActionTooltip>
                          
                          <ActionTooltip content="Edit user information (name, email, contact, password)">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </ActionTooltip>
                          
                          {!user.isDeleted ? (
                            <ActionTooltip content="Soft delete user (can be restored later)">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                onClick={() => softDeleteMutation.mutate(user.userId)}
                                disabled={softDeleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </ActionTooltip>
                          ) : (
                            <ActionTooltip content="Restore deleted user account">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                onClick={() => unDeleteMutation.mutate(user.userId)}
                                disabled={unDeleteMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </ActionTooltip>
                          )}
                          
                          {user.isDeleted && (
                            <ActionTooltip content="Permanently delete user (cannot be undone!)">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone!')) {
                                    hardDeleteMutation.mutate(user.userId);
                                  }
                                }}
                                disabled={hardDeleteMutation.isPending}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            </ActionTooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdminOrAbove ? 7 : 6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <User className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No users found</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsCreateOpen(true)}
                        >
                          Create your first user
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
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)} to{' '}
              {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(filteredUsers.length / pageSize))].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink 
                      href="#" 
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className={currentPage * pageSize >= filteredUsers.length ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Draggable handle=".drag-handle">
          <DialogContent className="sm:max-w-md">
            <form onSubmit={(e) => handleSubmit(e, true)}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 drag-handle cursor-move">
                  <Move className="w-4 h-4 text-gray-400" />
                  <Edit className="w-5 h-5 text-blue-500" />
                  Edit User
                </DialogTitle>
                <DialogDescription>
                  Update user information. Leave fields empty to keep current values.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name (optional)</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter new name or leave empty"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email Address (optional)</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter new email or leave empty"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-contact">Phone Number (optional)</Label>
                  <Input
                    id="edit-contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Enter new phone or leave empty"
                    className={errors.contact ? "border-red-500" : ""}
                  />
                  {errors.contact && (
                    <p className="text-sm text-red-500">{errors.contact}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">New Password (optional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password or leave empty"
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-image">Profile Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedUser && imageFile && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleImageUpload(selectedUser.userId)}
                        disabled={uploadImageMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || isSubmitting} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending || isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Draggable>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={isOTPOpen} onOpenChange={setIsOTPOpen}>
        <Draggable handle=".drag-handle">
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleOTPVerification}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 drag-handle cursor-move">
                  <Move className="w-4 h-4 text-gray-400" />
                  <Mail className="w-5 h-5 text-blue-500" />
                  Verify OTP
                </DialogTitle>
                <DialogDescription>
                  Enter the 6-digit verification code sent to <strong>{registrationEmail}</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">Verification Code *</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Please check your email and enter the verification code
                  </p>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsOTPOpen(false);
                    setOtp('');
                    setRegistrationEmail('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={verifyOTPMutation.isPending || otp.length !== 6}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {verifyOTPMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Verify & Complete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Draggable>
      </Dialog>
    </div>
  );
};
