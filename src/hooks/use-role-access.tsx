import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Role } from '@/types/api';

export const useRoleAccess = () => {
  const { user } = useContext(AuthContext);
  
  const userRole = user?.role;
  const userRoleId = user?.roleId;
  
  // Check if user is SuperAdmin or Admin (roles 1 or 2)
  const isAdminOrAbove = userRoleId === Role.SuperAdmin || userRoleId === Role.Admin;
  
  // Check if user is SuperAdmin only (role 1)
  const isSuperAdmin = userRoleId === Role.SuperAdmin;
  
  // Check if user is Admin (role 2)
  const isAdmin = userRoleId === Role.Admin;
  
  // Check if user is Vendor (role 3)
  const isVendor = userRoleId === Role.Vendor;
  
  // Check if user is Delivery Boy (role 4)
  const isDeliveryBoy = userRoleId === Role.DeliveryBoy;
  
  // Check if user is regular User/Customer (role 5)
  const isUser = userRoleId === Role.User;
  
  // Check if user has permission for specific actions
  const canManageUsers = isAdminOrAbove;
  const canManageCategories = isAdminOrAbove;
  const canManageProducts = isAdminOrAbove || isVendor;
  const canManageOrders = isAdminOrAbove || isVendor;
  const canManageStores = isAdminOrAbove;
  const canManagePayments = isAdminOrAbove;
  const canViewReports = isAdminOrAbove || isVendor;
  const canManageSettings = isSuperAdmin;
  const canManageRoles = isSuperAdmin; // Only SuperAdmin can change roles
  
  return {
    user,
    userRole,
    userRoleId,
    isAdminOrAbove,
    isSuperAdmin,
    isAdmin,
    isVendor,
    isDeliveryBoy,
    isUser,
    canManageUsers,
    canManageCategories,
    canManageProducts,
    canManageOrders,
    canManageStores,
    canManagePayments,
    canViewReports,
    canManageSettings,
    canManageRoles,
  };
};
