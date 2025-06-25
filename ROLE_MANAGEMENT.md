# Role Management System

## Overview
The role management feature allows SuperAdmin and Admin users to update user roles through a convenient dropdown interface accessible from the sidebar.

## Role Enum Values
The backend uses integer enum values for roles:
- 1 = SuperAdmin
- 2 = Admin  
- 3 = Vendor
- 4 = DeliveryBoy
- 5 = User

## Features

### Access Control
- Only users with SuperAdmin or Admin roles can access the role management feature
- The feature is automatically hidden for users without proper permissions

### Role Management Interface
- Located in the sidebar below the main navigation
- Opens a side panel showing all users with their current roles
- Provides dropdown selection for changing user roles
- Real-time updates with loading indicators

### API Integration
- **Endpoint**: `PUT /updateUserRole?UserId={userId}`
- **Body**: `{ "role": number }` (1-5 corresponding to role enum)
- **Authentication**: Requires Bearer token

## Usage

1. Log in as SuperAdmin or Admin
2. Click "Manage Roles" in the sidebar
3. Select a user from the list
4. Choose a new role from the dropdown
5. The change is applied immediately with visual feedback

## Components

### RoleManager (`/components/ui/role-manager.tsx`)
- Main component for role management interface
- Handles API calls and state management
- Provides visual feedback for operations

### Role Types (`/types/api.ts`)
- `Role` enum with integer values
- `RoleDisplayNames` mapping for UI display
- `UpdateUserRoleRequest/Response` interfaces

### API Service (`/services/api.ts`)
- `updateUserRole(userId, roleId)` method
- `getUsers()` method for fetching user list

## Security Features
- Role-based access control
- Admin-only functionality enforcement
- JWT token validation
- Error handling with user feedback
