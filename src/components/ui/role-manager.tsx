import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  UserListDTO, 
  Role, 
  RoleDisplayNames, 
  UpdateUserRoleResponse 
} from '@/types/api';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Shield, Users, Loader2, Save } from 'lucide-react';

interface RoleManagerProps {
  trigger?: React.ReactNode;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ trigger }) => {
  const [users, setUsers] = useState<UserListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { isAdminOrAbove } = useRoleAccess();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  // Only allow SuperAdmin and Admin to access this feature
  if (!isAdminOrAbove) {
    return null;
  }

  const updateUserRole = async (userId: number, newRole: Role) => {
    try {
      setUpdating(userId);
      const response = await apiService.updateUserRole(userId, newRole);
      
      if (response.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.userId === userId 
              ? { ...user, roleId: newRole, role: RoleDisplayNames[newRole] }
              : user
          )
        );
        
        toast({
          title: "Role Updated",
          description: `User role successfully updated to ${RoleDisplayNames[newRole]}`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case Role.SuperAdmin:
        return "bg-red-100 text-red-800 border-red-200";
      case Role.Admin:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case Role.Vendor:
        return "bg-green-100 text-green-800 border-green-200";
      case Role.DeliveryBoy:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case Role.User:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    >
      <UserCog className="w-4 h-4" />
      Manage Roles
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            User Role Management
          </SheetTitle>
          <SheetDescription>
            Manage user roles and permissions. Only SuperAdmin and Admin can modify user roles.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Total Users: {users.length}
                </span>
              </div>

              {users.map((user) => (
                <Card key={user.userId} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={getRoleColor(user.roleId)}
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(user.registeredAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          value={user.roleId.toString()}
                          onValueChange={(value) => 
                            updateUserRole(user.userId, parseInt(value) as Role)
                          }
                          disabled={updating === user.userId}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RoleDisplayNames).map(([roleId, roleName]) => (
                              <SelectItem key={roleId} value={roleId}>
                                {roleName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {updating === user.userId && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {users.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
