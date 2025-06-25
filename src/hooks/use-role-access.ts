import { useAuth } from '@/hooks/use-auth';

// Helper hook for role-based UI rendering
export const useRoleAccess = () => {
  const { user } = useAuth();
  
  return {
    isSuperAdmin: user?.role === 'SuperAdmin' || user?.roleId === 1,
    isAdmin: user?.role === 'Admin' || user?.roleId === 2,
    isAdminOrAbove: (user?.role === 'SuperAdmin' || user?.role === 'Admin') || 
                   (user?.roleId === 1 || user?.roleId === 2),
    hasRole: (roleName: string) => user?.role === roleName,
    hasRoleId: (roleId: number) => user?.roleId === roleId,
    hasAnyRole: (roleNames: string[]) => user ? roleNames.includes(user.role) : false,
    hasAnyRoleId: (roleIds: number[]) => user && user.roleId ? roleIds.includes(user.roleId) : false,
    userRole: user?.role,
    userRoleId: user?.roleId,
  };
};
