import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Role, getRoleDisplayInfo, getRoleNameFromId, getRoleIdFromName, RoleDisplayNames } from '@/types/api';
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
  MapPin,
  Settings,
  Camera,
  Upload,
  Image
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api.config';
import { NEPAL_PROVINCES, getCitiesByProvince, NEPAL_CITIES } from '@/constants/nepal-locations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface AddressFormValues {
  id?: number;
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const Users: React.FC = () => {
  // Normalize province/city to known values so Selects bind correctly
  const normalizeProvince = (province?: string): string => {
    if (!province) return '';
    const pTrim = province.replace(/\s*Province$/i, '').trim();
    const match = NEPAL_PROVINCES.find(
      (p) => p.value.toLowerCase() === pTrim.toLowerCase() || p.label.toLowerCase() === province.toLowerCase()
    );
    return match ? match.value : pTrim;
  };

  const normalizeCity = (city?: string, province?: string): string => {
    if (!city) return '';
    const prov = normalizeProvince(province || '');
    const cities = getCitiesByProvince(prov);
    const match = cities.find((c) => c.value.toLowerCase() === city.toLowerCase() || c.label.toLowerCase() === city.toLowerCase());
    return match ? match.value : city;
  };

  console.log('Users component rendering...');
  
  // Error state for component-level error handling
  const [componentError, setComponentError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isRoleUpdateOpen, setIsRoleUpdateOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isAddressUpdateOpen, setIsAddressUpdateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(Role.User);
  const [tempRegistrationData, setTempRegistrationData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormValues>({
    label: 'home',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: undefined,
    longitude: undefined,
    isDefault: false,
  });
  const [userAddresses, setUserAddresses] = useState<AddressFormValues[]>([]);
  const [addressSelectValue, setAddressSelectValue] = useState<string>('new');
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

  // Component error boundary
  if (componentError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <UserX className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Error</h3>
        <p className="text-gray-600 mb-4">{componentError}</p>
        <Button 
          onClick={() => {
            setComponentError(null);
            window.location.reload();
          }} 
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Page
        </Button>
      </div>
    );
  }

  // Get current user role from token for authorization
  const getCurrentUserRole = (): string => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return '';
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch {
      return '';
    }
  };

  // Helper function to extract role ID from user object
  const getUserRoleId = (user: User): number => {
    try {
      if (user.roleId && typeof user.roleId === 'number') {
        return user.roleId;
      }
      if (user.role && typeof user.role === 'number') {
        return user.role;
      }
      if (typeof user.role === 'string') {
        return getRoleIdFromName(user.role);
      }
      return Role.User; // Default fallback
    } catch (error) {
      console.error('Error extracting user role:', error, user);
      return Role.User;
    }
  };

  // Check if current user can update roles (SuperAdmin or Admin only)
  const canUpdateRoles = (): boolean => {
    const currentRole = getCurrentUserRole();
    return currentRole === 'SuperAdmin' || currentRole === 'Admin';
  };

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

  // Role update mutation with optimistic UI so no manual refresh is needed
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: number }) => apiService.updateUserRole(userId, role),
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: ['users', currentPage, pageSize, searchTerm] });
      const previous = queryClient.getQueryData<any>(['users', currentPage, pageSize, searchTerm]);
      queryClient.setQueryData(['users', currentPage, pageSize, searchTerm], (old: any) => {
        if (!old) return old;
        const clone = JSON.parse(JSON.stringify(old));
        const arr = Array.isArray(clone?.data?.data) ? clone.data.data : Array.isArray(clone?.data) ? clone.data : [];
        const target = arr.find((u: any) => (u.id || u.userId) === userId);
        if (target) {
          target.roleId = role;
          target.role = role;
        }
        return clone;
      });
      return { previous };
    },
    onError: (error: any, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['users', currentPage, pageSize, searchTerm], ctx.previous);
      const errorMessage = error?.message || 'Failed to update user role';
      toast({ title: 'Error updating role', description: errorMessage, variant: 'destructive', duration: 4000 });
    },
    onSuccess: (response: any) => {
      // Background refresh for consistency
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsRoleUpdateOpen(false);
      setSelectedUser(null);
      setSelectedRole(Role.User);
      const desc = typeof response?.message === 'string' ? response.message : 'User role updated successfully';
      toast({ title: 'Success', description: desc, duration: 3000 });
    },
  });

  // Image upload mutation (POST /user/upload?userId=.. with field 'file')
  const uploadImageMutation = useMutation({
    mutationFn: ({ userId, imageFile }: { userId: number; imageFile: File }) => apiService.uploadUserImage(userId, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsImageUploadOpen(false);
      setImageFile(null);
      setSelectedUser(null);
      toast({ 
        title: 'Success', 
        description: 'User image updated successfully',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Image update error:', error);
      const errorMessage = error?.message || 'Failed to update user image';
      toast({ 
        title: 'Error updating image', 
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Address mutations: add and update
  const addAddressMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: AddressFormValues }) => 
      apiService.addUserAddress(userId, {
        label: data.label,
        street: data.street,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddressUpdateOpen(false);
      setSelectedUser(null);
      setUserAddresses([]);
      setAddressSelectValue('new');
      setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
      toast({ title: 'Success', description: 'Address added successfully', duration: 3000 });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to add address';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive', duration: 5000 });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ addressId, data }: { addressId: number; data: AddressFormValues }) => 
      apiService.updateUserAddress(addressId, {
        label: data.label,
        street: data.street,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddressUpdateOpen(false);
      setSelectedUser(null);
      setUserAddresses([]);
      setAddressSelectValue('new');
      setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
      toast({ title: 'Success', description: 'Address updated successfully', duration: 3000 });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update address';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive', duration: 5000 });
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
  setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
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

  const handleRoleUpdate = (user: User) => {
    try {
      if (!user) {
        console.error('No user provided to handleRoleUpdate');
        return;
      }
      
      if (!canUpdateRoles()) {
        toast({
          title: 'Access Denied',
          description: 'Only SuperAdmin or Admin can update user roles',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }
      
      console.log('Selected user for role update:', user);
      const userRoleId = getUserRoleId(user);
      console.log('Extracted user role ID:', userRoleId);
      
      setSelectedUser(user);
      setSelectedRole(userRoleId);
      setIsRoleUpdateOpen(true);
    } catch (error) {
      console.error('Error in handleRoleUpdate:', error);
      toast({
        title: 'Error',
        description: 'Failed to open role update dialog',
        variant: 'destructive',
        duration: 3000,
      });
    }
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

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedUser) {
        toast({
          title: 'Error',
          description: 'No user selected',
          variant: 'destructive',
        });
        return;
      }
      
      const userId = selectedUser.id || selectedUser.userId;
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID not found',
          variant: 'destructive',
        });
        return;
      }

      // Check if the role is actually being changed
      const currentRoleId = getUserRoleId(selectedUser);
      console.log('Comparing roles - Current:', currentRoleId, 'Selected:', selectedRole);
      
      if (currentRoleId === selectedRole) {
        toast({
          title: 'No Changes',
          description: 'The selected role is the same as the current role',
          variant: 'destructive',
          duration: 3000,
        });
        return;
      }

      console.log('Submitting role update:', { userId, role: selectedRole });
      updateRoleMutation.mutate({ userId, role: selectedRole });
    } catch (error) {
      console.error('Error in handleRoleSubmit:', error);
      toast({
        title: 'Error',
        description: 'Failed to process role update',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleImageUpload = (user: User) => {
    try {
      if (!user) {
        console.error('No user provided to handleImageUpload');
        return;
      }
      
      const userId = user.id || user.userId;
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID not found',
          variant: 'destructive',
        });
        return;
      }

      setSelectedUser(user);
      setIsImageUploadOpen(true);
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      toast({
        title: 'Error',
        description: 'Failed to open image upload dialog',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleAddressUpdate = async (user: User) => {
    try {
      if (!user) {
        console.error('No user provided to handleAddressUpdate');
        return;
      }
      
      const userId = user.id || user.userId;
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID not found',
          variant: 'destructive',
        });
        return;
      }

      setSelectedUser(user);
      setIsAddressUpdateOpen(true);
      // Prefer using addresses available on the user row to prefill immediately
      const rowAddresses = ((user as any)?.addresses || (user as any)?.addressList || []) as any[];
    if (Array.isArray(rowAddresses) && rowAddresses.length > 0) {
        const normalized = rowAddresses.map((a: any) => ({
          id: a.id,
          label: a.label ?? a.name ?? 'home',
      street: a.street ?? a.address ?? '',
      city: normalizeCity(a.city ?? '', a.province),
      province: normalizeProvince(a.province ?? ''),
          postalCode: a.postalCode ?? a.zip ?? '',
          latitude: a.latitude ?? undefined,
          longitude: a.longitude ?? undefined,
          isDefault: a.isDefault ?? false,
        }));
        setUserAddresses(normalized);
        const preferred = normalized.find((a) => a.isDefault) || normalized[0];
        setAddressForm(preferred);
        setAddressSelectValue(preferred?.id ? String(preferred.id) : 'new');
      } else {
        // Fallback: fetch addresses if not present on row
        try {
          const resp = await apiService.getUserById(userId);
          const udata = resp?.data?.data || resp?.data || {};
          const addresses = (udata.addresses || udata.AddressList || udata.addressList || []) as any[];
          const normalized = addresses.map((a: any) => ({
            id: a.id,
            label: a.label ?? a.name ?? 'home',
            street: a.street ?? a.address ?? '',
            city: normalizeCity(a.city ?? '', a.province),
            province: normalizeProvince(a.province ?? ''),
            postalCode: a.postalCode ?? a.zip ?? '',
            latitude: a.latitude ?? undefined,
            longitude: a.longitude ?? undefined,
            isDefault: a.isDefault ?? false,
          }));
          setUserAddresses(normalized);
          const preferred = normalized.find((a) => a.isDefault) || normalized[0];
          if (preferred) {
            setAddressForm(preferred);
            setAddressSelectValue(preferred.id ? String(preferred.id) : 'new');
          } else {
            setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
            setAddressSelectValue('new');
          }
        } catch (err) {
          console.warn('Failed to load user addresses, proceeding with empty form', err);
          setUserAddresses([]);
          setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
          setAddressSelectValue('new');
        }
      }
    } catch (error) {
      console.error('Error in handleAddressUpdate:', error);
      toast({
        title: 'Error',
        description: 'Failed to open address update dialog',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedUser) {
        toast({
          title: 'Error',
          description: 'No user selected',
          variant: 'destructive',
        });
        return;
      }
      
      const userId = selectedUser.id || selectedUser.userId;
      if (!userId || !imageFile) {
        toast({
          title: 'Error',
          description: 'User ID not found or no image selected',
          variant: 'destructive',
        });
        return;
      }

  console.log('Submitting image upload:', { userId, imageFile: imageFile.name });
  uploadImageMutation.mutate({ userId, imageFile });
    } catch (error) {
      console.error('Error in handleImageSubmit:', error);
      toast({
        title: 'Error',
        description: 'Failed to process image update',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedUser) {
        toast({
          title: 'Error',
          description: 'No user selected',
          variant: 'destructive',
        });
        return;
      }
      
      const userId = selectedUser.id || selectedUser.userId;
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID not found',
          variant: 'destructive',
        });
        return;
      }
      // Decide add vs update: if addressForm has an id, update that address; otherwise add a new one
      if (addressForm.id) {
        updateAddressMutation.mutate({ addressId: addressForm.id, data: { ...addressForm } });
      } else {
        addAddressMutation.mutate({ userId, data: addressForm });
      }
    } catch (error) {
      console.error('Error in handleAddressSubmit:', error);
      toast({
        title: 'Error',
        description: 'Failed to process address update',
        variant: 'destructive',
        duration: 3000,
      });
    }
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

          {canUpdateRoles() && (
            <div className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
              <Shield className="w-3 h-3 inline mr-1" />
              Role Management Enabled
            </div>
          )}
          
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
                  
                  {/* Address excluded from registration payload by requirement */}
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
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold">Deleted</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user: User) => {
                  try {
                    const userRoleId = getUserRoleId(user);
                    const roleInfo = getRoleDisplayInfo(userRoleId);
                    console.log("User data for role update debug:", {
                      name: user.name,
                      roleId: user.roleId,
                      role: user.role,
                      extractedRoleId: userRoleId,
                      roleInfo: roleInfo,
                      id: user.id,
                      userId: user.userId
                    });
                    const userPhone = user.phone || user.contact;
                    const userId = user.id || user.userId;
                    const userImage = user.imageUrl || '';
                    // Derive display address from addresses[] if available, or fallback to user.address
                    const addrArray: any[] = Array.isArray((user as any)?.addresses)
                      ? (user as any).addresses
                      : Array.isArray((user as any)?.addressList)
                        ? (user as any).addressList
                        : [];
                    const preferredAddr = addrArray.find((a) => a?.isDefault) || addrArray[0];
                    const displayAddress = preferredAddr
                      ? [preferredAddr.street, preferredAddr.city, preferredAddr.province, preferredAddr.postalCode]
                          .filter(Boolean)
                          .join(', ')
                      : (user as any).address || '';
                    
                    const isDeleted = user.isDeleted === true;
                    return (
                    <TableRow key={userId || user.email} className={`${isDeleted ? 'opacity-60 bg-red-50' : ''} hover:bg-gray-50/50`}>
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
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={roleInfo.color}>
                              <Shield className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </Badge>
                            {/* Role quick-edit button removed as role update is handled elsewhere */}
                          </div>
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
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-48" title={displayAddress || 'No address'}>
                            {displayAddress || '—'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={isDeleted ? 'destructive' : 'outline'} className="text-xs">
                          {isDeleted ? 'Deleted' : 'Not Deleted'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit user</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleImageUpload(user)}
                                  className="hover:bg-green-50 hover:text-green-600"
                                >
                                  <Camera className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Upload profile image</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddressUpdate(user)}
                                  className="hover:bg-orange-50 hover:text-orange-600"
                                >
                                  <MapPin className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add / edit address</TooltipContent>
                            </Tooltip>

                            {/* Role update button removed from Actions as it exists under Role & Status */}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (userId) softDeleteMutation.mutate(userId);
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
                              </TooltipTrigger>
                              <TooltipContent>Soft delete</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
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
                              </TooltipTrigger>
                              <TooltipContent>Undelete</TooltipContent>
                            </Tooltip>

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
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  } catch (error) {
                    console.error('Error rendering user row:', error, user);
                    return (
                      <TableRow key={user.id || user.userId || user.email}>
                        <TableCell colSpan={6} className="text-center py-4 text-red-500">
                          Error displaying user: {user.name || 'Unknown'}
                        </TableCell>
                      </TableRow>
                    );
                  }
                }) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
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

      {/* Role Update Dialog */}
      <Dialog 
        key={selectedUser?.id || selectedUser?.userId || 'role-dialog'}
        open={isRoleUpdateOpen} 
        onOpenChange={(open) => {
          console.log('Dialog open state changed to:', open);
          setIsRoleUpdateOpen(open);
          if (!open) {
            console.log('Closing dialog - resetting state');
            setSelectedUser(null);
            setSelectedRole(Role.User);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <form onSubmit={handleRoleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Update User Role
              </DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name || 'selected user'}. This action requires admin privileges.
                {/* Debug info - remove in production */}
                {selectedUser && process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Debug: roleId={selectedUser.roleId}, roleStr={selectedUser.role}, extracted={getUserRoleId(selectedUser)}, selected={selectedRole}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="role-select" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Select New Role
                </Label>
                <Select 
                  value={selectedRole.toString()} 
                  onValueChange={(value) => {
                    const newRole = parseInt(value);
                    console.log('Role dropdown changed:', value, '=>', newRole, getRoleNameFromId(newRole));
                    setSelectedRole(newRole);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-red-600" />
                        SuperAdmin
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-orange-600" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-blue-600" />
                        Vendor
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-green-600" />
                        Delivery Boy
                      </div>
                    </SelectItem>
                    <SelectItem value="5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-gray-600" />
                        User
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">Security Notice</p>
                    <p className="text-amber-700">
                      Role changes take effect immediately. Ensure you're assigning the appropriate permissions.
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">Current Role:</span>
                      <Badge 
                        variant="outline" 
                        className="text-blue-700 border-blue-300"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleNameFromId(getUserRoleId(selectedUser))}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">New Role:</span>
                      <Badge 
                        variant="default" 
                        className={
                          selectedRole === getUserRoleId(selectedUser)
                            ? "bg-gray-500"
                            : "bg-purple-600"
                        }
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleNameFromId(selectedRole)}
                      </Badge>
                    </div>
                    {selectedRole === getUserRoleId(selectedUser) && (
                      <div className="text-xs text-amber-600 mt-2 flex items-center gap-1 p-2 bg-amber-50 rounded border border-amber-200">
                        <Shield className="w-3 h-3" />
                        No changes will be made (same role selected)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsRoleUpdateOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateRoleMutation.isPending || !selectedUser}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Update Role
                  </>
                )}
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
              {/* Address excluded from update payload by requirement */}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleImageSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-green-600" />
                Update Profile Image
              </DialogTitle>
              <DialogDescription>
                Upload a new profile image for {selectedUser?.name || 'this user'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {selectedUser?.imageUrl && (
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={`${API_BASE_URL}/${selectedUser.imageUrl}`} 
                      alt={selectedUser.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="image-upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Select New Image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                  required
                />
                {imageFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsImageUploadOpen(false);
                  setImageFile(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploadImageMutation.isPending || !imageFile}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploadImageMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Address Add/Edit Dialog */}
      <Dialog open={isAddressUpdateOpen} onOpenChange={setIsAddressUpdateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddressSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                {addressForm.id ? 'Edit Address' : 'Add Address'}
              </DialogTitle>
              <DialogDescription>
                {selectedUser?.name ? `Manage addresses for ${selectedUser.name}` : 'Manage addresses'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {userAddresses.length > 0 && (
                <div className="grid gap-2">
                  <Label>Select existing address (optional)</Label>
                  <Select value={addressSelectValue} onValueChange={(val) => {
                    if (val === 'new') {
                      setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
                      setAddressSelectValue('new');
                      return;
                    }
                    const addr = userAddresses.find((a) => String(a.id) === val);
                    if (addr) {
                      setAddressForm(addr);
                      setAddressSelectValue(val);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose address or create new" />
                    </SelectTrigger>
                    <SelectContent>
                      {userAddresses.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.label} • {a.street}, {a.city}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ New address…</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input id="postal" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="province">Province</Label>
                <Select value={addressForm.province} onValueChange={(value) => setAddressForm({ ...addressForm, province: value, city: '' })}>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEPAL_PROVINCES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Select value={addressForm.city} onValueChange={(value) => setAddressForm({ ...addressForm, city: value })} disabled={!addressForm.province}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder={addressForm.province ? 'Select city' : 'Select province first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCitiesByProvince(addressForm.province).map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" type="number" step="any" value={addressForm.latitude ?? ''} onChange={(e) => setAddressForm({ ...addressForm, latitude: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" type="number" step="any" value={addressForm.longitude ?? ''} onChange={(e) => setAddressForm({ ...addressForm, longitude: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="isDefault" type="checkbox" className="h-4 w-4" checked={!!addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                <Label htmlFor="isDefault">Set as default</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddressUpdateOpen(false);
                setAddressForm({ label: 'home', street: '', province: '', city: '', postalCode: '', latitude: undefined, longitude: undefined, isDefault: false });
                setAddressSelectValue('new');
              }}>Cancel</Button>
              <Button type="submit" disabled={(addAddressMutation.isPending || updateAddressMutation.isPending) || !addressForm.street || !addressForm.province || !addressForm.city} className="bg-orange-600 hover:bg-orange-700">
                {(addAddressMutation.isPending || updateAddressMutation.isPending) ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    {addressForm.id ? 'Update Address' : 'Add Address'}
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
