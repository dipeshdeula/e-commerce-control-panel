
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Products from "@/pages/Products";
import { Categories } from "@/pages/Categories";
import { SubCategories } from "@/pages/SubCategories";
import { SubSubCategories } from "@/pages/SubSubCategories";
import { Orders } from "@/pages/Orders";
import { Users } from "@/pages/Users";
import { Stores } from "@/pages/Stores";
import { ProductStores } from "@/pages/ProductStores";
import { Payments } from "@/pages/Payments";
import { PaymentMethods } from "@/pages/PaymentMethods";
import { PaymentRequests } from "@/pages/PaymentRequests";
import { Billing } from "@/pages/Billing";
import BannerEvents from "@/pages/BannerEvents";
import DeliveryManagement from "@/pages/DeliveryManagement";
import { Settings } from "@/pages/Settings";
import { Notifications } from "@/pages/Notifications";
import { CompanyInfo } from "@/pages/CompanyInfo";
import { Reports } from "@/pages/Reports";
import NotFound from "./pages/NotFound";
import PromoCodes from "@/pages/PromoCodes";
import ShippingManagement from "@/pages/ShippingManagement";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { useAppSelector } from "./store";
import { Loader2 } from "lucide-react";
import { setupTokenRefresh } from "@/utils/authInterceptor";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => {
  useEffect(() => {
    // Setup automatic token refresh
    setupTokenRefresh();
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAppSelector(state => state.auth);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subcategories"
        element={
          <ProtectedRoute>
            <Layout>
              <SubCategories />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subsubcategories"
        element={
          <ProtectedRoute>
            <Layout>
               <SubSubCategories /> 
            </Layout>
          </ProtectedRoute>
        }
      /> 
     

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery-management"
        element={
          <ProtectedRoute>
            <Layout>
              <DeliveryManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipping-management"
        element={
          <ProtectedRoute>
            <Layout>
              <ShippingManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stores"
        element={
          <ProtectedRoute>
            <Layout>
              <Stores />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product-stores"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductStores />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Layout>
              <Payments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentMethods />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-requests"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Layout>
              <Billing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/banner-events"
        element={
          <ProtectedRoute>
            <Layout>
              <BannerEvents />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/promo-codes"
        element={
          <ProtectedRoute>
            <Layout>
              <PromoCodes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-info"
        element={
          <ProtectedRoute>
            <Layout>
              <CompanyInfo />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
