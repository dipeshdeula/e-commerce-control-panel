import React from 'react';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription className="mb-4">
            Failed to load dashboard data: {error}
          </AlertDescription>
          <Button onClick={refetch} variant="outline" size="sm">
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            InstantMart Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Welcome back! Here's what's happening with your marketplace today.
          </p>
        </div>
        <Button 
          onClick={refetch} 
          variant="outline" 
          size="lg"
          className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
        >
          <Loader2 className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <DashboardStats data={data} />

      {/* Recent Activities */}
      <RecentActivity data={data} />
    </div>
  );
};

export default Dashboard;