
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  FolderOpen, 
  ShoppingCart, 
  Users, 
  Store, 
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Building,
  FileText,
  ChevronDown,
  ChevronRight,
  Package2,
  FolderPlus,
  Layers,
  Box,
  User,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  {
    name: 'Inventory',
    icon: Package,
    children: [
      { name: 'Categories', href: '/categories', icon: FolderOpen },
      { name: 'SubCategories', href: '/subcategories', icon: FolderPlus },
      { name: 'SubSubCategories', href: '/subsubcategories', icon: Layers },
      { name: 'Products', href: '/products', icon: Package2 },
    ]
  },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Stores', href: '/stores', icon: Store },
  {
    name: 'Payments',
    icon: CreditCard,
    children: [
      { name: 'Payment Methods', href: '/payment-methods', icon: CreditCard },
      { name: 'Payment Requests', href: '/payment-requests', icon: FileText },
    ]
  },
  { name: 'Company Info', href: '/company-info', icon: Building },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory', 'Payments']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActiveParent = (item: any) => {
    if (item.children) {
      return item.children.some((child: any) => location.pathname === child.href);
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/login');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return <Crown className="w-3 h-3" />;
      case 'Admin':
        return <ShieldCheck className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'default'; // Gold/yellow variant
      case 'Admin':
        return 'secondary'; // Blue variant
      default:
        return 'outline';
    }
  };

  const renderNavItem = (item: any) => {
    const isActive = location.pathname === item.href;
    const isParentActive = isActiveParent(item);
    const isExpanded = expandedItems.includes(item.name);

    if (item.children) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              isParentActive
                ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <div className="flex items-center">
              <item.icon className={cn(
                "w-5 h-5 mr-3",
                isParentActive ? "text-blue-600" : "text-gray-500"
              )} />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child: any) => {
                const isChildActive = location.pathname === child.href;
                return (
                  <Link
                    key={child.name}
                    to={child.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isChildActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <child.icon className={cn(
                      "w-4 h-4 mr-3",
                      isChildActive ? "text-blue-600" : "text-gray-500"
                    )} />
                    {child.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
          isActive
            ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <item.icon className={cn(
          "w-5 h-5 mr-3",
          isActive ? "text-blue-600" : "text-gray-500"
        )} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
          IM
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">InstantMart</h1>
          <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map(renderNavItem)}
      </nav>
      
      {/* User Section */}
      {user && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Unknown User'}
              </p>
              <div className="flex items-center space-x-1">
                <Badge 
                  variant={getRoleBadgeVariant(user.role)} 
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{user.role}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 py-4 border-t border-gray-200 space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              disabled={loading}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 justify-start disabled:opacity-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {loading ? 'Logging out...' : 'Logout'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-500" />
                Confirm Logout
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout from InstantMart Admin Panel? You will need to sign in again to access the dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {loading ? 'Logging out...' : 'Yes, Logout'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
